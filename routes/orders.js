const express = require("express");
// #1 Create a new express Router
const router = express.Router();
const { Order, OrderStatus, Product, OrderProduct } = require("../models")
const { bootstrapField, createOrderUpdateForm, createOrderSearchForm } = require('../forms');
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
    let allStatus = await orderServices.getAllStatus()

    allStatus.unshift([0, "-"])
    const searchForm = createOrderSearchForm(allStatus)

    // Query Connector
    let q = Order.collection();

    searchForm.handle(req, {
        'empty': async (form) => {
            const orderServices = new OrderServices()
            let allOrders = await orderServices.getAll()
            let allOrdersJSON = allOrders.toJSON()

            for (let order of allOrdersJSON) {
                let date = order.order_date;
                let cost = order.total_cost;
                order['orderDateShort'] = date.toLocaleDateString('en-GB')
                order['orderCost'] = (cost / 100).toFixed(2)
            }

            res.render("orders/index", {
                "orders": allOrdersJSON.reverse(),
                "form": form.toHTML(bootstrapField)
            })

        },
        'error': async (form) => {

            const orderServices = new OrderServices()
            let allOrders = await orderServices.getAll()
            let allOrdersJSON = allOrders.toJSON()

            for (let order of allOrdersJSON) {
                let date = order.order_date;
                let cost = order.total_cost;
                order['orderDateShort'] = date.toLocaleDateString('en-GB')
                order['orderCost'] = (cost / 100).toFixed(2)
            }

            res.render("orders/index", {
                "orders": allOrdersJSON.reverse(),
                "form": form.toHTML(bootstrapField)
            })

        },
        'success': async (form) => {

            if (form.data.status_id !== "0") {
                q = q.where("order_status_id", "=", form.data.status_id)
            }

            if (form.data.order_id) {
                q = q.where("id", "=", form.data.order_id)
            }

            if (form.data.user_id) {
                q = q.where("user_id", "=", form.data.user_id)
            }

            if (form.data.reciever_name) {
                q = q.where("reciever_name", "like", "%" + form.data.reciever_name + "%")
            }

            if (form.data.min_cost) {
                q = q.where("total_cost", ">=", form.data.min_cost)
            }

            if (form.data.max_cost) {
                q = q.where("total_cost", "<=", form.data.max_cost)
            }

            let orders = await q.fetch({
                withRelated: ["order_status"]
            })

            let ordersJSON = orders.toJSON()
            for (let order of ordersJSON) {
                let date = order.order_date;
                let cost = order.total_cost;
                order['orderDateShort'] = date.toLocaleDateString('en-GB')
                order['orderCost'] = (cost / 100).toFixed(2)
            }

            res.render("orders/index", {
                "orders": ordersJSON.reverse(),
                "form": form.toHTML(bootstrapField)
            })
        }
    })

})

// get specific order by id
router.get("/:order_id", async (req, res) => {
    const orderId = req.params.order_id
    const order = await dataLayer.getOrderById(orderId)
    const orderJSON = order.toJSON()
    const allOrderStatus = await dataLayer.getAllOrderStatus()

    let date = orderJSON.order_date;
    let totalCost = orderJSON.total_cost;
    orderJSON['orderDateShort'] = date.toLocaleDateString('en-GB')
    orderJSON['orderCost'] = (totalCost / 100).toFixed(2)

    const form = createOrderUpdateForm(allOrderStatus)
    form.fields.status_id.value = order.get("status_id")


    for (let i = 0; i < orderJSON.orders_products.length; i++) {
        let cost = orderJSON.orders_products[i]['product']['cost']
        orderJSON.orders_products[i]['product']['cost'] = (cost / 100).toFixed(2)
    }

    // console.log(orderJSON.orders_products)

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

    form.handle(req, {
        "success": async (form) => {
            console.log(form.data)
            order.set("order_status_id", form.data.status_id);

            if (form.data.status_id == "4") {
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

router.get("/:order_id/delete", async (req, res) => {
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