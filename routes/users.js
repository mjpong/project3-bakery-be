const express = require("express");
// #1 Create a new express Router
const router = express.Router();
const crypto = require('crypto');
const { User } = require('../models')

const { bootstrapField, createUserForm, createLoginForm, createUpdateUserForm } = require("../forms");
const { Router } = require("express");

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
                user.set("role", 2);
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

// LOGIN
// login page
router.get('/login', (req, res) => {
    const loginForm = createLoginForm()
    res.render('users/login', {
        'form': loginForm.toHTML(bootstrapField)
    })
})

router.post('/login', async(req, res) => {
    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async(form) => {
            let user = await User.where({
                    "email": form.data.email,
                    "role":2
                }).fetch({
                    require: false
                })
                // check pw if user exist
            if (user) {
                if (user.get("password") == getHash(form.data.password)) {
                    req.session.user = {
                        id: user.get('id'),
                        name: user.get('name'),
                        email: user.get('email')
                    }
                    req.flash("success_message", `Welcome back ${req.session.user.name}`)
                    res.redirect("/products")
                } else {
                    req.flash("error_message", `Login failed, please check credentials`)
                    res.redirect("/users/login")
                }
            } else {
                req.flash("error_message", "Login failed, please check credentials")
                res.redirect("/users/login")
            }
        },
        'error': (form) => {
            req.flash("error_messages", "Error, please fill in the form again")
            res.render('users/login', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// UPDATE USER 
router.get("/profile/update", async(req, res) => {
    if (req.session.user == undefined) {
        req.flash("error_message", "Please login to your account.")
        res.redirect("/users/login")
    } else {
        const user = await User.where({
                "email": req.session.user.email
            }).fetch({
                require: false
            })
            // Create profile form 
        const updateForm = createUpdateUserForm()
            // Fill in all the value
        updateForm.fields.name.value = user.get("name")
        updateForm.fields.email.value = user.get("email")
        updateForm.fields.dob.value = user.get("dob")
        updateForm.fields.phone.value = user.get("phone")
        updateForm.fields.address.value = user.get("address")
            // Render page

        res.render("users/profile", {
            "form": form.toHTML(bootstrapField)
        })
    }
})

router.post("/profile/update", async(req, res) => {
    const user = await User.where({
        'email': req.session.user.email
    }).fetch({
        require: true
    })
    const updateForm = createUpdateUserForm()
    updateForm.handle(req, {
        'success': async(form) => {
            let { confirm_password, ...userData } = form.data
            userData.password = getHash(userData.password)
            user.set(userData)
            await user.save()
            req.session.user = {
                id: user.get('id'),
                name: user.get('name'),
                email: user.get('email')
            }
            req.flash('success_message', "Profile Updated")
            res.redirect("/products")
        },
        "error": async(form) => {
            res.render("users/update", {
                "form": form.toHTML(bootstrapField)
            })
        }
    })
})

//PROFILE
router.get('/profile', (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error_messages', 'Please login to view this page');
        res.redirect('/users/login');
    } else {
        res.render('users/profile', {
            'user': user
        })
    }
})


// LOGOUT

router.get("/logout", (req, res) => {
    req.session.user = null
    req.flash("success_message", "Logout successful.")
    res.redirect("/users/login")
})





// #3 export out the router
module.exports = router;