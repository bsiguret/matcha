const fs = require('fs')
const userQuery = require('../models/userModel')

module.exports = (req,res,next) => {
    let error = {
        msg: 'Invalid file',
        code: 'ERR_INVALID_FILE'
    }

    let dataType, payload,
        photo = req.body.photo, 
        defineAs = req.body.defineAs

    dataType = photo.match(/^data:image\/(?:gif|png|jpeg|jpg)/)
    dataType = dataType ? dataType[0] : error.code
    payload = photo.split(/^data:image\/(?:gif|png|jpeg|bmp|webp)(?:;charset=utf-8)?;base64,/)
    payload = payload ? payload[1] : error.code

    if (dataType === error.code || payload === error.code) {
        return next(error)
    }
    if (dataType === "data:image/png") {
        userQuery.countImg({id: req.user.id}).then((size, err) => {
            if (err) { next(err) }
            if (size.Maxphoto < 5) {
                const userStorage = 'front-end/public/uploads/'+ encodeURIComponent(req.user.username) +'/'
                const filename = userStorage + 'photo'+ Date.now() +'.png'
                if (!fs.existsSync(userStorage)) {
									fs.mkdirSync(userStorage)
                }
                fs.writeFile("./"+filename, payload, {encoding: 'base64'}, function(err) {
									req.body.path = filename
									next()
                });
            } else {
                error.msg = '5 photos max'
                next(error)
            }
        })
    } else {
        error.msg = 'Invalid Format'
        next(error)
    }
}