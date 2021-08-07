const express = require('express')
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User, BlacklistedToken } = require('../../models');
const { checkIfAuthJWT } = require('../../middleware');


const generateAccessToken = (user, token, expiresIn) => {
    return jwt.sign({
        'name': user.get('name'),
        'id': user.get('id'),
        'email': user.get('email')
    }, token, {
        expiresIn: expiresIn
    })
}

const getHash = (password) => {
    const sha256 = crypto.createHash("sha256")
    const hash = sha256.update(password).digest("base64")
    return hash;
}

const getUserByEmail = async (email) => {
    let user = await User.where({
        email
    }).fetch({
        require: false
    })
    return user;
}

router.post('/login', async (req, res) => {
    let user = await User.where({
        'email': req.body.email,
        "role": 1
    }).fetch({
        require: false
    });

    if (user && user.get('password') == getHash(req.body.password)) {
        let accessToken = generateAccessToken(user, process.env.TOKEN_SECRET, "60m");
        let refreshToken = generateAccessToken(user, process.env.REFRESH_TOKEN_SECRET, "7d")
        let id = user.get("id")

        res.json({
            accessToken, refreshToken, id
        })
    } else {
        res.statusCode = 204
        res.send({
            'error': "Wrong Credentials"
        })
    }
})

router.get('/profile', checkIfAuthJWT, async (req, res) => {
    let user = await User.where({
        'id': req.user.id
    }).fetch({
        require: true
    });
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

    if (blacklistedToken) {
        res.statusCode = 401
        res.send("Refresh Token Expired")
        return;
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }

        let userModel = await User.where({
            'email': req.body.email,
            "role": 1
        }).fetch({
            require: false
        });
        let accessToken = generateAccessToken(userModel, process.env.TOKEN_SECRET, '60m');
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
            res.statusCode = 401
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

router.post("/register", async (req, res) => {
    if (req.body.password !== req.body.confirmPassword) {
        res.send("Passwords do not match");
    }

    let checkEmail = await User.where({
        "email": req.body.email
    }).fetch({ require: false });

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
            user.set("role", 1);
            await user.save()
            res.send(user);
        } catch (e) {
            console.log(e)
            res.send("Unable to create user")
        }
    }
})

// POST Profile change
router.post("/update", checkIfAuthJWT, async (req, res) => {
    // if (req.body.password !== req.body.confirmPassword) {
    //     res.send("Passwords do not match");
    // }

    try {

        let user = await User.where({
            "id": req.user.id
        }).fetch({
            require: true
        })
        user.set("name", req.body.name)
        user.set("email", req.body.email)
        user.set('password', getHash(req.body.password))
        user.set('address', req.body.address)
        user.set('phone', req.body.phone)
        user.set("dob", req.body.dob)
        user.set("role", 1);
        console.log(user)
        await user.save()

        res.status(200)
        res.send(user.toJSON())
    } catch (e) {
        console.log(e)
        res.send('Update profile error')
    }
})

module.exports = router