const express = require("express");
const router = express.Router();
const { checkIfAuthJWT, checkIfAuth } = require('../../middleware');
const CartServices = require('../../services/CartServices')

//get
router.get('/', checkIfAuthJWT, async (req, res) => {
    let cart = new CartServices(req.user.id);
    try {
        const cartItems = await cart.getAll()
        res.send(cartItems.toJSON())
    } catch (e) {
        res.send("Unable to get items")
    }
})

//remove
router.delete('/remove/:product_id', checkIfAuthJWT, async (req, res) => {
    let cart = new CartServices(req.user.id)
    try {
        await cart.removeItem(req.params.product_id)

        res.status(200)
        res.send("Item removed from cart")
    } catch (e) {
        res.status(204)
        res.send("Item not found")
    }
})

//add
router.post("/add/:product_id", checkIfAuthJWT, async (req, res) => {
    let cart = new CartServices(req.user.id);
    try {
        await cart.addToCart(req.params.product_id)
        res.send("Item has been added to cart")
    } catch (e) {
        res.send("Item cannot be added")
    }
})

// add quantity
router.post('/increase/:product_id', checkIfAuthJWT, async (req, res) => {
    let cart = new CartServices(req.user.id);
    try {
        if (cart) {
            let item = await cart.getItemById(req.params.product_id);
            let product = await cart.getProductById(item.get("product_id"));
            if (item.get("quantity") < product.get("stock")) {
                item.set("quantity", item.get("quantity") + 1)
                await item.save()
                res.status(200)
                res.send(item.toJSON())
            } else {
                res.status(200)
                res.send({
                    "message": "Cannot increase item"
                })
            }
        }
    }
    catch (e) {
        res.status(204)
        res.send({
            "message": "Cannot increase item"
        })
    }

})

// reduce quantity
router.post('/decrease/:product_id', checkIfAuthJWT, async (req, res) => {
    let cart = new CartServices(req.user.id);
    try {
        if (cart) {
            let item = await cart.getItemById(req.params.product_id);
            if (item.get("quantity") > 1) {
                item.set("quantity", item.get("quantity") - 1)
                await item.save()
                res.send(item.toJSON())
            } else {
                res.status(200)
                res.send("Cannot decrease item")
            }

        }
    }
    catch (e) {
        res.status(204)
        res.send("Cannot decrease item")
    }

})


module.exports = router;