const dataLayer = require('../dal/orders');

class OrderServices{
    constructor(user_id) {
        this.user_id = user_id
    }

    async getAll() {
        return await dataLayer.getAllOrders(this.user_id)
    }

    async getOrderById(id) {
        return await dataLayer.getOrderById(id)
    }




}

module.exports = OrderServices