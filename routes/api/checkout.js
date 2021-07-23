const express = require('express');
const router = express.Router();
const CartServices = require('../../services/CartServices')
const Stripe = require('stripe')(process.env.STRIPE_KEY_SECRET)
const bodyParser = require("body-parser")
const { Order, User, OrderedProduct } = require("../../models")
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

    // get all items from cart
    let allItems = await cart.getAll();
    let lineItems = [];
    let meta = [];

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
            'user_id': item.get('user_id')
        })
    }

    // create stripe payment
    let metaData = JSON.stringify(meta)
    const payment = {
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: process.env.STRIPE_SUCCESS_URL + '?sessionId={CHECKOUT_SESSION_ID}',
        cancel_url: process.env.STRIPE_ERROR_URL,
        metadata: {
            'orders': metaData
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
router.post('/process_payment', bodyParser.raw({type: 'application/json'}), async (req, res) => {
    let payload = req.body;
    let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
    let sigHeader = req.headers["stripe-signature"];
    let event;
    try {
        event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);
    } catch (e) {
        res.send({
            'error': e.message
        })
        console.log(e.message)
    }
    if (event.type == 'checkout.session.completed') {
        let stripeSession = event.data.object;
        console.log(stripeSession);

        // process stripeSession
}
    res.send({ received: true });
})


module.exports = router;