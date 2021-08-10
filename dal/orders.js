const { Order, OrderStatus, Product, OrderProduct } = require("../models")

const getAllOrders = async () => {
    return await Order.collection().fetch({
        require: true,
        withRelated: ['order_status', 'orders_products']
    })
}

const getAllOrdersByUser = async (userId) => {
    return await Order.collection().where({
        "user_id": userId,
    }).fetch({
        require: false,
        withRelated: ['order_status', 'orders_products']
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

module.exports = { getAllOrders, getAllOrdersByUser, getAllOrderStatus, getOrderById, getOrderProductById }