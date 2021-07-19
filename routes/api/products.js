const express = require('express')
const router = express.Router();
const productDataLayer = require('../../dal/products')
const { Product } = require('../../models');

router.get('/', async(req, res) => {
    const allProducts = await productDataLayer.getAllProducts()
    res.send(allProducts)
})

router.get('/:product_id', async(req, res) => {
    const productId = req.params.product_id
    const getProductById = await productDataLayer.getProductById(productId)
    res.send(getProductById)
})

router.post('/search', async(req, res) => {
    let search = Product.collection();
    const completeSearch = await search.fetch({
        require: false,
        withRelated: ["toppings", "flavors", "ingredients", "doughtype"]
    })
    res.send(completeSearch)
})

module.exports = router;