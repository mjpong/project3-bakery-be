const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

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

const landingRoutes = require('./routes/landing')
const productRoutes = require("./routes/products")
const userRoutes = require("./routes/users")
const orderRoutes = require("./routes/orders")
const api = {
    products: require('./routes/api/products')
}

async function main() {
    app.use('/', landingRoutes)
    app.use("/products", productRoutes)
    app.use("/users", userRoutes)
    app.use("/orders", orderRoutes)
    app.use('/api/products', express.json(), api.products)

}

main();

app.listen(3000, () => {
    console.log("Server has started");
});