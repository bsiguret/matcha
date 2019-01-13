'use strict'

const moment = require('moment')

const purifyInput = (str) => {
    if (!str)
        return false;
    str = str.toLowerCase().trim();
    return str;
}

const parseInput = (str) => {
    let tmp = null;
    if (str = purifyInput(str)) {
        tmp = str
        str = str.replace(/ +/g, "")
        return str = (str == tmp) ? str : false
    }
    return false
}

module.exports = {
    purifyInput,
    parseInput,
    isValidStr : (str) => {
        if (str = parseInput(str)) {
            return (str.match(/^[a-z\s]{2,20}$/) ? true : false)
        }
        return false
    },
    
    isValidUsername : (str) => {
        if (str = parseInput(str)) {
            return (str.match(/^[a-z0-9._-\s]{2,30}$/) ? true : false)
        }
        return false
    },

    isValidGender : (gender) => {
        let validGender = ['Man', 'Women', 'Other']
        return ((validGender.indexOf(gender) !== -1) ? true : false)
    },

    isValidOrientation : (orientation) => {
        let validGender = ['Straight', 'Gay', 'Bisexual']
        return ((validGender.indexOf(orientation) !== -1) ? true : false)
    },
    
    isValidEmail : (email) => {
        if (!email)
            return false
        return (email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/) ? true : false)
    },
    
    isValidPassword : (password) => {
        if (!password)
            return false
        return (password.match(/^\S*(?=\S{6,})(?=\S*[a-z])(?=\S*[A-Z])(?=\S*[\d])\S*$/) ? true : false)
    },

    isValidDate : (birthdate) => {
        if (!birthdate.length) {
            return false
        }
        let birth = moment(birthdate, 'DD-MM-YYYY', true)
        if (birth.isValid()) {
            let age = moment().diff(birth, 'years')
            if (age >= 18 && age <= 80) {
                return true
            }
            return false
        }
        return false
    },

    isValidIp : (ip) => {
        if (!ip)
            return false
        return (ip.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/) ? true : false)
    },

    isCompleted : (user, records) => {
        let complete = true
        if (!records.length) { return false }
        if (!user.firstname.length) { return false }
        if (!user.lastname.length) { return false }
        if (!user.username.length) { return false }
        if (!user.birthdate) { return false }
        if (!user.email.length) { return false }
        if (!user.password.length && !user.id42) { return false }
        if (!user.gender.length) { return false }
        if (!user.orientation.length) { return false }
        if (!user.bio) { return false }
        if (!user.address) { return false }
        if (!user.latitude) { return false }
        if (!user.longitude) { return false }
        
        return complete
    }
}