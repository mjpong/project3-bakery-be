const {Order, OrderStatus, Product, OrderProduct} = require("../models")

const getAllOrders = async () => {
    return await Order.collection().fetch({
        withRelated: ['order_status', 'orders_products'],
        require: true
    })
}

const getAllOrderStatus = async () => {
    const allOrderStatus = await OrderStatus.fetchAll().map(s => {
        return [s.get("id"), s.get("status")]
    })
    return allOrderStatus
    
}

const getOrderById = async (id) => {
    return await Order.where({
        "id": parseInt(id)
    }).fetch({
        require: true,
        withRelated: ["order_status", "orders_products", "orders_products.product"]
    })
}

getOrderProductById = async (id) => {
    return await OrderProduct.where({
        'id': parseInt(id)
    }).fetch({
        require: true,
        withRelated: ['orders', 'orders_products', "products"]
    })
}

module.exports = { getAllOrders, getAllOrderStatus, getOrderById, getOrderProductById}