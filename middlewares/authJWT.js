const jwt = require('jsonwebtoken')         // Token JWT format

const authJWT = (req,res,next) => {
    const header = req.headers['authorization']
    if (typeof header != 'undefined') {
        const bearer = header.split(' ')
        const token = bearer[1]

        jwt.verify(token, process.env.JWT_KEY, (err, user) => {
            if (err) {
                res.sendStatus(401)
            } else {
                req.user = {}
                req.user.id = user.payload.id
                req.user.username = user.payload.username
                next()
            }
        })
    } else {
        res.sendStatus(401)
    }
}

module.exports = authJWT