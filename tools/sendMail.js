const uuidv1 = require('uuid/v1')           // Version 1(timestamp)
const nodemailer = require('nodemailer')    // Send email from Node.js

const userQuery = require('../models/userModel')

const sendMailTo = (username, email, action) => {
    username = encodeURIComponent(username)
    let verifyAccount = uuidv1()
    let subject = (action === 3) ? 'Matcha reseting password' : 'Matcha verifying account'
    let url = (action === 3) ? 'http://localhost:3001/resetpass/' + username + '/' + verifyAccount : 'http://localhost:3001/emailconfirm/' + username + '/' + verifyAccount
    let text = (action === 3) ? '<p>Click or copy/paste <a href="'+ url +'">'+ url +'</a> to reset your password</p>' : '<p>Click or copy/paste <a href="'+ url +'">'+ url +'</a> to confirm your account</p>'

    const transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.SMTP_MAIL_AUTH,
          pass: process.env.SMTP_MAIL_PASS
        }
      });

    return new Promise((resolve, reject) => {
        return userQuery.update({table: 'User', fields:{token: verifyAccount}, where:{email: email} }).then((result, err) => {
            if (err) { throw err }
            transporter.sendMail({
                from: 'Matcha matcha@student.42.fr',
                to: email,
                subject: subject,
                html: text
            }, (err, info) => {
                if (err) { reject({sendMail: err}) }
                if (action === 1) { resolve({errMsg: 'User has been created, check your email and confirm your account'/*, emailSent: info*/}) }
                if (action === 2) { resolve({errMsg: 'Email confirmation re-sent'/*, emailSent: info.response*/}) }
                if (action === 3) { resolve({errMsg: 'The resetting\'s password link has been sent by email'/*, emailSent: info*/}) }
            })
        }).catch(e => { reject({sendMail: e}) })
    })
}

module.exports = {
    sendMailTo
}