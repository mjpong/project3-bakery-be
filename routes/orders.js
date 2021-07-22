const express = require("express");
// #1 Create a new express Router
const router = express.Router();
const { Order, OrderStatus, Product } = require("../models")
// import in DAL
const dataLayer = require('../dal/orders');
const { checkIfAuth } = require("../middleware");
const OrderServices = require("../services/OrderServices");


//  #2 Add a new route to the Express router
// All Orders
router.get('/', async (req, res) => {
    const orderServices = new OrderServices()
    const allOrders = await orderServices.getAll()

    res.render("orders/index", {
        'orders': allOrders.toJSON()
    })

})

// #3 export out the router
module.exports = router;