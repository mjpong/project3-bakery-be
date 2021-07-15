const express = require("express");
// #1 Create a new express Router
const router = express.Router();

// import in the Forms
const { bootstrapField, createProductForm } = require('../forms')

const { Product, Flavor, DoughType } = require("../models")

//  #2 Add a new route to the Express router
router.get('/', (req,res)=>{
    res.render("products/index")
})

router.get('/')

router.get('/create', async (req, res) => {
    const productForm = createProductForm();
    res.render('products/create',{
        'form': productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async(req,res)=>{
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async (form) => {
            const product = new Product();
            product.set('name', form.data.name);
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            product.set('stock',form.data.stock);
            product.set('image',form.data.image);
            product.set('flavor_id', form.data.flavor_id);
            product.set('dough_type_id', form.data.dough_type_id)
            await product.save();
            res.redirect('/products');

        },
        'error': async (form) => {
            res.render("products/create", {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// #3 export out the router
module.exports = router; 