const express = require("express");
// #1 Create a new express Router
const router = express.Router();
const { Order, OrderStatus, Product } = require("../models")
// import in DAL
const dataLayer = require('../dal/orders');
const { checkIfAuth } = require("../middleware");


//  #2 Add a new route to the Express router
// All Orders
router.get('/', checkIfAuth, async (req, res) => {

    const allOrders = await dataLayer.getAllOrderStatus()
    res.render("orders/index")
})

// #3 export out the router
module.exports = router;