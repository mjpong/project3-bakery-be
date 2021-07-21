const express = require('express')
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User, BlacklistedToken } = require('../../models');
const { checkIfAuthJWT } = require('../../middleware');

const generateAccessToken = (expiresIn) => {
    return jwt.sign({
        'username': user.get('username'),
        'id': user.get('id'),
        'email': user.get('email')
    }, process.env.TOKEN_SECRET, {
        expiresIn: expiresIn
    })
}

const getHash = (password) => {
    const sha256 = crypto.createHash("sha256")
    const hash = sha256.update(password).digest("base64")
    return hash;
}


router.post('/login', async(req, res) => {
    let user = await User.where({
        'email': req.body.email
    }).fetch({
        require: false
    });

    if (user && user.get('password') == getHash(req.body.password)) {
        const userObject = {
            "name": user.get("name"),
            "email": user.get("email"),
            "id": user.get("id")
        }
        let accessToken = generateAccessToken(userObject, process.env.TOKEN_SECRET, "15m");
        let refreshToken = generateAccessToken(userObject, process.env.REFRESH_TOKEN_SECRET, "7d")
        let id = user.get("id")
        res.send({
            accessToken, refreshToken, id
        })
    } else {
        res.send({
            'error': "Wrong Credentials"
        })
    }
})

router.get('/profile', checkIfAuthJWT, async(req, res) => {
    let user = req.user
    res.send(user)
})

router.post("/refresh", async (req, res) => {
    let refreshToken = req.body.refreshToken
    if (!refreshToken) {
        res.sendStatus(401)
    }

    let blacklistedToken = await BlacklistedToken.where({
        "token": refreshToken
    }).fetch({
        require: false
    })

    if (blacklistedToken){
        res.status(401)
        res.send("Refresh Token Expired")
        return;
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=> {
        if (err) {
            return res.sendStatus(403);
        }

        let accessToken = generateAccessToken(user, process.env.TOKEN_SECRET, '15m');
        res.send({
            accessToken
        })
    })
})

router.post("/logout", async (req, res) => {
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(403);
    } else {
        let blacklistedToken = await BlacklistedToken.where({
            "token": refreshToken
        }).fetch({
            require: false
        })

        if (blacklistedToken) {
            res.status(401)
            res.send("Token Expired")
            return
        }
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) {
                res.sendStatus(403);
            } else {
                const token = new BlacklistedToken();
                token.set("token", refreshToken)
                token.set("date_created", new Date())
                await token.save()
                res.send({
                    "Message": "Session Logged Out"
                })
            }
        })
    }
})

router.post("/register", async(req,res) => {
    let checkEmail = await User.where ({
        "email": req.body.email
    }).fetch({
        require: false
    })
    if (checkEmail) {
        res.send("Email already in use")
    } else {
        try {
            const user = new User()
            user.set("name", req.body.name)
            user.set("email", req.body.email)
            user.set('password', getHash(req.body.password))
            user.set('address', req.body.address)
            user.set('phone', req.body.phone)
            user.set("dob", req.body.dob)
            await user.save()
        } catch (e) {
            res.send("Unable to create user")
        }
    }
})

// get user details
router.get("/edit/:user_id", async (req, res) => {
    let id = req.params.user_id
    try {
        let user = await User.where({
            "id": id
        }).fetch({
            require: true
        })
        res.send(user)
    } catch (e) {
        console.log(e)
        res.send("Error")
    }
})

// POST Profile change
router.post("/edit/:user_id", async (req, res) => {
    let id = req.params.user_id
    let user = await User.where({
            "id": id
        }).fetch({
            require: true
        })
        
    if (req.body.password){
        try {
            user.set("password", getHash(req.body.password))
            user.save()
            res.send("Password Updated")
        } catch (e) {
            console.log(e)
            res.send("Update error")
        }
    }

    if (req.body.address){
        try {
            user.set("address", req.body.address)
            user.save()
            res.send("Address has been updated")
        } catch (e) {
            console.log(e)
            res.send("Update error")
        }
    }
})
module.exports = router