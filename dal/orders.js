const {Order, OrderStatus, Product, OrderedProduct} = require("../models")

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

const getOrderById = async () => {
    return await Order.where({
        "id": id
    }).fetch({
        require: true,
        withRelated: ["order_status"]
    })
}

getOrderedProductById = async (id) => {
    return await OrderedProduct.where({
        'id': parseInt(id)
    }).fetch({
        require: true,
        withRelated: ['orders', 'products']
    })
}

module.exports = { getAllOrders, getAllOrderStatus, getOrderById, getOrderedProductById}