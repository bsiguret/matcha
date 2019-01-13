'use strict'

const express = require('express')
const bodyParser = require('body-parser')   // Body parsing middleware
const jwt = require('jsonwebtoken')         // Token JWT format
const authJWT = require('./middlewares/authJWT')
const bcrypt = require('bcrypt')            // Hash password
const multer = require('multer')
const moment = require('moment')
const axios = require('axios')

const socketInit = require('./socket');
const {createDatabase} = require('./config/database')
const userQuery = require('./models/userModel')
const passNewInfo = require('./middlewares/passNewInfo')
const parseRecord = require('./middlewares/parseRecord')
const checkProfilePic = require('./middlewares/checkProfilePic')
const imageFilter = require('./middlewares/imageFilter')
const {isEmpty, canUp, isPropEmpty} = require('./tools/utils')
const {sendMailTo} = require('./tools/sendMail')
const {upComplete} = require('./models/userModel')

const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server, {pingTimeout: 60000});

require('dotenv').config()

// =============== MIDDLEWARES ===============
app.use((req, res, next) => {
		res.setHeader('Access-Control-Allow-Origin',  '*');
		res.setHeader('Access-Control-Allow-Credentials', true);
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
		res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
		next();
})

app.use(bodyParser.json(/*{limit: '16mb'}*/))  // To support JSON-encoded bodies
app.use(bodyParser.urlencoded({/*limit: '16mb',*/ extended: true })) // To support URL-encoded bodies
// FORMAT OF TOKEN OAuth 2.0 in RFC 6750
// Authorization: Bearer <access_token>

// =============== ROUTES ===============
app.get('/api', async (req, res, next) => {
		//A remplacer avec /home quand le back sera fini
		createDatabase()
		res.json({message : 'Welcome to Matcha\'s API'})
})


app.get('/api/home', authJWT, async (req, res, next) => {
		userQuery.findOne({id: req.user.id}).then((uInfo, err) => {
				userQuery.getDefaultListToMatch({
						id: req.user.id, orientation: uInfo.orientation,
						gender: uInfo.gender, ageDb: uInfo.birthdate,
				}).then((result, err) => { 
						if (err) throw err 
						res.json(result) 
				}).catch(e => { res.status(401).json(e) })
		}).catch(e => { res.status(401).json(e) })
})

app.post('/api/home', authJWT, async (req, res, next) => {
		userQuery.findOne({id: req.user.id}).then((uInfo, err) => {
				//COMMENTS ARE JUST SOME EXAMPLE
				if (!(req.body.tags)) {
						userQuery.getListToMatch({
								id: req.user.id,
								distMax: req.body.distance,
								orientation: uInfo.orientation,
								gender: uInfo.gender,
								ageDb: uInfo.birthdate,
								ageMin: req.body.age[0],// req.body.ageMin,
								ageMax: req.body.age[1],// req.body.ageMax,
								scoreMin: req.body.score[0],// req.body.scoreMin,
								scoreMax: req.body.score[1],// req.body.scoreMax,
								sortBy: req.body.sort
						}).then((result, err) => { 
								if (err) throw err 
								res.json(result) 
						}).catch(e => { res.status(401).json(e) })
				} else {
						userQuery.getListToMatchByTags({
								id: req.user.id,
								distMax: req.body.distance,
								orientation: uInfo.orientation,
								gender: uInfo.gender,
								ageDb: uInfo.birthdate,
								ageMin: req.body.age[0],//  req.body.ageMin,
								ageMax: req.body.age[1],//  req.body.ageMax,
								scoreMin: req.body.score[0],//  req.body.scoreMin,
								scoreMax: req.body.score[1],// req.body.scoreMax,
								sortBy: req.body.sort,
								tags: req.body.tags
						}).then((result, err) => { 
								if (err) throw err 
								res.json(result) 
						}).catch(e => { res.status(401).json(e) })
				}
		}).catch(e => { res.status(401).json(e) })
})

/**
 * @api {post} /signup Register Account
 * @apiGroup Sign
 * @apiParam {Object} Params Format JSON
 * @apiParam {String} Params.fields mandatory fields => firstname, lastname, username, email, password
 * @apiSuccess {Object} Response Format JSON
 * @apiSuccess {String} Response.msg Account created, confirmation email sent
 * @apiSuccessExample {json} Success Registration
 *      {
 *          "msg": "User has been created, check your email and confirm your account"
 *      }
 * @apiError 401 Unauthorized
 * @apiErrorExample {json} Field or email error
 *      {
 *          "errMsg": {
 *              "field": "This field is not well formated"
 *          }
 *      }
 */

app.post('/api/signup', parseRecord, async (req, res, next) => {
		if (!isEmpty(req.body.error)) { res.status(401).json({errMsg: req.body.error}) }
		else {
				delete req.body.error
				userQuery.findOne({username: req.body.username}).then(usrN => {
						userQuery.findOne({email: req.body.email}).then(usrE => {
								if (usrN || usrE) {
										let error = {}
										if (usrN && usrN.username) { error.username = 'Username already exists' }
										if (usrE && usrE.email) { error.email = 'Email already exists' }
										throw error
								}
								else {
										userQuery.addUser(req.body).then(() => {
												sendMailTo(req.body.username, req.body.email, 1)
														.then(success => { res.json(success) })
														.catch(error => { res.status(401).json({sendMail: error}) })
										})
								}
						}).catch(error => { res.status(401).json({errMsg: error}) })
				}).catch(error => { res.status(401).json({errMsg: error}) })
		}
})

/**
 * @api {post} /signin Connection Account & Sending Confirmation
 * @apiGroup Sign
 * @apiParam {Object} Params Format JSON
 * @apiParam {String} Params.fields mandatory fields => firstname, lastname, username, email, password
 * @apiSuccess {Object} Response Format JSON
 * @apiSuccess {String} Response.token JSON-WebToken generate
 * @apiSuccess {Object} Response.user Informations about user logged
 * @apiSuccessExample {json} Success Connection
 *      {
 *          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *          "user": {
 *              "field1": "value1",
 *              "field2": "value2"
 *          }
 *      }
 * @apiSuccessExample {json} Success Email Resending
 *      {
 *          "msg": "Email confirmation re-sent"
 *      }
 * @apiError 401 Unauthorized
 * @apiErrorExample {json} Field error
 *      {
 *          "errMsg": {
 *              "field": "This field is not well formated"
 *          }
 *      }
 * @apiErrorExample {json} Email error
 *      {
 *          "errMsg": "Account not verified"
 *      }
 */
app.post('/api/signin', parseRecord, async (req, res, next) => {
		let tokenTmp = null, user = null, tmpuserUp = null

		if (req.body.error) { res.status(401).json({ errMsg: req.body.error }) }
		else {
				delete req.body.error
				if (req.body.email) {
						userQuery.findOne({email: req.body.email}).then(userRes => {
								user = userRes
								if (!user) { throw 'No user found' }
								if (user && !user.isVerified) {
										sendMailTo(user.username, user.email, 2)
												.then(success => { res.json(success) })
												.catch(error => { res.status(401).json(error) })
								} else {
										throw 'Account already verified'
								}
						}).catch(e => res.status(401).json({errMsg: e}))
				}
				if (req.body.username && req.body.password) {
						userQuery.findOne({username: req.body.username}).then(userRes => {
								user = userRes
								if (!user) { throw 'No user found' }
								if (!user.isVerified) { throw 'Account not verified' }
								return bcrypt.compare(req.body.password, user.password)
						}).then(match => {
								if (!match) { throw 'No user found' }
								else {
										const payload = {id: user.id, username: user.username}
										const token = jwt.sign({payload}, process.env.JWT_KEY, {expiresIn: '86400s'})
										tokenTmp = token
										let fields = {
											lastCon: true, 
											latitude: req.body.lat, 
											longitude: req.body.lon, 
											address: req.body.address
										}
										return userQuery.update({table: "User", fields: fields, where: {id: user.id} })
								}
						}).then(lastCon => {
								return userQuery.findOne({username: req.body.username})
						}).then((userUp) => {
								delete userUp.password; delete userUp.token; delete userUp.fake //delete user.address
								tmpuserUp = userUp
								return userQuery.getNotif(userUp.id)
						}).then(notifications => {
								res.json({token: tokenTmp, user: tmpuserUp, notifications: notifications})
						}).catch(e => { res.status(401).json({errMsg: e}) })
				}
		}
})

app.post('/api/oauth', async (req, res, next) => {
	let tokenTmp = null, user = null, tmpuserUp = null, response = null
	if (req.body.error) { res.status(401).json({ errMsg: req.body.error }) }
	else {
		delete req.body.error
		if (req.body.code) {
			axios.post('https://api.intra.42.fr/oauth/token', {
				grant_type: 'authorization_code',
				client_id: process.env.CLIENT_ID,
				client_secret: process.env.CLIENT_SECRET,
				code: req.body.code,
				redirect_uri: 'http://localhost:3001/oauth/'
			})
			.then((respo) => {
				axios.get('https://api.intra.42.fr/v2/me',
				{
					headers: {
						"Authorization": "Bearer " + respo.data.access_token
				}})
				.then(async (resp) => {
					req.body.address = 'Paris'
					req.body.lat = '48.896702'
					req.body.lon = '2.318349'
					userQuery.findOne({
						id42: resp.data.id
					})
					.then(async userRes => {
						user = userRes
						if (!user) {
							while(1) {
								response = await userQuery.findOne({
									username: resp.data.login
								})
								if (!response)
									break;
								resp.data.login = resp.data.login + Math.floor(Math.random() * 1001)
							}
							await userQuery.addUserOauth({
								firstname: resp.data.first_name, 
								lastname: resp.data.last_name,
								username: resp.data.login,
								email: resp.data.email,
								id42: resp.data.id
							})
							userQuery.findOne({
								id42: resp.data.id
							}).then((userRes2) => {
								user = userRes2
								const payload = {id: user.id, username: user.username}
								const token = jwt.sign({payload}, process.env.JWT_KEY, {expiresIn: '86400s'})
								tokenTmp = token
								let fields = {lastCon: true, 
									latitude: req.body.lat, 
									longitude: req.body.lon, 
									address: req.body.address}
								return userQuery.update({table: "User", fields: fields, where: {id: user.id} })
							}).then(lastCon => {
								return userQuery.findOne({id42: resp.data.id})
							}).then((userUp) => {
								delete userUp.password; delete userUp.token; delete userUp.fake //delete user.address
								tmpuserUp = userUp
								return userQuery.getNotif(userUp.id)
							}).then(notifications => {
								res.json({token: tokenTmp, user: tmpuserUp, notifications: notifications})
							}).catch(e => { res.status(401).json({errMsg: e}) })
						}
						else if (user) {
							const payload = {id: user.id, username: user.username}
							const token = jwt.sign({payload}, process.env.JWT_KEY, {expiresIn: '86400s'})
							tokenTmp = token
							let fields = {lastCon: true, 
								latitude: req.body.lat, 
								longitude: req.body.lon, 
								address: req.body.address}
							userQuery.update({table: "User", fields: fields, where: {id: user.id}
							}).then(lastCon => {
								return userQuery.findOne({id42: resp.data.id})
							}).then((userUp) => {
								delete userUp.password; delete userUp.token; delete userUp.fake //delete user.address
								tmpuserUp = userUp
								return userQuery.getNotif(userUp.id)
							}).then(notifications => {
								res.json({token: tokenTmp, user: tmpuserUp, notifications: notifications})
							}).catch(e => { res.status(401).json({errMsg: e}) })
						}
					}).catch(e => { res.status(401).json({errMsg: e}) })
				}).catch(e => { res.status(401).json({errMsg: e}) })
			}).catch(e => { res.status(401).json({errMsg: e}) })
		}
	}
})

//Getting owner's activity ...
//Owner's feed contains "seen feed" & "love feed"
app.get('/api/profile/activity', authJWT, (req, res, next) => {
		userQuery.findOne({id: req.user.id}).then((user, err) => {
				if (!user) throw 'User not found'
				userQuery.getActivity({userid: req.user.id}).then((rows, err) => {
						rows.forEach(row => {
								if (row.time) {
										row.time = moment(row.time).format('DD-MM-YYYY HH:mm:ss') 
								}
						})
						userQuery.promisePics(rows).then((picAdded,err) => {
								if (err) throw err
								Promise.all(picAdded).then(completed => { res.json(rows) })
						}).catch(err => { res.status(401).json({errMsg: err}) })
				}).catch(err => { res.status(401).json({errMsg: err}) })
		}).catch(err => { res.status(401).json({errMsg: err}) })
})

const upload = multer({
		limits: {fieldSize: 25 * 1024 * 1024 },
})
/**
 * Upload photos routes
 * 
 * Uploading max 5 photos .
 */
app.get('/api/profile/photos', authJWT, (req, res, next) => {
		userQuery.selectAllPhotos(req.user.id).then((records, err) => {
				if (err) throw 'Cannot find user'
				records = records.length ? records : null
				res.json(records)
		}).catch(e => { res.status(401).json({errMsg: e}) })
})

app.post('/api/profile/photos', authJWT, upload.single('photo'), imageFilter, checkProfilePic, async (req, res, next) => {
		let body = req.body //req.body.path anciennement req.file.path
		userQuery.findOne({id: req.user.id}).then((user, e) => {
				if (isPropEmpty(body.src)) {//upload new profile picture::1
						userQuery.addImg({id: user.id, src: req.body.path, profile: 1}).then(async (isAdded, error) => {
								if (error) { throw 'No image uploaded' }
								await upComplete(req.user.id, false)
								let records = await userQuery.selectAllPhotos(req.user.id)
								res.json({errMsg: 'Image uploaded and set as profile picture', photos: records})
						}).catch(e => { res.status(401).json({errMsg: e}) })

				} else if (!isPropEmpty(body.src) && req.body.defineAs === 'true') {//delete and upload new profile::1
						userQuery.mainToNormal({id: user.id, src: req.body.src, profile: null}).then((result,err) => {
								if (err) throw err
								userQuery.addImg({id: user.id, src: req.body.path, profile: 1}).then(async (isAdded, error) => {
										if (error) { throw 'No image uploaded' }
										await upComplete(req.user.id, false)
										let records = await userQuery.selectAllPhotos(req.user.id)
										res.json({errMsg: 'New profile picture set, the previous one has been set as normal picture', photos: records})
								}).catch(e => { res.status(401).json({errMsg: e}) })
						}).catch(e => { res.status(401).json({errMsg: e}) })

				} else { //upload 
						userQuery.addImg({id: user.id, src: req.body.path, profile: null}).then(async (result, error) => {
								if (error) { throw 'No image uploaded' }
								await upComplete(req.user.id, false)
								let records = await userQuery.selectAllPhotos(req.user.id)
								res.json({errMsg: 'Image uploaded', photos: records})
						}).catch(e => { res.status(401).json({errMsg: e}) })

				}
		}).catch(e => { res.status(401).json({errMsg: e}) })
})

app.delete('/api/profile/photos/:src', authJWT, (req, res, next) => {
		userQuery.selectAllPhotos(req.user.id).then((records, err) => {
				let previousP = null;
				let match = false, src = req.params.src //decodeURIComponent(req.params.src)
				records.forEach(record => {
						if (record.srcimg === src) { 
								match = true
								previousP = record.profile
						}
				})
				if (match) {
						if (records.length === 1) {
								res.status(401).json({errMsg: 'At least, one photo set as profile picture is required, please update a new one before deleting this one ...', photos: records})
						} else {
								userQuery.deletePhoto(src).then(async (result, err) => {
										if (err) throw err
										let records = await userQuery.selectAllPhotos(req.user.id)
										if (previousP) {
												await userQuery.normalToMain({id: req.user.id, src: records[0].srcimg, profile: 1})
										}
										await upComplete(req.user.id, false) 
										res.json({errMsg: 'Picture deleted !', photos: records})
								}).catch(err => { res.status(401).json({errMsg: err}) })
						}
				} else { throw 'Error cannot delete this picutre, wrong src' }
		}).catch(err => { res.status(401).json({errMsg: err}) })
})

app.get('/api/profile/settings', authJWT, (req,res,next) => {
		userQuery.findOne({id: req.user.id}).then(async (user, err) => {
				if (err) throw 'Cannot find user'
				user.birthdate = user.birthdate ? user.birthdate : new Date().toISOString().slice(0,10)
				user.tags = await userQuery.getListTag(req.user.id)
				//user.tags = user.tags.toString()
				user.photos = await userQuery.selectAllPhotos(req.user.id)
				user.photos = (user.photos.length) ? user.photos : new Array() 
				await upComplete(req.user.id, false)
				delete user.password; delete user.token; delete user.fake
				return user
		}).then(infoUser => { res.json(infoUser)})
		.catch(e => { res.status(401).json({errMsg: e}) })
})

app.post('/api/profile/settings', authJWT, passNewInfo, parseRecord, (req, res, next) => {
		let v_tags = null, tmptags = null
		userQuery.findOne({id: req.user.id}).then((user, err) => {
				if (err) throw 'Cannot find user'
				if (isEmpty(req.body.error)) {
						delete req.body.error

						let couldUp = canUp(req.body)
						if (!couldUp) {
								if (req.body.npassword) {
										req.body.password = req.body.npassword; delete req.body.npassword
								} else { delete req.body.password }
								tmptags = (req.body.tags) ? req.body.tags : null
								delete req.body.tags
								return userQuery.update({table: 'User', fields:req.body, where:{id: user.id} })
						} else { throw couldUp }

				} else { throw req.body.error }
		}).then(result => {
			 return upComplete(req.user.id, true)
		}).then(async userUp => {
				delete userUp.password; delete userUp.token; delete userUp.fake //delete user.address
				if (tmptags) {
						userQuery.promiseTag(tmptags).then((result) => {
								return Promise.all(result)
						}).then(completed => {
								return userQuery.selectAllTag() 
						}).then(tags => {
								v_tags = tags
								return userQuery.deleteTaglist(req.user.id)
						}).then(deleted => {
								return userQuery.insertTagByValue(req.user.id, tmptags, v_tags)
						}).then(async added => {
								userUp.tags = tmptags//.toString()
								await upComplete(req.user.id)
								res.json({
										errMsg: 'Your personnal informations have been updated successfully', 
										newInfo: userUp
								})
						}).catch(e => { res.status(401).json({errMsg: e}) })
				} else {
						userQuery.deleteTaglist(req.user.id).then(deleted => {
								return userQuery.getListTag(req.user.id)
						}).then(async taglist => {
								userUp.tags = taglist
								await upComplete(req.user.id)
								res.json({
										errMsg: 'Your personnal informations have been updated successfully', 
										newInfo: userUp
								})
						}).catch(e => { res.status(401).json({errMsg: e}) })
				}
		}).catch(e => { res.status(401).json({errMsg: e}) })        
})

/**
 * User routes are used for the wanted person
 */
app.get('/api/user/:username', authJWT, (req, res, next) => {
		let records = null;
		let userInfo = null;
		userQuery.findOne({username: req.params.username}).then((user, err) => {
				if (!user) throw 'Username does not exist'
				if (!user.isVerified || !user.isCompleted) throw 'Username does not exist'
				if (user.id !== req.user.id) {
						userInfo = user
						userQuery.selectAllPhotos(user.id).then((recordsP, err) => {
								if (err) throw 'Cannot find user'
								records = !recordsP.length ? null : recordsP
								userInfo.photos = records
								return userQuery.didLike(user.id, req.user.id)
						}).then(love => {
								if (love[0] && love[0].love) {
										userInfo.didLike = true
										love = 1
								} else {
										userInfo.didLike = false
										love = 0
								}
								return userQuery.upsertPop({where: {usr: user.id, seen: req.user.id, love: love}}, io)
						}).then(success => {
								return userQuery.getScore(user.id)
						}).then(score => {
								userInfo.score = score
								return userQuery.getListTag(user.id)
						}).then(tags => {
								userInfo.tags = tags
								return userQuery.isInBlacklist(req.user.id, user.id)
						}).then(blocked => {
								userInfo.blocked = blocked ? true : false
								delete userInfo.password; delete userInfo.token; delete userInfo.fake
								res.json(userInfo)
						}).catch(err => { res.status(401).json({errMsg : err}) })
				} else {
						res.json({redirectTo: 'http://localhost:8082/profile'})
				}
		}).catch(err => { res.status(401).json({errMsg : err}) })
})

app.post('/api/user/:username', authJWT, (req, res, next) => {
		let love = 0
		userQuery.findOne({username: req.params.username}).then(async userRes => {
				if (userRes.id !== req.user.id) {
						let c_user = await upComplete(req.user.id, true)
						if (c_user.isCompleted) {
								userQuery.upsertPop({where: {usr: userRes.id, seen: c_user.id, love: req.body.love} }, io)
								.then(() => {
										return userQuery.didLike(userRes.id, c_user.id)
								}).then(async loveByUserLogged => {
										love = loveByUserLogged
										if (!love[0].love) {
												await userQuery.deleteMatched(c_user.id, userRes.id)
												await userQuery.deleteMsg(c_user.id, userRes.id)
										}
										userQuery.getScore(userRes.id).then(score => {
												res.json({
														errMsg: parseInt(req.body.love) ? ' Like sent ...' : 'Dislike sent ...',
														didLike: love[0].love ? true : false,
														score
												})
										})
								})
						} else { throw 'You have to update at least one photo before liking/disliking someone' }
				} else { throw 'You cannot match you' }
		}).catch(e => {
				res.status(401).json({ errMsg: e, redirectTo: 'http://localhost:8082/profile/settings'})
		})
})

app.post('/api/user/:username/fake', authJWT, (req, res, next) => {
		userQuery.findOne({username: req.params.username}).then((user, err) => {
				if (!user) throw 'Username does not exist'
				//if (user.id !== req.user.id) {
						userQuery.update({table: "User", fields: {fake : 1}, where: {id: user.id} }).then((success, err) => {
								if (err) throw err
								res.json({errMsg: 'User '+req.params.username+' has been reported as fake user'})
						}).catch(err => { res.status(401).json({errMsg : err}) })
				//}
		}).catch(err => { res.status(401).json({errMsg : err}) })
})

app.post('/api/user/:username/blacklist', authJWT, (req, res, next) => {
		userQuery.findOne({username: req.params.username}).then((user, err) => {
				if (!user) throw 'Username does not exist'
				if (user.id !== req.user.id) {
						userQuery.isInBlacklist(req.user.id, user.id).then((blocked, err) => {
								if (err) throw err
								if (!blocked) {
										userQuery.addToBlacklist({userid: req.user.id, blockid: user.id}).then(async (success,err) => {
												if (err) throw err
												await userQuery.deleteMatched(req.user.id, user.id)
												await userQuery.upsertPop({where: {usr: user.id, seen: req.user.id, love: 0} }, io)
												await userQuery.deleteMsg(req.user.id, user.id)
												res.json({errMsg: 'User '+req.params.username+' has been blocked', blocked: true})
										})
								} else {
										userQuery.removeFromBlacklist({userid: req.user.id, blockid: user.id}).then((success, err) => {
												if (err) throw err
												res.json({errMsg: 'User '+req.params.username+' has been unblocked', blocked: false})
										})
								}
						})
				} else {
						res.status(401).json({errMsg: 'You cannot block yourself' })
				}
		}).catch(err => { res.status(401).json({errMsg : err}) })
		//AJOUT LA SUPPRESSION DES MSG, DES RECHERCHES, DES NOTIFICATIONS
})

/**
 * @api {get} /verifyAccount/:username/:token Confirm Account
 * @apiGroup Email
 * @apiParam {String} Username User's nickname
 * @apiParam {String} Token Temporary token validation
 * @apiSuccess {Object} Response Format JSON
 * @apiSuccess {String} Response.msg Account verified
 * @apiSuccessExample {json} Success Validation
 *      {
 *          "msg": "Congrats JohnDoe ! Your account is validated"
 *      }
 * @apiError 401 Unauthorized
 * @apiErrorExample {json} Field error
 *      {
 *          "errMsg": "Invalid Token"
 *      }
 */
app.get('/api/verifyAccount/:username/:token', (req, res, next) => {
		let usrn = decodeURIComponent(req.params.username)
		userQuery.findOne({username: usrn}).then((user, err) => {
				if (err) throw err
				if (!user) throw 'No user found'
				if (req.params.token === user.token) {
						userQuery.update({table: 'User', fields:{token: null, isVerified:1}, where:{username: usrn} })
						.then(success => {
								res.json({errMsg: 'Congrats '+ usrn + ' ! your account is validated'})
						})
				} else {
						res.status(401).json({errMsg : 'Invalid token' })
				}
		}).catch(e => res.status(401).json({errMsg: e}) )
})

/**
 * @api {post} /resetpass Reset a Password
 * @apiGroup Email
 * @apiParam {String} Email User's email
 * @apiSuccess {Object} Response Format JSON
 * @apiSuccess {String} Response.msg Email of resetting password sent
 * @apiSuccessExample {json} Success 
 *      {
 *          "msg": "The resetting's password link has been sent by emal"
 *      }
 * @apiError 401 Unauthorized
 * @apiErrorExample {json} Field error
 *      {
 *          "errMsg": "No user found"
 *      }
 */
app.post('/api/resetpass', parseRecord, async (req, res, next) => {
		userQuery.findOne({email : req.body.email}).then((user, err) => {
				if (err) throw err
				if (!user) { throw 'No user found' }
				sendMailTo(user.username, req.body.email, 3)
						.then(success => { res.json(success) })
						.catch(err => res.status(401).json({errMsg: err}) )
		}).catch(err => { res.status(401).json({errMsg : err}) })
})

/**
 * @api {get} /resetpass/:username/:token Get Link Reset Password
 * @apiGroup Email
 * @apiParam {String} Username User's nickname
 * @apiParam {String} Token Temporary token validation
 * @apiSuccess {Object} Response Format JSON
 * @apiSuccess {String} Response.msg Simple message saying it's a success
 * @apiSuccessExample {json} Success 
 *      {
 *          "msg": "We can help you JohnDoe !"
 *      }
 * @apiError 401 Unauthorized
 * @apiErrorExample {json} Field error
 *      {
 *          "errMsg": "No user found !"
 *      }
 */
app.get('/api/resetpass/:username/:token', async (req, res, next) => {
		//PRINT FORM CLIENT-SIDE
		let usrn = decodeURIComponent(req.params.username)
		userQuery.findOne({username: usrn}).then((user, err) => {
				if (err) throw err
				if (!user) throw 'No user found'
				if (req.params.token === user.token) {
						res.json({errMsg : 'We can help you '+ user.username +' !'})
				} else {
						res.status(401).json({errMsg : 'Invalid token' })
				}
		}).catch(e => res.status(401).json( { errMsg: e} ))
})


/**
 * @api {post} /resetpass/:username/:token New Password
 * @apiGroup Email
 * @apiParam {String} Username User's nickname
 * @apiParam {String} Token Temporary token validation
 * @apiSuccess {Object} Response Format JSON
 * @apiSuccess {String} Response.msg Success
 * @apiSuccessExample {json} Success 
 *      {
 *          "msg": "Password changed"
 *      }
 * @apiError 401 Unauthorized
 * @apiErrorExample {json} Field error
 *      {
 *          "errMsg": "Passwords/Tokens did not match"
 *      }
 */
app.post('/api/resetpass/:username/:token', parseRecord, async (req, res, next) => {
		let usrn = decodeURIComponent(req.params.username)
		userQuery.findOne({username: usrn}).then(async (user, err) => {
				if (err) throw err
				if (!user) throw 'No user found'
				if (isEmpty(req.body.error)) {
						delete req.body.error
						if (req.params.token === user.token && req.body.npassword) {
								userQuery.update({table: 'User', fields: {password: req.body.npassword, token: null}, where:{username: usrn}})
								.then((result, err) => {
										if (err) throw err
										res.json({errMsg: 'Password changed'})
								})
						} else { throw 'Passwords/Tokens did not match' }
				} else { throw req.body.error.npassword }
		}).catch(e => res.status(401).json({ errMsg: e }) )
})

io.on('connection', (socket) => {
		socketInit(socket, io)
});
io.on('SERVER/USERSCONNECTED', usersConnected => {
		io.sockets.emit('CLIENT/USERSCONNECTED', usersConnected)
})

const errorHandler = (err, req, res, next) => {
		err.msg = err.msg ? err.msg : 'Oops something went wrong ...'
		res.status(401).json({errMsg: err.msg ? err.msg : err.code})
}

app.use(errorHandler)

const listener = server.listen(8082, () => {
		console.log("Express server listening on port %d in %s mode", listener.address().port, app.settings.env)
})
