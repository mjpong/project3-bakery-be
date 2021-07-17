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
    let products = await Product.collection().fetch({ withRelated: ['flavor', "dough_type", "toppings"] })
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

// PRODUCT CREATE
router.get('/create', async(req, res) => {
    const allFlavors = await Flavor.fetchAll().map((flavor) => {
        return [flavor.get('id'), flavor.get('name')];
    })
    const allDoughTypes = await DoughType.fetchAll().map((doughtype) => {
        return [doughtype.get('id'), doughtype.get('name')];
    })

    const allToppings = await Topping.fetchAll().map((topping) => {
        return [topping.get('id'), topping.get('name')];
    })
    const productForm = createProductForm(allFlavors, allDoughTypes, allToppings);
    res.render('products/create_product', {
        'form': productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async(req, res) => {

    const allFlavors = await Flavor.fetchAll().map((flavor) => {
        return [flavor.get('id'), flavor.get('name')];
    })
    const allDoughTypes = await DoughType.fetchAll().map((doughtype) => {
        return [doughtype.get('id'), doughtype.get('name')];
    })
    const allToppings = await Topping.fetchAll().map((topping) => {
        return [topping.get('id'), topping.get('name')];
    })

    const productForm = createProductForm(allFlavors, allDoughTypes, allToppings);
    productForm.handle(req, {
        'success': async(form) => {
            let { toppings, ...productData } = form.data;
            const product = new Product(productData);
            await product.save();
            if (toppings) {
                await product.toppings().attach(toppings.split(","))
            }

            res.redirect('/products?tab=cinnamonrolls');

        },
        'error': async(form) => {
            res.render("products/create_product", {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// PRODUCT UPDATE
router.get('/:product_id/update', async(req, res) => {
    // retrieve the product
    const productId = req.params.product_id
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true,
        withRelated: ['toppings']
    });
    const allFlavors = await Flavor.fetchAll().map((flavor) => {
        return [flavor.get('id'), flavor.get('name')];
    })
    const allDoughTypes = await DoughType.fetchAll().map((doughtype) => {
        return [doughtype.get('id'), doughtype.get('name')];
    })
    const allToppings = await Topping.fetchAll().map((topping) => {
        return [topping.get('id'), topping.get('name')];
    })

    const productForm = createProductForm(allToppings, allDoughTypes, allFlavors);

    // fill in the existing values
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');
    productForm.fields.stock.value = product.get('stock');
    productForm.fields.image.value = product.get('image');
    productForm.fields.flavor_id.value = product.get('flavor_id');
    productForm.fields.dough_type_id.value = product.get('dough_type_id');

    let selectedToppings = await product.related('toppings').pluck('id');
    productForm.fields.toppings.value = selectedToppings

    res.render('products/update_product', {
        'form': productForm.toHTML(bootstrapField),
        'product': product
    })

})

router.post('/:product_id/update', async(req, res) => {

    // fetch the product that we want to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true,
        withRelated: ['toppings']
    });

    // process the form
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async(form) => {
            let { toppings, ...productData } = form.data;
            product.set(productData);
            product.save();

            let toppingIds = toppings.split(',');
            let existingToppingIds = await product.related('toppings').pluck('id');
            let remove = existingToppingIds.filter(id => toppingIds.includes(id) === false);
            await product.toppings().detach(remove);
            await product.toppings().attach(toppingIds);

            res.redirect('/products?tab=cinnamonrolls');
        },
        'error': async(form) => {
            res.render('products/update_product', {
                'form': form.toHTML(bootstrapField),
                'product': product.toJSON()
            })
        }
    })

})

// PRODUCT DELETE
router.get('/:product_id/delete', async(req, res) => {
    // fetch the product that we want to delete
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    });
    res.render('products/delete', {
        'product': product,
        'name': product.get("name")
    })
});

router.post('/:product_id/delete', async(req, res) => {
    // fetch the product that we want to delete
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    });
    await product.destroy();
    res.redirect('/products')
})

// FLAVOR CREATE
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
            res.redirect('/products?tab=flavors');
        },
        'error': async(form) => {
            res.render("products/create_flavor", {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// FLAVOR UPDATE
router.get('/flavors/:flavor_id/update', async(req, res) => {
    // retrieve the flavor
    const flavorId = req.params.flavor_id
    const flavor = await Flavor.where({
        'id': flavorId
    }).fetch({
        require: true
    });

    const flavorForm = createFlavorForm();
    flavorForm.fields.name.value = flavor.get('name');

    res.render('products/update_item', {
        'form': flavorForm.toHTML(bootstrapField),
        'flavor': flavor.toJSON(),
        'name': flavor.get("name")
    })

})

router.post('/flavors/:flavor_id/update', async(req, res) => {
    // fetch all the flavors
    const allFlavors = await Flavor.fetchAll().map((flavor) => {
        return [flavor.get('id'), flavor.get('name')];
    })

    // fetch the product that we want to update
    const flavor = await Flavor.where({
        'id': req.params.flavor_id
    }).fetch({
        required: true
    });

    // process the form
    const flavorForm = createFlavorForm(allFlavors);
    flavorForm.handle(req, {
        'success': async(form) => {
            flavor.set(form.data);
            flavor.save();
            res.redirect('/products?tab=flavors');
        },
        'error': async(form) => {
            res.render('products/update_item', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// FLAVOR DELETE
router.get('/flavors/:flavor_id/delete', async(req, res) => {
    // fetch the flavors to delete
    const flavor = await Flavor.where({
        'id': req.params.flavor_id
    }).fetch({
        require: true
    });

    res.render('products/delete', {
        'flavor': flavor.toJSON(),
        'name': flavor.get("name")
    })
})

router.post('/flavors/:flavor_id/delete', async(req, res) => {
    const flavor = await Flavor.where({
        'id': req.params.flavor_id
    }).fetch({
        require: true
    })
    await flavor.destroy();
    res.redirect('/products?tab=flavors')
})

// TOPPING CREATE
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
            res.redirect('/products?tab=toppings');
        },
        'error': async(form) => {
            res.render("products/create_topping", {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// TOPPING UPDATE
router.get('/toppings/:topping_id/update', async(req, res) => {
    // retrieve the toppings
    const toppingId = req.params.topping_id
    const topping = await Topping.where({
        'id': toppingId
    }).fetch({
        require: true
    });

    const toppingForm = createToppingForm();

    // fill in the existing values
    toppingForm.fields.name.value = topping.get('name');

    res.render('products/update_item', {
        'form': toppingForm.toHTML(bootstrapField),
        'topping': topping.toJSON(),
        'name': topping.get("name")
    })

})

router.post('/toppings/:topping_id/update', async(req, res) => {
    // get the topping to update
    const toppingId = req.params.topping_id
    const topping = await Topping.where({
        'id': toppingId
    }).fetch({
        required: true
    });

    // process the form
    const toppingForm = createToppingForm();
    toppingForm.handle(req, {
        'success': async(form) => {
            topping.set(form.data)
            topping.save();
            res.redirect('/products?tab=toppings');
        },
        'error': async(form) => {
            res.render('products/update_item', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })

})


// TOPPING DELETE
router.get('/toppings/:topping_id/delete', async(req, res) => {
    // fetch the toppings to delete
    const topping = await Topping.where({
        'id': req.params.topping_id
    }).fetch({
        require: true
    });

    res.render('products/delete', {
        'topping': topping.toJSON(),
        'name': topping.get("name")
    })
})

router.post('/toppings/:topping_id/delete', async(req, res) => {
    const topping = await Topping.where({
        'id': req.params.topping_id
    }).fetch({
        require: true
    })
    await topping.destroy();
    res.redirect('/products?tab=toppings')
})

// DOUGHTYPE CREATE 
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
            res.redirect('/products?tab=doughtypes');
        },
        'error': async(form) => {
            res.render("products/create_doughtype", {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// DOUGHTYPE UPDATE 
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
    doughtypeForm.fields.name.value = doughtype.get('name');
    doughtypeForm.fields.ingredient_id.value = doughtype.get('ingredient_id');

    res.render('products/update_item', {
        'form': doughtypeForm.toHTML(bootstrapField),
        'doughtype': doughtype,
        'name': doughtype.get("name")

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
            res.redirect('/products?tab=doughtypes');
        },
        'error': async(form) => {
            res.render('products/update_doughtype', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// DOUGHTYPE DELETE
router.get("/doughtypes/:dough_type_id/delete", async(req, res) => {
    // fetch the ingredients to delete
    const doughtype = await DoughType.where({
        'id': req.params.dough_type_id
    }).fetch({
        require: true
    });

    res.render('products/delete', {
        'doughtype': doughtype.toJSON(),
        'name': doughtype.get("name")
    })
})

router.post("/doughtypes/:dough_type_id/delete", async(req, res) => {
    const doughtype = await DoughType.where({
        'id': req.params.dough_type_id
    }).fetch({
        require: true
    })
    await doughtype.destroy();
    res.redirect('/products?tab=doughtypes')
})

//INGREDIENTS CREATE 
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

// INGREDIENTS UPDATE 
router.get('/ingredients/:ingredient_id/update', async(req, res) => {
    // retrieve the ingredients
    const ingredientId = req.params.ingredient_id
    const ingredient = await Ingredient.where({
        'id': ingredientId
    }).fetch({
        require: true
    });

    const ingredientForm = createIngredientForm();

    // fill in the existing values
    ingredientForm.fields.name.value = ingredient.get('name');

    res.render('products/update_item', {
        'form': ingredientForm.toHTML(bootstrapField),
        'ingredient': ingredient.toJSON(),
        'name': ingredient.get("name")
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
            res.redirect('/products?tab=ingredients');
        },
        'error': async(form) => {
            res.render('products/update_item', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })

})

// INGREDIENTS DELETE 
router.get("/ingredients/:ingredient_id/delete", async(req, res) => {
    // fetch the ingredients to delete
    const ingredient = await Ingredient.where({
        'id': req.params.ingredient_id
    }).fetch({
        require: true
    });

    res.render('products/delete', {
        'ingredient': ingredient.toJSON(),
        'name': ingredient.get("name")
    })
})

router.post('/ingredients/:ingredient_id/delete', async(req, res) => {
    const ingredient = await Ingredient.where({
        'id': req.params.ingredient_id
    }).fetch({
        require: true
    })
    await ingredient.destroy();
    res.redirect('/products?tab=ingredients')
})

// #3 export out the router
module.exports = router;