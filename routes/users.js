const express = require("express");
// #1 Create a new express Router
const router = express.Router();
const crypto = require('crypto');
const { User } = require('../models')

const { bootstrapField, createUserForm, createLoginForm, createUpdateUserForm } = require("../forms")

const getHash = (password) => {
    const sha256 = crypto.createHash("sha256")
    const hash = sha256.update(password).digest("base64")
    return hash;
}

//  #2 Add a new route to the Express router
// CREATE NEW USER 
router.get('/register', (req, res) => {
    const registerForm = createUserForm()

    res.render("users/register", {
        form: registerForm.toHTML(bootstrapField)
    })
})

router.post('/register', (req, res) => {
    const registerForm = createUserForm()
    registerForm.handle(req, {
        "success": async(form) => {
            let emailCheck = await User.where({
                "email": form.data.email
            }).fetch({
                require: false
            })

            if (emailCheck) {
                req.flash("error_message", "Email already in use, please choose another. ")
                res.redirect("/users/register")
            } else {
                let { confirm_password, ...userData } = form.data
                userData.password = getHash(userData.password)
                const user = new User(userData)
                await user.save();
                req.flash("success_message", "New user has been created. ")
                res.redirect("/users/login")
            }
        },
        "error": (form) => {
            res.render("users/register", {
                "form": form.toHTML(bootstrapField)
            })
        }
    })
})

// UPDATE CURRENT USER

// #3 export out the router
module.exports = router;