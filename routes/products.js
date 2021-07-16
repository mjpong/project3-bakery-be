const express = require("express");
// #1 Create a new express Router
const router = express.Router();

// import in the Forms
const {
    bootstrapField,
    createProductForm,
    createFlavorForm,
    createDoughTypeForm,
    createIngredientForm,
    createToppingForm
} = require('../forms')

const {
    Product,
    Flavor,
    DoughType,
    Ingredient,
    Topping
} = require("../models")

//  #2 Add a new route to the Express router
router.get('/', async(req, res) => {
    let products = await Product.collection().fetch()
    let flavors = await Flavor.collection().fetch()
    let ingredients = await Ingredient.collection().fetch()
    let doughtypes = await DoughType.collection().fetch()
    let toppings = await Topping.collection().fetch()
    res.render("products/index", {
        'products': products.toJSON(),
        'flavors': flavors.toJSON(),
        'ingredients': ingredients.toJSON(),
        'doughtypes': doughtypes.toJSON(),
        'toppings': toppings.toJSON()

    })
})

// PRODUCT
// CREATE
router.get('/create', async(req, res) => {
    const productForm = createProductForm();
    res.render('products/create_product', {
        'form': productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async(req, res) => {
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async(form) => {
            const product = new Product();
            product.set('name', form.data.name);
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            product.set('stock', form.data.stock);
            product.set('image', form.data.image);
            product.set('flavor_id', form.data.flavor_id);
            product.set('dough_type_id', form.data.dough_type_id)
            await product.save();
            res.redirect('/products');

        },
        'error': async(form) => {
            res.render("products/create_product", {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// UPDATE
router.get('/:product_id/update', async(req, res) => {
    // retrieve the product
    const productId = req.params.product_id
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true
    });

    const productForm = createProductForm();

    // fill in the existing values
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');
    productForm.fields.stock.value = product.get('stock');
    productForm.fields.image.value = product.get('image');
    productForm.fields.flavor_id.value = product.get('flavor_id');
    productForm.fields.dough_type_id.value = product.get('dough_type_id');

    res.render('products/update_product', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })

})

router.post('/:product_id/update', async(req, res) => {

    // fetch the product that we want to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    });

    // process the form
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async(form) => {
            product.set(form.data);
            product.save();
            res.redirect('/products');
        },
        'error': async(form) => {
            res.render('products/update_product', {
                'form': form.toHTML(bootstrapField),
                'product': product.toJSON()
            })
        }
    })

})

// FLAVOR
router.get('/flavors/create', async(req, res) => {
    const flavorForm = createFlavorForm();
    res.render('products/create_flavor', {
        'form': flavorForm.toHTML(bootstrapField)
    })
})

router.post('/flavors/create', async(req, res) => {
    const flavorForm = createFlavorForm();
    flavorForm.handle(req, {
        'success': async(form) => {
            const flavor = new Flavor();
            flavor.set('name', form.data.name);
            await flavor.save();
            res.redirect('/products');
        },
        'error': async(form) => {
            res.render("products/create_flavor", {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// TOPPING
router.get('/toppings/create', async(req, res) => {
    const toppingForm = createToppingForm();
    res.render('products/create_topping', {
        'form': toppingForm.toHTML(bootstrapField)
    })
})

router.post('/toppings/create', async(req, res) => {
    const toppingForm = createToppingForm();
    toppingForm.handle(req, {
        'success': async(form) => {
            const topping = new Topping();
            topping.set('name', form.data.name);
            await topping.save();
            res.redirect('/products');
        },
        'error': async(form) => {
            res.render("products/create_topping", {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})


// DOUGHTYPE
//create
router.get('/doughtypes/create', async(req, res) => {
    const allIngredients = await (await Ingredient.fetchAll()).map((ingredient) => {
        return [ingredient.get('id'), ingredient.get('name')];
    })

    const doughTypeForm = createDoughTypeForm(allIngredients);
    res.render('products/create_doughtype', {
        'form': doughTypeForm.toHTML(bootstrapField)
    })
})

router.post('/doughtypes/create', async(req, res) => {
    const allIngredients = await (await Ingredient.fetchAll()).map((ingredient) => {
        return [ingredient.get('id'), ingredient.get('name')];
    })
    const doughTypeForm = createDoughTypeForm(allIngredients);
    doughTypeForm.handle(req, {
        'success': async(form) => {
            const doughtype = new DoughType();
            doughtype.set('name', form.data.name);
            await doughtype.save();
            res.redirect('/products');
        },
        'error': async(form) => {
            res.render("products/create_doughtype", {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

//update
router.get('/doughtypes/:dough_type_id/update', async(req, res) => {
    // retrieve the product
    const doughtypeId = req.params.dough_type_id
    const doughtype = await DoughType.where({
        'id': doughtypeId
    }).fetch({
        require: true
    });

    // fetch all the categories
    const allIngredients = await Ingredient.fetchAll().map((ingredient) => {
        return [ingredient.get('id'), ingredient.get('name')];
    })

    const doughtypeForm = createDoughTypeForm(allIngredients);

    // fill in the existing values
    doughtypeForm.fields.name.value = product.get('name');
    doughtypeForm.fields.ingredient_id.value = product.get('ingredient_id');

    res.render('products/update_doughtype', {
        'form': productForm.toHTML(bootstrapField),
        'doughtype': doughtype
    })

})

router.post('/doughtypes/:dough_type_id/update', async(req, res) => {
    // fetch all the ingredients
    const allIngredients = await Ingredient.fetchAll().map((ingredient) => {
        return [ingredient.get('id'), ingredient.get('name')];
    })

    // fetch the product that we want to update
    const doughtype = await DoughType.where({
        'id': req.params.dough_type_id
    }).fetch({
        required: true
    });

    // process the form
    const doughTypeForm = createDoughTypeForm(allIngredients);
    doughTypeForm.handle(req, {
        'success': async(form) => {
            doughtype.set(form.data);
            doughtype.save();
            res.redirect('/products');
        },
        'error': async(form) => {
            res.render('products/update_doughtype', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})


//INGREDIENTS
//create
router.get('/ingredients/create', async(req, res) => {
    const ingredientForm = createIngredientForm();
    res.render('products/create_ingredient', {
        'form': ingredientForm.toHTML(bootstrapField)
    })
})

router.post('/ingredients/create', async(req, res) => {
    const ingredientForm = createIngredientForm();
    ingredientForm.handle(req, {
        'success': async(form) => {
            const ingredient = new Ingredient();
            ingredient.set('name', form.data.name);
            await ingredient.save();
            res.redirect('/products');
        },
        'error': async(form) => {
            res.render("products/create_ingredient", {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

//update
router.get('/ingredients/:ingredient_id/update', async(req, res) => {
    // retrieve the product
    const ingredientId = req.params.ingredient_id
    const ingredient = await Ingredient.where({
        'id': ingredientId
    }).fetch({
        require: true
    });

    const ingredientForm = createIngredientForm();

    // fill in the existing values
    ingredientForm.fields.name.value = ingredient.get('name');

    res.render('products/update_ingredient', {
        'form': ingredientForm.toHTML(bootstrapField),
        'ingredient': ingredient.toJSON()
    })

})

router.post('/ingredients/:ingredient_id/update', async(req, res) => {
    // get the ingredient to update
    const ingredientId = req.params.ingredient_id
    const ingredient = await Ingredient.where({
        'id': ingredientId
    }).fetch({
        required: true
    });

    // process the form
    const ingredientForm = createIngredientForm();
    ingredientForm.handle(req, {
        'success': async(form) => {
            ingredient.set(form.data)
            ingredient.save();
            res.redirect('/products');
        },
        'error': async(form) => {
            res.render('products/update_ingredient', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })

})

//delete
router.get("/ingredients/:ingredient_id/delete", async(req, res) => {
    // fetch the ingredients to delete
    const ingredient = await Ingredient.where({
        'id': req.params.ingredient_id
    }).fetch({
        require: true
    });

    res.render('products/delete_ingredient', {
        'ingredient': ingredient.toJSON()
    })
})

// #3 export out the router
module.exports = router;