const jwt = require("jsonwebtoken")

const checkIfAuth = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        req.flash("error_message", "Please login before continuing")
        res.redirect("/user/login")
    }
}

const checkIfAuthJWT = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) {
                res.sendStatus(403)
            }
            req.user = user;
            next()
        })
    } else {
        res.status(401)
        res.send({
            "Message": "Login Required"
        })
    }
}

module.exports = { checkIfAuth, checkIfAuthJWT }