const {Order, OrderStatus, Product, OrderProduct} = require("../models")

const getAllOrders = async () => {
    return await Order.collection().fetch({
        withRelated: ['status', 'products']
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
        "id": id
    }).fetch({
        require: true,
        withRelated: ["order_status"]
    })
}

getOrderProductById = async (id) => {
    return await OrderProduct.where({
        'id': parseInt(id)
    }).fetch({
        require: true,
        withRelated: ['orders', 'products']
    })
}

module.exports = { getAllOrders, getAllOrderStatus, getOrderById, getOrderProductById}