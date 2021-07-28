const express = require('express')
const router = express.Router();
const productDataLayer = require('../../dal/products')
const { Order, Product, OrderProduct} = require('../../models');

// All Orders
router.get('/', async (req, res) => {
    const orderServices = new OrderServices()
    const allOrders = await orderServices.getAll()

    res.render("orders/index", {
        'orders': allOrders.toJSON()
    })

})


module.exports = router;