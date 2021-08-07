const express = require('express')
const router = express.Router();
const dataLayer = require('../../dal/products');
const { checkIfAuthJWT } = require('../../middleware');
const { Order, Product, OrderProduct, OrderStatus } = require('../../models');
const OrderServices = require('../../services/OrderServices');

// All Orders per user
router.get('/', checkIfAuthJWT, async (req, res) => {
    let order = new OrderServices(req.user.id)
    try {
        const allOrders = await order.getAllOrdersByUser()
        res.send(allOrders.toJSON())
    } catch (e) {
        res.send("Unable to get orders")
    }
})

// Specific Order per user
router.get("/:order_id", checkIfAuthJWT, async (req, res) => {
    let order = new OrderServices(req.user.id)
    try {
        const eachOrder = await order.getOrderById(req.params.order_id)
        res.send(eachOrder.toJSON())
    } catch (e) {
        res.send("Unable to get individual order")
    }

})
module.exports = router;