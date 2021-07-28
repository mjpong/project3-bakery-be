const express = require("express");
// #1 Create a new express Router
const router = express.Router();
const { Order, OrderStatus, Product, OrderProduct } = require("../models")
const { bootstrapField, createOrderUpdateForm } = require('../forms');
// import in DAL
const dataLayer = require('../dal/orders');
const { checkIfAuth } = require("../middleware");
const OrderServices = require("../services/OrderServices");


//  #2 Add a new route to the Express router
// All Orders
router.get('/', async (req, res) => {
    const orderServices = new OrderServices()
    let allOrders = await orderServices.getAll()
    let allOrdersJSON = allOrders.toJSON()

    for (let order of allOrdersJSON) {
        let date = order.order_date;
        let cost = order.total_cost;
        order['orderDateShort'] = date.toLocaleDateString('en-GB')
        order['orderCost'] = (cost / 100).toFixed(2)
    }
    console.log(allOrdersJSON)
    res.render("orders/index", {
        'orders': allOrdersJSON
    })

})

// get specific order by id
router.get("/:order_id", async (req, res) => {
    const orderId = req.params.order_id
    const order = await dataLayer.getOrderById(orderId)
    const orderJSON = order.toJSON()
    const allOrderStatus = await dataLayer.getAllOrderStatus()

    // const eachOrderProduct = await dataLayer.getOrderProductById(orderId)
    // const eachOrderProductJSON = eachOrderProduct.toJSON()
    // console.log(eachOrderProductJSON)

    let date = orderJSON.order_date;
    let totalCost = orderJSON.total_cost;
    orderJSON['orderDateShort'] = date.toLocaleDateString('en-GB')
    orderJSON['orderCost'] = (totalCost / 100).toFixed(2)

    const form = createOrderUpdateForm(allOrderStatus)
    form.fields.status_id.value = order.get("status_id")

    // for (let order of eachOrderProductJSON) {
    //     let date = order.order_date;å
    //     let cost = order.total_cost;
    //     order['orderDateShort'] = date.toLocaleDateString('en-GB')
    //     order['orderCost'] = (cost / 100).toFixed(2)
    // }

    console.log(orderJSON.orders_products)

    res.render("orders/details", {
        "form": form.toHTML(bootstrapField),
        "order": orderJSON
    })

})

router.post('/:order_id', async (req, res) => {
    const orderId = req.params.order_id
    const order = await dataLayer.getOrderById(orderId)
    const allOrderStatus = await dataLayer.getAllOrderStatus()
    const form = createOrderUpdateForm(allOrderStatus)
    
    form.handle(req,{
        "success": async (form) => {
            console.log(form.data)
            order.set("order_status_id", form.data.status_id);
            // order.set(form.data)
            if (form.data.status_id == "4"){
                order.set("completion_date", new Date())
            } else {
                order.set("completion_date", null)
            }
            await order.save()
            req.flash("success_message", "Order status updated")
            res.redirect("/orders")
        }, 
        "error": async (form) => {
            res.render("orders/details", {
                "form": form.toHTML(bootstrapField)
            })
        }
    })
})

router.get("/:order_id/delete", async (req,res) => {
    const orderId = req.params.order_id
    const order = await dataLayer.getOrderById(orderId)
    res.render("orders/delete", {
        "order": order.toJSON()
    })
})

router.post("/:order_id/delete", async (req, res) => {
    const orderId = req.params.order_id
    const order = await dataLayer.getOrderById(orderId)
    await order.destroy()
    req.flash("success_message", "Order has been deleted.")
    res.redirect("/orders")
})

// #3 export out the router
module.exports = router;