const express = require('express')
const router = express.Router();
const dataLayer = require('../../dal/products')
const { Order, Product, OrderProduct, OrderStatus} = require('../../models');

// All Orders per user
router.get('/:user_id', async (req, res) => {
    let userId = req.params.user_id
    let orders = await Order.where({
        "user_id": userId
    }).fetchAll({
        require: false,
        withRelated: ["status"]
    })
    if (orders) {
        res.send(orders)
    } else {
        res.send("No Orders")
    }
})

// Specific Order per user
router.get("/:user_id/:order_id", async (req, res) => {
    let orderId = req.params.order_id
    let orders_products = await OrderProduct.where({
        "order_id": orderId
    }).fetchAll({
        require: false,
        withRelated: ["orders", "products", "products.name", "products.description"]
    })
    res.send(orders_products)

})
module.exports = router;