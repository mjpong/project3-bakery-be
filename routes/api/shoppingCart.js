const express = require("express");
const router = express.Router();

const CartServices = require('../../services/CartServices')

//get
router.get('/:user_id', async(req,res)=> {
    let cart = new CartServices(req.params.user.id);
    try {
        const cartItems = await cart.getAll()
        res.send(cartItems.toJSON())
    } catch (e) {
        res.send("Unable to get items")
    }
})

//add
router.get("/:user_id/:product_id/add", async(req,res) => {
    let cart = new CartServices(req.params.user.id);
    try {
        await cart.addToCart(req.params.product_id)
        res.send("Item has been added to cart")
    } catch (e) {
        res.send("Item cannot be added")
    }
})

//update
router.post('/:user_id/:product_id/update', async(req,res) => {
    let cart = new CartServices(req.params.user.id);
    try{
        await cart.updateQuantity(req.params.tea_id, req.body.quantity)
        res.send('Item quantity updated')
    } catch (e) {
        res.send("Item not found")
    }
}) 


//remove
router.get('/:user_id/:product_id/remove'), async (req, res) => {
    let cart = new CartServices(req.params.user_id)
    try {
        await cart.removeItem(req.params.product_id)
        res.send("Item removed from cart")
    } catch (e) {
        res.send("Item not found")
    }
}

module.exports = router;