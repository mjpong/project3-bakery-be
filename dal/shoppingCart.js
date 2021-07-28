const {ShoppingCartItem, Product} = require("../models")

const getAllItems = async(userId) => {

    return await ShoppingCartItem.collection().where({
        "user_id": userId
    }).fetch({
        require: false,
        withRelated: ['product']
    })
}

const getItemByUserAndProduct = async (userId, productId) => {
    return await ShoppingCartItem.where({
        "user_id": userId,
        "product_id": productId
    }).fetch({
        require: false,
    })
}

const getItemById = async (id) => {
    return await ShoppingCartItem.where({
        "id": id
    }).fetch({
        require: false
    })
}

const removeItem = async (id) => {
    const item = await ShoppingCartItem.where({"id": id}).fetch();
    if (item) {
        await item.destroy();
        return true
    }
    return false
}

const updateQuantity = async (userId, productId, updatedQuantity) => {
    const item = await getItemByUserAndProduct(userId, productId)
    if (item) {
        item.set("quantity", updateQuantity)
        item.save()
        return item
    } else {
        return null
    }
}

module.exports = { getAllItems, getItemById, getItemByUserAndProduct, removeItem, updateQuantity }