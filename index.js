const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
const session = require("express-session")
const flash = require("connect-flash")
const csrf = require("csurf")
const cors = require("cors")

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
    express.urlencoded({
        extended: false
    })
);

// enable cors 
app.use(cors());

// enable csrf
app.use(csrf());

// setup sessions
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true
}))

// setup flash
app.use(flash())

// setup global middleware
app.use(function(req, res, next) {
    res.locals.success_message = req.flash("success_message")
    res.locals.error_message = req.flash("error_message")
    next()
})

// global middleware for hbs sessions
app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    next()
})

//share csrf with hbs files 
app.use(function(req, res, next) {
    if (req.csrfToken) {
        res.locals.csrfToken = req.csrfToken();
    }
    next()
})

const landingRoutes = require('./routes/landing')
const productRoutes = require("./routes/products")
const userRoutes = require("./routes/users")
const orderRoutes = require("./routes/orders")
const api = {
    products: require('./routes/api/products'),
    users: require("./routes/api/users")
}

async function main() {
    app.use('/', landingRoutes)
    app.use("/products", productRoutes)
    app.use("/users", userRoutes)
    app.use("/orders", orderRoutes)
    app.use('/api/products', express.json(), api.products)
    app.use('/api/users', express.json(), api.users)

}

main();

app.listen(3000, () => {
    console.log("Server has started");
});