const express = require('express')
const router = express.Router();
const productDataLayer = require('../../dal/products')
const { Product } = require('../../models');

router.get('/', async (req, res) => {
    const allProducts = await productDataLayer.getAllProducts()
    res.send(allProducts)
})

router.get('/flavors', async (req, res) => {
    const allFlavors = await productDataLayer.getAllFlavors()
    res.send(allFlavors)
})

router.get('/toppings', async (req, res) => {
    const allToppings = await productDataLayer.getAllToppings()
    res.send(allToppings)
})

router.get('/doughtypes', async (req, res) => {
    const allDoughTypes = await productDataLayer.getAllDoughTypes()
    res.send(allDoughTypes)
})

router.get('/ingredients', async (req, res) => {
    const allIngredients = await productDataLayer.getAllIngredients()
    res.send(allIngredients)
})

router.post('/search', async (req, res) => {
    let q = Product.collection();
    if (req.body.name) {
        q = q.where("name", "like", "%" + req.body.name.toLowerCase() + "%")
    }
    if (req.body.flavor_id) {
        q = q.where("flavor_id", "=", req.body.flavor_id)
    }
    if (req.body.dough_type_id) {
        q = q.where("dough_type_id", "=", req.body.dough_type_id)
    }

    const completeSearch = await q.fetch({
        require: false,
        withRelated: ['flavor', "dough_type", "toppings"]
    })
    res.send(completeSearch)
})

router.get('/:product_id', async (req, res) => {
    const productId = req.params.product_id
    const getProductById = await productDataLayer.getProductById(productId);
    res.send(getProductById)
})

module.exports = router;