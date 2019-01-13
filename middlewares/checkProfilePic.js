const userQuery = require('../models/userModel')

module.exports = async (req, res, next) => {
    await userQuery.selectAllPhotos(req.user.id).then(async(records, err) => {
        if (err) throw 'User not found'
        let profilePic = null;
        
        await records.forEach((record) => {
            if (record.profile == 1) {
                profilePic = record.srcimg
            }
        })
        req.body.src = profilePic
        next()
    })
}