const {ShoppingCartItem, Product} = require('../models');
const dataLayer = require('../dal/shoppingCart');

class CartServices {
    constructor(user_id){
        this.user_id = user_id;
    }

    async getAll() {
        return await dataLayer.getAllItems(this.user_id)
    }

    async addToCart(productId) {
        const cartItem = await dataLayer.getItemByUserAndProduct(this.user_id, productId)

        // test value
        let quantity = 1;

        if (cartItem == null) {
            cartItem = await new ShoppingCartItem({
                'user_id': this.user_id,
                'product_id': productId,
                'quantity': quantity
            }).save();
        } else {
            cartItem.set('quantity', cartItem.get('quantity') + quantity)
            await cartItem.save();
        }
        // await cartItem.save();
        return cartItem
    }

    async removeItem(id) {
        return await dataLayer.removeItem(id)
    }

    async updateQuantity(productId, updatedQuantity) {
        return await dataLayer.updateQuantity(this.user_id, productId, updatedQuantity)
    }
    
    async getItemById(id) {
        return await dataLayer.getItemById(id)
    }
}
module.exports = CartServices;