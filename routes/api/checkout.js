const express = require('express');
const router = express.Router();
const CartServices = require('../../services/CartServices')
const Stripe = require('stripe')(process.env.STRIPE_KEY_SECRET)
const bodyParser = require("body-parser")
const { Order, User, OrderProduct } = require("../../models")
const jwt = require("jsonwebtoken")

router.get('/:user_id', async (req, res) => {
    let user_info = "";

    jwt.verify(req.query.token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            res.sendStatus(403)
        }
        user_info = user;
    })
    const cart = new CartServices(user_info.id)

    //create a new order with status pending
    const newOrder = new Order()
    newOrder.set("user_id", user_info.id)
    newOrder.set("order_status_id", 1)
    newOrder.set("reciever_name", req.query.name)
    newOrder.set("receiver_address", req.query.address)
    newOrder.set("order_date", new Date())
    await newOrder.save()

    // get all items from cart
    let allItems = await cart.getAll();
    let lineItems = [];
    let meta = [];

    const cartServices = new CartServices( user_info.id)

    for (let item of allItems) {
        const lineItem = {
            "name": item.related("product").get("name"),
            "amount": item.related("product").get("cost"),
            "quantity": item.get("quantity"),
            "currency": "SGD"
        }
        if (item.related('product').get('image')) {
            lineItem.images = [item.related('product').get("image")]
        }
        lineItems.push(lineItem);
        meta.push({
            'product_id': item.get('product_id'),
            'quantity': item.get('quantity'),
            'order_id': item.get('order_id'),
            'cost': item.get('cost')
        })

        const newOrderProduct = new OrderProduct();
        newOrderProduct.set("product_id", item.get('product_id'))
        newOrderProduct.set("order_id", newOrder.get("id"))
        newOrderProduct.set("quantity", item.get('quantity'))
        newOrderProduct.set("cost",item.related("product").get("cost"),)
        await newOrderProduct.save();

        // update and delete cart items
        await cartServices.removeItem(item.get('product_id'))
    }

    // create stripe payment
    let metaData = JSON.stringify(meta)
    const payment = {
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: process.env.STRIPE_SUCCESS_URL + '?sessionId={CHECKOUT_SESSION_ID}',
        cancel_url: process.env.STRIPE_ERROR_URL,
        metadata: {
            'orders': metaData,
            'order_id': newOrder.get("id")
        }
    }

    // register session
    let stripeSession = await Stripe.checkout.sessions.create(payment);

    res.render("checkout/checkout", {
        "sessionId": stripeSession.id,
        "publishableKey": process.env.STRIPE_KEY_PUBLISHABLE
    })

})

//post for stripe to retrieve data via webhook
router.post('/process_payment', express.json({ type: 'application/json' }), async (req, res) => {
    let event = req.body;
    if (event.type == 'checkout.session.completed') {
        let stripeSession = event.data.object;
        // metadata into json formate to process
        let items = stripeSession.metadata.orders
        items = JSON.parse(items)

        // change order details and status to paid 
        let selectedOrder = await Order.where({
            "id": stripeSession.metadata.order_id
        }).query(
            o => o.orderBy("id", "DESC").limit(1)
        ).fetch()

        selectedOrder.set("total_cost", stripeSession.amount_total)
        selectedOrder.set("order_status_id", 2)
        await selectedOrder.save()
    }
    res.sendStatus(200)
})


module.exports = router;