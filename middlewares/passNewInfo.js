const userQuery = require('../models/userModel')
const bcrypt = require('bcrypt')

module.exports = async (req, res, next) => {
    if (req.body.password) {
        userQuery.findOne({id: req.user.id}).then(async (user, err) => {
            if (err) throw 'ERR_TOKEN_MIDDLEWARE_ACCESS_SETTINGS'
            return bcrypt.compare(req.body.password, user.password)
        }).then(match => { 
            if (match) { next() } 
            else { throw {password: 'Wrong password !'} }
        }).catch(e => { 
            res.status(401).json({errMsg: e}) 
        })
    } else {
        userQuery.findOne({id: req.user.id}).then(async (user, err) => {
            if (err) throw 'ERR_TOKEN_MIDDLEWARE_ACCESS_SETTINGS'
            if (user.id42)
                return true
            else
                return false
        }).then(match => { 
            if (match) { next() } 
            else { throw {password: 'Wrong password !'} }
        }).catch(e => { 
            res.status(401).json({errMsg: e}) 
        })
    }
}