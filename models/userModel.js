'use strict'

const fs = require('fs');
const moment = require('moment')

const connection = require('../config/db_setup');
const {isEmpty, isValidAge, ageToDate, dateBirthtoYYYYMMDD} = require('../tools/utils')
const {isCompleted} = require('../tools/dataValidator')
/** 
 * Classic queries 
 * **/
const update = (userObj) => {
	const table = userObj.table
	const fields = userObj.fields
	const where = userObj.where

	const firstP = Object.keys(where)[0]
	const secondP = Object.keys(where)[1]

	//Multiple update
	const sqlsimple = 'UPDATE '+ table +' SET ? WHERE ?'
	const sqlmultiple = 'UPDATE '+ table +' SET ? WHERE ? AND ?'

	const sql = (Object.keys(where).length === 2) ? sqlmultiple : sqlsimple
	const params = (Object.keys(where).length === 2) ? [fields, {[firstP] : Object.values(where)[0]}, {[secondP] : Object.values(where)[1]}] : [fields, {[firstP] : Object.values(where)[0]}]
	const currentTime = Date.now()
	if (params[0].lastCon || params[0].loveTime) {
		let sqlCon = 'UPDATE '+ table +' SET `lastCon` = TIMESTAMP('+currentTime+'), `latitude` = ?, `longitude` = ?, `address` = ? WHERE ?'
		let sqlPop = 'UPDATE '+ table +' SET `love` = ?, `loveTime` = TIMESTAMP(?) WHERE ? AND ?'

		let values = (params[0].lastCon) ? [params[0].latitude, params[0].longitude, params[0].address, params[1]] : [params[0].love, params[0].loveTime, params[1], params[2]]
		let sqlFinal = (params[0].lastCon) ? sqlCon : sqlPop

		return new Promise((resolve, reject) => {
			let query = connection.query(sqlFinal, values, (err, user) => {
				(err) ? reject(err) : resolve(user)
			})
		})
	} else {
		return new Promise((resolve, reject) => {
			let query = connection.query(sql, params, (err, user) => {
				(err) ? reject(err) : resolve(user)
			})
		})
	}
}

const upComplete = async (id, needUsr = false) => {
	let userObj = await findOne({id: id})
	let records = await selectAllPhotos(id)
	if (isCompleted(userObj, records)) {
		await update({table: 'User', fields:{isCompleted: 1}, where:{id: userObj.id} })
	} else {
		await update({table: 'User', fields:{isCompleted: 0}, where:{id: userObj.id} })
	}
	if (needUsr) {
		return findOne({id: id})
	}
}

/**
 * Popularity queries
 * **/
const addPopularity = (userObj) => {
	const userData = [userObj.userid, userObj.seenbyid, userObj.love, userObj.seenTime]
	const sql = 'INSERT INTO Popularity (userid, seenbyid, love, seenTime) VALUES (?, ?, ?, TIMESTAMP(?))'
	return new Promise((resolve, reject) => {
		connection.query(sql, userData, (err, user) => {
			(err) ? reject(err) : resolve(user)
		})
	})
}

//Anciennement getPopularity
const getScoreFromPopularity = (userObj) => {
	const userid = userObj.userid
	//Popularity's score 
	const sql = 'SELECT SUM(love) AS Score FROM Popularity WHERE userid = ? '

	return new Promise((resolve, reject) => {
		connection.query(sql, [userid], (err, sum) => {
			if (err) reject(err)
			if (!sum[0]) { resolve(null) }
			else { resolve(sum[0].Score) }
		})
	})
}

const getActivity = (userObj) => {
	const userid = userObj.userid
	const sql = 'SELECT * FROM Popularity WHERE userid=?'

	return new Promise((resolve, reject) => {
		connection.query(sql, [userid], (err, rows) => {
			if (err) {
				reject(err)
			} else {
				if (!rows.length) { resolve(rows) }
				let v = [], l = [] , final = []

				rows.forEach((row, idx) => {
					v[idx] = {}, l[idx] = {}

					v[idx].seenbyid = row.seenbyid
					l[idx].seenbyid = row.seenbyid

					v[idx].time = row.seenTime

					if (row.love === 1) {
						l[idx].love = row.love
						l[idx].time = row.loveTime
						final.push(l[idx])
					}
					final.push(v[idx])
				})

				final = final.sort((a, b) => {
					return new Date(b.time) - new Date(a.time);
				})

				resolve(final)
			}
		})
	})
}

const insertMatched = (userone, usertwo) => {
	let today = Date.now()
	const sql = 'INSERT INTO Matched (userone, usertwo, matchTime) VALUES (?,?,TIMESTAMP(?))'

	return new Promise((resolve, reject) => {
		connection.query(sql, [userone, usertwo, today], (e, success) => {
			// if (err) { reject(err) }
			// else {
				// connection.query(sql, [loverid, userid], (e, finished) => {
					(e) ? reject(e) : resolve(success)
				// })
			// }
		})
	})
}

const deleteMatched = (userid, loverid) => {
	const sql = 'DELETE FROM Matched WHERE userone=? && usertwo=? || userone=? && usertwo=?'

	return new Promise((resolve, reject) => {
		connection.query(sql, [userid, loverid, loverid, userid], (err, success) => {
			(err) ? reject(err) : resolve(success)
		})
	})
}

const didMatch = (useroneid, usertwoid) => {
	const sql = 'SELECT * FROM Matched WHERE userone=? && usertwo=? || userone=? && usertwo=?'

	return new Promise((resolve, reject) => {
		connection.query(sql, [useroneid, usertwoid, usertwoid, useroneid], (err, match) => {
			(err) ? reject (err) : resolve(match)
		})
	})
}

const insertMsg = (msgObj) => {
	const sql = 'INSERT INTO Messages (text, senderid, receiverid, sendTime) VALUES (?,?,?,TIMESTAMP(?))'
	let data = [
		msgObj.text,
		msgObj.senderid,
		msgObj.receiverid,
		Date.now()
	]

	return new Promise((resolve, reject) => {
		connection.query(sql, data, (e,success) => {
			(e) ? reject(e) : resolve(success)
		})
	})
}

const getRoomMsg = (useroneId, usertwoId) => {
	const sql = 'SELECT * FROM Messages WHERE senderid=? && receiverid=? || receiverid=? && senderid=? ORDER BY sendTime'

	return new Promise((resolve, reject) => {
		connection.query(sql, [useroneId,usertwoId,useroneId,usertwoId], (e, msg) => {
			if (e) reject(e)
			else {
				msg.map(x => x.sendTime = moment(x.sendTime).format("YYYY-MM-DD HH:mm:ss"))
				resolve(msg)
			}
		})
	})
}

const deleteMsg = (senderid,receiverid) => {
	const sql = 'DELETE FROM Messages WHERE senderid=? && receiverid=? || receiverid=? && senderid=?'

	return new Promise((resolve, reject) => {
		connection.query(sql, [senderid,receiverid,receiverid,senderid], (e,success) => {
			(e) ? reject(e) : resolve(success)
		})
	})
}

const getAllMatchFromUser = (userid) => {
	const sql = 'SELECT * FROM Matched WHERE userone=? || usertwo=?'

	return new Promise((resolve, reject) => {
		connection.query(sql, [userid, userid], (e,matchs) => {
			if (e) { reject(e) 
			} else {
				if (matchs.length) {
					matchs.map(x => x.matchTime = moment(x.matchTime).format("YYYY-MM-DD HH:mm:ss"))
				}
				resolve(matchs)
			}
		})
	})
}

const insertSocketOn = (socketObj) => {
	const sql = 'INSERT INTO SocketInfo (userid, socketid) VALUES (?,?)'

	return new Promise((resolve, reject) => {
		connection.query(sql, [socketObj.userid, socketObj.socketid], (e, success) => {
			(e) ? reject(e) : resolve(success)
		})
	})
}

const getAllUserConnected = () => {
	const sql = 'SELECT * FROM SocketInfo'

	return new Promise((resolve, reject) => {
		connection.query(sql, (e, socketInfo) => {
			(e) ? reject(e) : resolve(socketInfo)
		})
	})
}

const isUserConnected = (userid) => {
	const sql = 'SELECT * FROM SocketInfo WHERE userid=?'

	return new Promise((resolve, reject) => {
		connection.query(sql, [userid], (e, socketInfo) => {
			(e) ? reject(e) : resolve(socketInfo)
		})
	})
}

const deleteSocketInfo = (socketid) => {
	const sql = 'DELETE FROM SocketInfo WHERE socketid=?'

	return new Promise((resolve, reject) => {
		connection.query(sql, [socketid], (e,deleted) => {
			(e) ? reject(e) : resolve(deleted)
		})
	})
}

const didLike = (usr,seenusr) => {
	const sql = 'SELECT * FROM Popularity WHERE userid = ? AND seenbyid = ?'

	return new Promise((resolve, reject) => {
		connection.query(sql, [usr, seenusr], (err, row) => {
			if (err) reject(err)
			resolve(row)
		})
	})
}

const upsertPop = async (userObj, io) => {
	const usrid = userObj.where.usr 
	const seenbyid = userObj.where.seen//current logged
	const like = (userObj.where.love) ? parseInt(userObj.where.love) : 0
	let switchLoveRowTmp = null
	let currentTime = Date.now()
	return new Promise((resolve, reject) => {
		didLike(usrid, seenbyid).then(loveRow => {
			if (!loveRow.length) {
				return addPopularity({userid: usrid, seenbyid: seenbyid, love: like, seenTime: currentTime})
			} else {
				if (like === 1) {
					return update({table: "Popularity", fields: {love: like, loveTime: currentTime}, where: {userid: usrid, seenbyid: seenbyid}})
				} else {
					return update({table: "Popularity", fields: {love: like, loveTime: 0}, where: {userid: usrid, seenbyid: seenbyid}})
				}
			}
		}).then(upsert => {
			return getScoreFromPopularity({userid: usrid})
		}).then(score => {
			return upScoreUsr(score, usrid)
		}).then(finished => {
			return didLike(seenbyid, usrid)
		}).then((swithLoveRow) => {
			switchLoveRowTmp = swithLoveRow
			return didMatch(usrid, seenbyid)
		}).then(async match => {
			let isblocked = await isInBlacklist(usrid, seenbyid);
			let isblocked2 = await isInBlacklist(seenbyid, usrid);
			if (isblocked === null && isblocked2 === null){
				if (switchLoveRowTmp.length) {
					if (switchLoveRowTmp[0].love == 1 && like == 1 && !match.length) {
						await insertNotif({senderid: usrid, receiverid: seenbyid, notitype: "matched"})
						await insertNotif({senderid: seenbyid, receiverid: usrid, notitype: "matched"})
						let socket2 = await isUserConnected(seenbyid);
						let socket = await isUserConnected(usrid);
						if(socket2 && socket2.length > 0) {
							for (let index = 0; index < socket2.length; index++) {
								io.to(`${socket2[index].socketid}`).emit('CLIENT/ADD_MATCH', {
									msg: ' IT\'S A MATCH',
									username1: 'Good job ',
									notitime: moment().format('DD-MM-YYYY HH:mm:ss'),
									isRead: 0
								})
							}
						}
						if(socket && socket.length > 0) {
							for (let index = 0; index < socket.length; index++) {
								io.to(`${socket[index].socketid}`).emit('CLIENT/ADD_MATCH', {
									msg: ' IT\'S A MATCH',
									username1: 'Good job',
									notitime: moment().format('DD-MM-YYYY HH:mm:ss'),
									isRead: 0
								})
							}
						}
						return insertMatched(usrid, seenbyid)
					}
					if ((!switchLoveRowTmp[0].love || !like) && match.length) {
						await insertNotif({senderid: seenbyid, receiverid: usrid, notitype: "unmatched"})
						let username2 = await getProfilePic(match[0].usertwo)
						let socket = await isUserConnected(usrid);
						if(socket && socket.length > 0) {
							for (let index = 0; index < socket.length; index++) {
								io.to(`${socket[index].socketid}`).emit('CLIENT/ADD_UNMATCH', {
									msg: " UNMATCHED YOU :(",
									username1: username2[0].username,
									notitime: moment().format('DD-MM-YYYY HH:mm:ss'),
									isRead: 0
								})
							}
						}
						return deleteMatched(usrid, seenbyid)
					}
				}
			}
		})
		.catch(e => {
			reject(e)
		}).then((response_act) => { resolve(response_act) })
	})
}

const getScore = (userid) => {
	const sql = 'SELECT score FROM User WHERE id=?;'
	return new Promise((resolve, reject) => {
		connection.query(sql, [userid], (err, score) => {
			if (err) reject(err)
			if (!score[0]) { resolve(null) } 
			else { resolve(score[0].score) }
		})
	})
}

//Anciennement upScore
const SCR_COEF = 2
const upScoreUsr = (score, userid) => {

	let scorePop = parseInt(score) * SCR_COEF
	const sql = 'UPDATE User SET score ='+scorePop+' WHERE id=?;'

	return new Promise((resolve, reject) => {
		connection.query(sql, [userid], (err, user) => {
			(err) ? reject(err) : resolve(user)
		})
	})
}

/**
 * Tag queries 
 * **/
const addTag = (userObj) => {
	const tagname = userObj.tagname
	const sql = 'INSERT INTO Tag (tagname) VALUES (?)'

	return new Promise((resolve, reject) => {
		return connection.query(sql, [tagname], (err, user) => {
			(err) ? reject(err) : resolve(user)
		})
	})
}

const addKeyTag = (userid, tagKey) => {
	const sql = 'INSERT INTO Usertag (userid,tagid) VALUES (?,?)'

	return new Promise((resolve, reject) => {
		return connection.query(sql, [userid, tagKey], (err,result) => {
			(err) ? reject(err) : resolve('Tag added in your list')
		})
	})
}

const getListTag = (userid) => {
	const sql = 'SELECT tagname FROM Tag INNER JOIN Usertag ON Tag.id = Usertag.tagid WHERE userid = ?;'

	return new Promise((resolve, reject) => {
		return connection.query(sql, [userid], (err, taglist) => {
			if (err) { reject(err) }
			let userTags = []
			if (taglist.length) {
				taglist.forEach((element,index) => {
					userTags[index] = element.tagname
				});
				resolve(userTags)
			} else {
				resolve(null)
			}
		})
	})
}

const selectTag = (tagname) => {
	const sql = 'SELECT * FROM Tag WHERE tagname=?'

	return new Promise((resolve, reject) => {
		return connection.query(sql, [tagname], (err, tag) => {
			(err) ? reject(err) : resolve(tag)
		})
	})
}

const selectAllTag = () => {
	const sql = 'SELECT * FROM Tag'

	return new Promise((resolve, reject) => {
		return connection.query(sql, (err, tags) => {
			(err) ? reject(err) : resolve(tags)
		})
	})
}

const deleteTaglist = (userid) => {
	const sql = 'DELETE FROM Usertag WHERE userid=?'

	return new Promise((resolve, reject) => {
		return connection.query(sql, [userid], (err, completed) => {
			(err) ? reject(err) : resolve('Your list of tags has been erased')
		})
	})
}

const promiseTag = (validTags) => {
	return new Promise((resolve, reject) => {
		const allElems = validTags.map(async tag => {
			let tagRes = await selectTag(tag)
			let tmptag = tag
			tag = (tagRes[0] == undefined) ? "NOT_EXIST" : tagRes[0].tagname
			if (tag == "NOT_EXIST") {
				await addTag({tagname: tmptag})
			}
		})
		resolve(allElems)
	})
}

const insertTagByValue = (userid, allowTags, listTag) => {
	return new Promise(async (resolve, reject) => {
		allowTags.forEach(async tag => {
			await listTag.forEach(async tagdb => {
				if (tag == tagdb.tagname) {
					await addKeyTag(userid, tagdb.id).catch(err => reject(err))
				}
			});
		})
		resolve('All tag inserted')
	})
}

/** 
 * Photo queries
 * **/
const selectAllPhotos = (userid) => {
	const sql = 'SELECT * FROM Photo WHERE userid = ? ORDER BY profile DESC'
	return new Promise((resolve, reject) => {
		return connection.query(sql, userid, (err, records) => {
			if (err) {
				reject(err) 
			}
			if (records.length) {
				records.forEach(elem => {
					elem.srcimg = elem.srcimg.replace("front-end/public/", "")
				})
			}
			resolve(records)
		})
	})
}

const getProfilePic = (userid) => {
	const sql = 'SELECT firstname,lastname,username,srcimg FROM Photo INNER JOIN User ON Photo.userid = User.id WHERE userid = ? AND profile=1'
	return new Promise((resolve, reject) => {
		return connection.query(sql, [userid], (err, user) => {
			if (err) { reject(err) }
			resolve(user)
		})
	})
}

const promisePics = (elems) => {
	return new Promise((resolve, reject) => {
		const allElems = elems.map(async elem => {
			let photo = await getProfilePic(elem.seenbyid)
			elem.username = (photo[0] == undefined) ? "Username undefined" : photo[0].username
			elem.srcimg = (photo[0] == undefined) ? "No profile photo" : photo[0].srcimg.replace("front-end/public/", "")
			delete elem.seenbyid
		})
		resolve(allElems)
	})
}

const addImg = (userObj) => {
	const userData = [userObj.id, userObj.src, userObj.profile]
	const sql = 'INSERT INTO Photo (userid, srcimg, profile) VALUES (?,?,?)'

	return new Promise((resolve, reject) => {
		connection.query(sql, userData, (err, user) => {
			(err) ? reject(err) : resolve(user)
		})
	})
}

const mainToNormal = (userObj) => {
	const userData = [userObj.profile, userObj.id, 'front-end/public/' + userObj.src]
	const sql = 'UPDATE Photo SET profile=? WHERE userid=? AND srcimg=?'

	return new Promise((resolve, reject) => {
		connection.query(sql, userData, (err, success) => {
			(err) ? reject(err) : resolve(success)
		})
	})
}

const normalToMain = (userObj) => {
	const userData = [userObj.profile, userObj.id, 'front-end/public/' + userObj.src]
	const sql = 'UPDATE Photo SET profile=? WHERE userid=? AND srcimg=?'

	return new Promise((resolve, reject) => {
		connection.query(sql, userData, (err, success) => {
			(err) ? reject(err) : resolve(success)
		})
	})
}

const countImg = (userObj) => {
	const userData = [userObj.id]
	const sql = 'SELECT COUNT(srcimg) AS Maxphoto FROM Photo WHERE userid = ?'

	return new Promise((resolve, reject) => {
		connection.query(sql, userData, (err, user) => {
			(err) ? reject(err) : resolve(user[0])
		})
	})
}

const deletePhotoDB = (srcimg) => {
	const sql = 'DELETE FROM Photo WHERE srcimg = ?'
	return new Promise((resolve, reject) => {
		return connection.query(sql, srcimg, (err, result) => {
			(err) ? reject(err) : resolve(result)
		})
	})
}

const deletePhotoServer = (srcimg) => {
	return new Promise((resolve, reject) => {
		let pathimg = './' + srcimg
		if (fs.existsSync(pathimg)) {
			fs.unlink(pathimg, (err) => {
				if (err) {
					reject(err)
				}
				resolve('Your photo has been deleted')
			})
		}
	})
}

const deletePhoto = (srcimg) => {
	srcimg = 'front-end/public/' + srcimg
	return new Promise((resolve, reject) => {
		deletePhotoDB(srcimg).then((resDB, err) => {
			if (err) reject('ERROR_DELETE_SQL')
			deletePhotoServer(srcimg).then((resServer, err) => {
				if (err) reject('ERROR_DELETE_FS')
				resolve(resServer)
			})
		})
	})
}

/** 
 * User queries
 * **/
const addUser = (userObj) => {
	const userData = [
		userObj.firstname, 
		userObj.lastname,
		userObj.username,
		// userObj.birthdate,
		// userObj.gender,
		userObj.email,
		userObj.password,
		// userObj.address,
		// userObj.latitude,
		// userObj.longitude
	]
	//Address à envlever du signup
	const sql = 'INSERT INTO User (firstname, lastname, username, email, password) VALUES (?, ?, ?, ?, ?)'

	return new Promise((resolve, reject) => {
		return connection.query(sql, userData, (err, user) => {
			(err) ? reject(err) : resolve(user)
		})
	})
}

const addUserOauth = (userObj) => {
	const userData = [
		userObj.firstname, 
		userObj.lastname,
		userObj.username,
		// userObj.birthdate,
		// userObj.gender,
		userObj.email,
		userObj.id42
		// userObj.password,
		// userObj.address,
		// userObj.latitude,
		// userObj.longitude
	]
	//Address à envlever du signup
	const sql = 'INSERT INTO User (firstname, lastname, username, email, id42, isVerified) VALUES (?, ?, ?, ?, ?, 1)'

	return new Promise((resolve, reject) => {
		return connection.query(sql, userData, (err, user) => {
			(err) ? reject(err) : resolve(user)
		})
	})
}

const selectAll = () => {
	const sql = 'SELECT username,email FROM User'

	return new Promise((resolve, reject) => {
		connection.query(sql, (err, user) => {
			if (err)
				reject(err)
			if (!user) {
				resolve(null)                    
			} else {
				resolve(user)
			}
		})    
	})
}

const addToBlacklist = (userData) => {
	const sql = 'INSERT INTO Blacklist (userid, blockid) VALUES (?, ?)'

	return new Promise((resolve, reject) => {
		return connection.query(sql, [userData.userid, userData.blockid], (err, user) => {
			(err) ? reject(err) : resolve(user)
		})
	})
}

const isInBlacklist = (userid, blockid) => {
	const sql = 'SELECT * FROM Blacklist WHERE userid=? AND blockid=?'

	return new Promise((resolve, reject) => {
		connection.query(sql, [userid, blockid], (err,user) => {
			if (err)
				reject(err)
			if (!user.length) {
				resolve(null)
			} else {
				resolve(user)
			}
		})
	})
}

const getBlacklist = (userid) => {
	//Replace with INNER JOIN
	const sql = 'SELECT * FROM Blacklist WHERE userid = ?'

	return new Promise((resolve, reject) => {
		connection.query(sql, [userid], (err, user) => {
			if (err)
				reject(err)
			if (!user) {
				resolve(null)                    
			} else {
				resolve(user)
			}
		})    
	})
}

const matchFiltered = async (listUser, userID) => {
	let blacklisted = await getBlacklist(userID)
	let tmpBlk = [], newList = []
	blacklisted.forEach(x => tmpBlk.push(x.blockid) )
	listUser.map(elem => {
		if ((tmpBlk).indexOf(elem.id) == -1) {
			newList.push(elem)
		}
	})
	return newList
}

const removeFromBlacklist = (userObj) => {
	const sql = 'DELETE FROM Blacklist WHERE userid=? && blockid=?'

	return new Promise((resolve, reject) => {
		connection.query(sql, [userObj.userid, userObj.blockid], (err, affected) => {
			if (err) reject(err)
			resolve(affected)
		})
	})
}

const findOne = (userObj) => {
	//Find user by id, username or email
	const id = userObj.id ? userObj.id : null
	const username = userObj.username ? userObj.username : null
	const email = userObj.email ? userObj.email : null
	const id42 = userObj.id42 ? userObj.id42 : null

	const sql = 'SELECT * FROM User WHERE id = ? OR username = ? OR email = ? OR id42 = ?'

	return new Promise((resolve, reject) => {
		connection.query(sql, [id, username, email, id42], async (err, user) => {
			if (err) {
				reject(err)
			}
			if (!user[0]) {
				resolve(null)                    
			} else {
				//DD-MM-YYYY(client) to YYYYMMDD(database) to DD-MM-YYYY(client)
				if (user[0].birthdate) {
					user[0].birthdate = user[0].birthdate.toISOString().substring(0,10).split('-')
					user[0].birthdate = user[0].birthdate[2] + '-' + user[0].birthdate[1] + '-' + user[0].birthdate[0]
				}
				if (user[0].lastCon) {
					user[0].lastCon = moment(user[0].lastCon).format("DD-MM-YYYY HH:mm:ss")
				}
				resolve(user[0])
			}
		})    
	})
}

const getListToMatch = (criteria) => {
	const uidLatSql = 'SELECT latitude FROM User WHERE id=?'
	const uidLonSql = 'SELECT longitude FROM User WHERE id=?'
	const interAge = 4

	let uidGenOri = null
	let userid = criteria.id
	let ageDb = moment().diff(moment(dateBirthtoYYYYMMDD(criteria.ageDb), 'YYYYMMDD'), 'years')
	let ageMin = isValidAge(criteria.ageMin) ? criteria.ageMin : ageDb
	let ageMax = (isValidAge(criteria.ageMax) && ((criteria.ageMax - ageMin) >= interAge)) ? criteria.ageMax : ageDb + interAge
	let dateMin = ageToDate(ageMin).split('-')
	dateMin = dateMin[0] + '-' + dateMin[2] + '-' + dateMin[1]
	let dateMax = ageToDate(ageMax).split('-')
	dateMax = dateMax[0] + '-' + dateMax[2] + '-' + dateMax[1]
	let scoreMin = (criteria.scoreMin >= 0) ? parseInt(criteria.scoreMin) : 0
	let scoreMax = (criteria.scoreMax) ? parseInt(criteria.scoreMax) : 10
	scoreMin = (scoreMin >= scoreMax) ? 0 : scoreMin
	let distance = criteria.distMax <= 100 ? criteria.distMax : 100
	let sortBy = (criteria.sortBy == "distance" || criteria.sortBy == "age" || criteria.sortBy == "score") ? criteria.sortBy : 'distance'
	sortBy = (sortBy == "age") ? 'birthdate' : sortBy //ORDER BY birthdate
	sortBy += (sortBy == "age" || sortBy == "score") ? ' DESC' : '' //Age le plus jeune en premier ou score le plus haut en premier

	if (criteria.orientation == "Straight") {
		uidGenOri = (criteria.gender == "Women") ? 'WHERE (gender="Man" && (orientation="Straight" || orientation="Bisexual"))' : 'WHERE (gender="Women" && (orientation="Straight" || orientation="Bisexual"))'
	}
	if (criteria.orientation == "Gay") {
		uidGenOri = (criteria.gender == "Women") ? 'WHERE (gender="Women" && (orientation="Gay" || orientation="Bisexual"))' : 'WHERE (gender="Man" && (orientation="Gay" || orientation="Bisexual"))'
	}
	if (criteria.orientation == "Bisexual") {
		uidGenOri = (criteria.gender == "Women") ? 'WHERE ((gender="Women" && (orientation="Gay" || orientation="Bisexual")) || (gender="Man" && (orientation="Straight" || orientation="Bisexual")))' : 'WHERE ((gender="Man" && (orientation="Gay" || orientation="Bisexual")) || (gender="Women" && (orientation="Straight" || orientation="Bisexual")))'
	}
	let uidBDate = '(birthdate <= "'+ dateMin +'" && birthdate >= "'+ dateMax +'")'
	let uidRangeScore = '(score >= '+ scoreMin +' && score <= '+ scoreMax +')'
	//6371 = Constante pour obtenir une distance en km
	//Calcul pour trouver les utilisateurs autour de soi
	let uAroundMe = 'SELECT id, firstname, lastname, username, birthdate, gender, orientation, bio, score, lastCon, (6371 * acos( cos( radians(('+uidLatSql+')) ) * cos( radians(latitude) ) '
						+'* cos( radians(longitude) - radians(('+uidLonSql+')) ) + sin( radians(('+uidLatSql+')) ) '
						+'* sin( radians(latitude)) ) ) AS distance FROM User '+ uidGenOri +' && '+ uidBDate +' && '+ uidRangeScore +' HAVING distance > 0 && distance < ?'
						+' ORDER BY '+ sortBy +';'//Trier selon la distance
						//+' LIMIT 0 , 20;';   //Nombre de profil à utiliser 
	
	return new Promise((resolve, reject) => {
		return connection.query(uAroundMe, [userid, userid, userid, distance], async (err, user) => {
			if (err) {
				reject(err)
			}
			for (let i = 0; i < user.length; i++) {
				let love = await didLike(user[i].id, userid)
				user[i].didLike = (love[0] && love[0].love) ? true : false
				user[i].lastCon = moment(user[i].lastCon).format("DD-MM-YYYY HH:mm:ss")
				user[i].tags = await getListTag(user[i].id)
				user[i].tags = (user[i].tags) ? user[i].tags : null
				user[i].photos = await selectAllPhotos(user[i].id)
				user[i].photos = (user[i].photos) ? user[i].photos : null
				user[i].birthdate = user[i].birthdate.toISOString().substring(0,10).split('-')
				user[i].birthdate = user[i].birthdate[2] + '-' + user[i].birthdate[1] + '-' + user[i].birthdate[0]
			}
			user = await matchFiltered(user, userid)
			resolve(user)
		})
	})
}

const getDefaultListToMatch = (criteria) => {
	const uidLatSql = 'SELECT latitude FROM User WHERE id=?'
	const uidLonSql = 'SELECT longitude FROM User WHERE id=?'
	const interAge = 4

	let uidGenOri = null
	let userid = criteria.id
	//let ageDb = moment().diff(moment(dateBirthtoYYYYMMDD(criteria.ageDb), 'YYYYMMDD'), 'years')
	let ymd = (criteria.ageDb).split('-')
	let tmpymd = ymd[2] + '-' + ymd[1] + '-' + ymd[0]

	let dateMin = tmpymd//ageToDate(ageDb)
	let dateMax = (parseInt(ymd[2]) + interAge) + '-' + ymd[1] + '-' + ymd[0]//ageToDate(ageDb - interAge)
	let distance = 100
	let sortBy = "distance"
	
	if (criteria.orientation == "Straight") {
		uidGenOri = (criteria.gender == "Women") ? 'WHERE (gender="Man" && (orientation="Straight" || orientation="Bisexual"))' : 'WHERE (gender="Women" && (orientation="Straight" || orientation="Bisexual"))'
	}
	if (criteria.orientation == "Gay") {
		uidGenOri = (criteria.gender == "Women") ? 'WHERE (gender="Women" && (orientation="Gay" || orientation="Bisexual"))' : 'WHERE (gender="Man" && (orientation="Gay" || orientation="Bisexual"))'
	}
	if (criteria.orientation == "Bisexual") {
		uidGenOri = (criteria.gender == "Women") ? 'WHERE ((gender="Women" && (orientation="Gay" || orientation="Bisexual")) || (gender="Man" && (orientation="Straight" || orientation="Bisexual")))' : 'WHERE ((gender="Man" && (orientation="Gay" || orientation="Bisexual")) || (gender="Women" && (orientation="Straight" || orientation="Bisexual")))'
	}

	let uidBDate = '(birthdate <= "'+ dateMax +'" && birthdate >= "'+ dateMin +'")'
	let uidRangeScore = '(score >= 0 && score <= 10)'
	//6371 = Constante pour obtenir une distance en km
	//Calcul pour trouver les utilisateurs autour de soi
	let uAroundMe = 'SELECT id, firstname, lastname, username, birthdate, gender, orientation, bio, score, lastCon, (6371 * acos( cos( radians(('+uidLatSql+')) ) * cos( radians(latitude) ) '
						+'* cos( radians(longitude) - radians(('+uidLonSql+')) ) + sin( radians(('+uidLatSql+')) ) '
						+'* sin( radians(latitude)) ) ) AS distance FROM User '+ uidGenOri +' && '+ uidBDate +' && '+ uidRangeScore +' HAVING distance > 0 && distance < ?'
						+' ORDER BY '+ sortBy +';'//Trier selon la distance
						//+' LIMIT 0 , 20;';   //Nombre de profil à utiliser 
	
	return new Promise((resolve, reject) => {
		return connection.query(uAroundMe, [userid, userid, userid, distance], async (err, user) => {
			if (err) {
				reject(err)
			}
			for (let i = 0; i < user.length; i++) {
				let love = await didLike(user[i].id, userid)
				user[i].didLike = (love[0] && love[0].love) ? true : false
				user[i].lastCon = moment(user[i].lastCon).format("DD-MM-YYYY HH:mm:ss")
				user[i].tags = await getListTag(user[i].id)
				user[i].tags = (user[i].tags) ? user[i].tags : null
				user[i].photos = await selectAllPhotos(user[i].id)
				user[i].photos = (user[i].photos) ? user[i].photos : null
				user[i].birthdate = user[i].birthdate.toISOString().substring(0,10).split('-')
				user[i].birthdate = user[i].birthdate[2] + '-' + user[i].birthdate[1] + '-' + user[i].birthdate[0]
			}
			user = await matchFiltered(user, userid)
			resolve(user)
		})
	})
}

const getListToMatchByTags = async (criTags) => {
	let tags = criTags.tags
	let userid = criTags.id
	delete criTags.tags

	let tagArray = tags.split(',')
	let tagAllow = [], tagNotAllow = [];

	await tagArray.map(x => {
		(x.match(/^#[^\W_]{1,42}$/)) ? tagAllow.push(x) : tagNotAllow.push(x)
	})

	return new Promise((resolve, reject) => {
		getListToMatch(criTags).then((list, err) => {
			if (err) { reject(err) }
			let validUser = []

			for (let i = 0; i < list.length; i++) { 
				if (list[i].tags && list[i].tags.length !== null) {
					for (let j = 0; j < tagAllow.length; j++) {
						if (list[i].tags.indexOf(tagAllow[j]) > -1) {
							validUser.push(list[i])
							break
						}
					}
				}
			}
			getBlacklist(userid).then((records, err) => {
				if (err) { reject(err) }
				for (let i = 0; i < validUser.length; i++) {
					for (let j = 0; j < records.length; j++) {
						if (validUser[i].id == records[j].blockid) {
							validUser.splice(i,1)
							break
						}
					}
				}
				resolve(validUser)
			})
		})
	})

}

const insertNotif = (notiObj) => {
	const notitime = Date.now()
	const sql = 'INSERT INTO Notifications (senderid,receiverid,notitype,notitime) VALUES (?,?,?,TIMESTAMP(?))'

	return new Promise((resolve, reject) => {
		connection.query(sql, [notiObj.senderid, notiObj.receiverid, notiObj.notitype, notitime], (e, notif) => {
			if (e) {
				reject(e)
			} else {
				resolve(notif)
			}
		})
	})
}

const getNotif = (userid) => {
	const sql = 'SELECT username,notitype,notitime,isRead FROM Notifications INNER JOIN User ON Notifications.senderid = User.id WHERE receiverid=? AND isRead=0 '

	return new Promise((resolve, reject) => {
		connection.query(sql, [userid], (e, noti) => {
			if (e) {
				reject(e)
			} else {
				if (noti.length) {
					noti.map(x => x.notitime = moment(x.notitime).format("YYYY-MM-DD HH:mm:ss"))
				}
				resolve(noti)
			}
		})
	})
}

const readNotif = (userid) => {
	const sql = 'UPDATE Notifications SET isRead = 1 WHERE receiverid=?'

	return new Promise((resolve, reject) => {
		connection.query(sql, [userid], (e, noti) => {
			if (e) {
				reject(e)
			} else {
				if (noti.length) {
					noti.map(x => x.notitime = moment(x.notitime).format("YYYY-MM-DD HH:mm:ss"))
				}
				resolve(noti)
			}
		})
	})
}

//ORM handmade
module.exports = {
	//Classic
	update,
	upComplete,

	//Popularity
	addPopularity,
	getScoreFromPopularity,
	getActivity,
	didLike,
	upsertPop,
	getScore,
	upScoreUsr,

	//Tag
	addTag,
	addKeyTag,
	getListTag,
	selectTag,
	selectAllTag,
	deleteTaglist,
	promiseTag,
	insertTagByValue,

	//Photo
	selectAllPhotos,
	getProfilePic,
	promisePics,
	addImg,
	mainToNormal,
	normalToMain,
	countImg,
	deletePhotoDB,
	deletePhotoServer,
	deletePhoto,
	
	//User
	addUser,
	addUserOauth,
	selectAll,
	addToBlacklist,
	isInBlacklist,
	getBlacklist,
	findOne,
	getListToMatch,
	getDefaultListToMatch,
	getListToMatchByTags,

	//Matched
	getAllMatchFromUser,
	insertMatched,
	didMatch,
	deleteMatched,

	//Messages
	insertMsg,
	deleteMsg,

	//Socket
	insertSocketOn,
	getAllUserConnected,
	isUserConnected,
	getRoomMsg,
	deleteSocketInfo,
	
	//Notifications
	insertNotif,
	getNotif,
	readNotif,

	//Written but not implemented into routes
	removeFromBlacklist
}