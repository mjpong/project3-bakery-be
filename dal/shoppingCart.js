const { ShoppingCartItem, Product } = require("../models")
const productDataLayer = require('../dal/products')

const getAllItems = async (userId) => {

    return await ShoppingCartItem.collection().where({
        "user_id": userId
    }).query("orderBy", 'user_id', 'ASC').fetch({
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
    const item = await ShoppingCartItem.where({ "id": id }).fetch();
    if (item) {
        item.destroy();
        return true
    }
    return false
}

const updateQuantity = async (userId, productId, updatedQuantity) => {
    const item = await getItemByUserAndProduct(userId, productId)
    if (item) {
        item.set("quantity", updatedQuantity)
        item.save()
        return item
    } else {
        return null
    }
}

const emptyCart = async (userId) => {
    let cartItem = await getAllItems(userId)
    if (cartItem.length > 0) {
        cartItem = await ShoppingCartItem.where({
            "id": id
        }).destroy();
    }
    return cartItem
}

const updateStock = async (userId, productId) => {
    const cartItem = await getItemByUserAndProduct(userId, productId)
    const product = await productDataLayer.getProductById(cartItem.get("product_id"));
    if (product) {
        product.set('stock', product.get("stock") - cartItem.get("quantity"));
        await product.save()
        console.log("stock quantity updated")
        return true;
    } else {
        console.log("stock cannot be updated")
        return false;
    }
}

module.exports = { getAllItems, getItemById, getItemByUserAndProduct, removeItem, updateQuantity, updateStock, emptyCart }