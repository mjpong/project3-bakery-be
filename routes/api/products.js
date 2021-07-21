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
    const getProductById = await productDataLayer.getProductById(productId);
    res.send(getProductById)
})

router.get('/flavors', async(req, res) => {
    const allFlavors = await productDataLayer.getAllFlavors()
    res.send(allFlavors)
})

router.get('/toppings', async(req, res) => {
    const allToppings = await productDataLayer.getAllToppings()
    res.send(allToppings)
})

router.get('/doughtypes', async(req, res) => {
    const allDoughTypes = await productDataLayer.getAllDoughTypes()
    res.send(allDoughTypes)
})

router.get('/ingredients', async(req, res) => {
    const allIngredients = await productDataLayer.getAllIngredients()
    res.send(allIngredients)
})

router.post('/search', async(req, res) => {
    let search = Product.collection();
    const completeSearch = await search.fetch({
        require: false,
        withRelated: ['toppings', "dough_type", "flavor", "dough_type.ingredients"]
    })
    res.send(completeSearch)
})

module.exports = router;