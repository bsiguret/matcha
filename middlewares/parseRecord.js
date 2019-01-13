'use strict'

const bcrypt = require('bcrypt')
const {addrToCoord, coordToAddr} = require('../models/geoModel')
const {isEmpty, isObjPropsEmpty} = require('../tools/utils')
const {parseInput, isValidStr, isValidUsername, isValidDate, isValidGender, isValidOrientation, isValidEmail, isValidPassword, isValidIp} = require('../tools/dataValidator')
const geoip = require('geoip-lite');

module.exports = async (req, res, next) => {
	if (isObjPropsEmpty(req.query) && isObjPropsEmpty(req.body) && isObjPropsEmpty(req.params)) {
		res.status(401).json({errMsg: 'Empty field(s)'})
	} else {
		let resetpass = req.path.match('/resetpass')
		const allowRoutes = [
			'/api/signup',                          //0
			'/api/signin',                          //1
			'/api/profile/settings',                //2
			!(resetpass) ? null : '/api/resetpass'  //3
		]
		let pathname = !(resetpass) ? req.path : '/api/resetpass' //req.path
		let param = req.body // req.query
		let nbKeys = Object.keys(param).length //Number of keys contained in req.query
		let allowable = allowRoutes.indexOf(pathname)

		//Parse each params from req.body 
		let firstname = (param.firstname) ? isValidStr(param.firstname) : null
		let lastname = (param.lastname) ? isValidStr(param.lastname) : null
		let username = (param.username) ? isValidUsername(param.username) : null
		let birthdate = (param.birthdate) ? isValidDate(param.birthdate) : null
		let gender = (param.gender) ? isValidGender(param.gender) : null
		let email = (param.email) ? isValidEmail(param.email) : null
		let password = (param.password) ? isValidPassword(param.password) : null
		let npassword = (param.npassword) ? isValidPassword(param.npassword) : null
		let cpassword = (param.cpassword) ? isValidPassword(param.cpassword) : null
		let orientation = (param.orientation) ? isValidOrientation(param.orientation) : null
		let bio = param.bio
		let address = (param.address) ? await addrToCoord(param.address) : null
		let ip = (param.ip) ? isValidIp(param.ip) : null
		let latitude = null
		let longitude = null

		req.body.error = {}
		//Password not hashed
		let passhash = null
		switch (allowable) {
			case 0:
				passhash = (password) ? await bcrypt.hash(param.password, 10) : null
				if (firstname) { req.body.firstname = parseInput(param.firstname) }
				else { req.body.error.firstname = 'Firstname must contains only letters, 2-20 characters' }

				if (lastname) { req.body.lastname = parseInput(param.lastname) }
				else { req.body.error.lastname = 'Lastname must contains only letters, 2-20 characters' }

				if (username) { req.body.username = param.username }
				else { req.body.error.username = 'Username can contains letters, digits, dot, dash and underscore, 2-30 characters' }

				if (email) { req.body.email = param.email }
				else { req.body.error.email = 'Not a valid email, example: love@matcha.com' }

				if (param.password === param.cpassword) {
					if (password) { req.body.password = await bcrypt.hash(param.password, 10) }
					else { req.body.error.password = 'Password must contains at least 6 characters, one uppercase and lowercase letter and one digit, only letters and digits are allowed' }
				} else
					req.body.error.password = 'Password does not match with password confirmation'
				/*
				if (!isEmpty(address)) {
					req.body.latitude = address[0].latitude
					req.body.longitude = address[0].longitude
				}
				*/
				break;

			case 1:
				if (param.email && nbKeys === 1) {
					if (email) { req.body.email = param.email }
					else { req.body.error.email = 'Not a valid email, example: love@matcha.com' }
					if (isEmpty(req.body.error)) { delete req.body.error}
				}
				else if (param.username && param.password /*&& (param.ip || param.lon && param.lat)*/) {
					if (username && password) {
						req.body = {
							username: param.username,
							password: param.password,
						}
						if (ip) {
							let geo = geoip.lookup(param.ip)
							req.body.ip = param.ip
							req.body.address = geo.city
							req.body.lat = geo.ll[0]
							req.body.lon = geo.ll[1]
						} else {    
							// PARAM INVERSER ATTENTION
							req.body.address = await coordToAddr({lat: param.lat, lon: param.lon})
							req.body.lat = param.lat
							req.body.lon = param.lon
						}
					} else { req.body.error = 'No user found' }
					if (isEmpty(req.body.error)) { delete req.body.error}
				} else {
					req.body.error = 'No user found'
				}
				break;

			case 2:
				let tmpbody = {}
				tmpbody.error = {}

				if (param.firstname) { 
					if (firstname) { tmpbody.firstname = param.firstname }
					else { tmpbody.error.firstname = 'Firstname must contains only letters, 2-20 characters' }
				}

				if (param.lastname) { 
					if (lastname) { tmpbody.lastname = param.lastname }
					else { tmpbody.error.lastname = 'Lastname must contains only letters, 2-20 characters' }
				}

				if (param.gender) { 
					if (gender) { tmpbody.gender = param.gender }
					else { tmpbody.error.gender = 'Gender must be Man or Women or Other' }
				}

				if (param.email) { 
					if (email) { tmpbody.email = param.email }
					else { tmpbody.error.email = 'Not a valid email, example: love@matcha.com' }
				}

				if (param.birthdate) {
					if (birthdate) {
						//DD-MM-YYYY(client) to YYYYMMDD(db) to DD-MM-YYYY(client) 
						tmpbody.birthdate = param.birthdate.substring(0,10).split('-');
						tmpbody.birthdate[0] = parseInt(tmpbody.birthdate[0]) + 1 
						tmpbody.birthdate = tmpbody.birthdate[2] + '-' + tmpbody.birthdate[1] + '-' + tmpbody.birthdate[0];
					}
					else { tmpbody.error.birthdate = 'Birthdate format DD-MM-YYYY and must be range in between 18 and 80 years old'}
				}

				if (param.address) {
					if (address.length) {
						tmpbody.address = param.address
						tmpbody.latitude = address[0].latitude
						tmpbody.longitude = address[0].longitude
					}
					// else {
					//     tmpbody.error.address = 'Not a valid address'
					// }
				}
				
				if (param.orientation) { 
					if (orientation) { tmpbody.orientation = param.orientation }
					else { tmpbody.error.orientation = 'Orientation must be Straight or Gay or Bisexual' }
				}

				if (bio) { tmpbody.bio = bio }
				else { tmpbody.bio = null }

				if (param.npassword || param.cpassword) {
					if (param.npassword === param.cpassword) {
						if (npassword) { tmpbody.npassword = await bcrypt.hash(param.npassword, 10) }
						else { tmpbody.error.npassword = 'Password must contains at least 6 characters, one uppercase and lowercase letter and one digit, only letters and digits are allowed' }
					} else
						tmpbody.error.npassword = 'New password does not match with password confirmation'
				} 

				param.tags = param.tags ? param.tags : null
				if (param.tags) {
					let tagArray = req.body.tags
					let tagAllow = [], tagNotAllow = []
					await tagArray.map(x => {
						(x.match(/^#[^\W_]{1,42}$/)) ? tagAllow.push(x) : tagNotAllow.push(x)
					})
					if (tagNotAllow.length) {
						tmpbody.error.tags = (tagNotAllow.length > 1) ? 'Those references are not considered as a valid tags (i.e #tag): ' + tagNotAllow :  'These reference are not considered as valid tag (i.e #tag): ' + tagNotAllow
					} else {
						tmpbody.tags = tagAllow
					}
				}

				req.body = tmpbody
			break;

			case 3:
				if (param.npassword || param.cpassword) {
					if (param.npassword === param.cpassword) {
						if (npassword) { req.body.npassword = await bcrypt.hash(param.npassword, 10) }
						else { req.body.error.npassword = 'Password must contains at least 6 characters, one uppercase and lowercase letter and one digit, only letters and digits are allowed' }
					} else {
						req.body.error.npassword = 'New password does not match with password confirmation'
					}
				}
				if (email) {
					req.body.email = email ? param.email : null
				}
				break;

			default:
				req.body = {}
		}
		next()
	}
}