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
    createToppingForm,
    createSearchForm
} = require('../forms')

const {
    Product,
    Flavor,
    DoughType,
    Ingredient,
    Topping
} = require("../models")

// import in DAL
const dataLayer = require('../dal/products')

// inport middleware
const { checkIfAuth } = require('../middleware')

//  #2 Add a new route to the Express router
router.get('/', async (req, res) => {
    let allProducts = await dataLayer.getAllProducts()
    // search form
    let allIngredients = await dataLayer.getAllIngredients()
    const allFlavors = await dataLayer.getAllFlavors()
    const allDoughTypes = await dataLayer.getAllDoughTypes()
    const allToppings = await dataLayer.getAllToppings()
    // browse
    let flavors = await dataLayer.getFlavors()
    let doughtypes = await dataLayer.getDoughTypes()
    let toppings = await dataLayer.getToppings()
    let ingredients = await dataLayer.getIngredients()

    allFlavors.unshift([0, "-"])
    allDoughTypes.unshift([0, "-"])
    allToppings.unshift([0, "-"])
    const searchForm = createSearchForm(allFlavors, allToppings, allDoughTypes)

    //query connector
    let q = Product.collection()

    searchForm.handle(req, {
        'empty': async (form) => {
            let products = await q.fetch({
                withRelated: ['toppings', "dough_type", "flavor", "dough_type.ingredients"]
            })
            let productsJSON = products.toJSON()
            for (let product of productsJSON) {
                let cost = product.cost;
                product['productCost'] = (cost / 100).toFixed(2)
            }

            res.render("products/index", {
                'products': productsJSON,
                'flavors': flavors.toJSON(),
                'ingredients': ingredients.toJSON(),
                'doughtypes': doughtypes.toJSON(),
                'toppings': toppings.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        "error": async (form) => {
            let products = await q.fetch({
                withRelated: ['toppings', "dough_type", "flavor", "dough_type.ingredients"]
            })

            let productsJSON = products.toJSON()
            for (let product of productsJSON) {
                let cost = product.cost;
                product['productCost'] = (cost / 100).toFixed(2)
            }

            res.render("products/index", {
                'products': productsJSON,
                'flavors': flavors.toJSON(),
                'ingredients': ingredients.toJSON(),
                'doughtypes': doughtypes.toJSON(),
                'toppings': toppings.toJSON(),
                'form': form.toHTML(bootstrapField)
            })

        },
        'success': async (form) => {
            if (form.data.name) {
                q = q.where("name", "like", "%" + form.data.name + "%")
            }
            if (form.data.min_price) {
                q = q.where('cost', '>=', req.query.min_price)
            }
            if (form.data.max_price) {
                q = q.where('cost', '<=', req.query.max_price);
            }
            if (form.data.flavor_id !== "0") {
                q = q.where("flavor_id", "=", form.data.flavor_id)
            }
            if (form.data.dough_type_id !== "0") {
                q = q.where("dough_type_id", "=", form.data.dough_type_id)
            }
            if (form.data.toppings) {
                q = q.query("join", "products_toppings", "products.id", "product_id").where("topping_id", "in", form.data.toppings.split(","))
            }

            let products = await q.fetch({
                withRelated: ['flavor', "dough_type", "toppings"]
            })

            let productsJSON = products.toJSON()
            for (let product of productsJSON) {
                let cost = product.cost;
                product['productCost'] = (cost / 100).toFixed(2)
            }

            res.render("products/index", {
                'products': productsJSON,
                'flavors': flavors.toJSON(),
                'ingredients': ingredients.toJSON(),
                'doughtypes': doughtypes.toJSON(),
                'toppings': toppings.toJSON(),
                'form': form.toHTML(bootstrapField)
            })

        }
    })

})

// PRODUCT CREATE
router.get('/create', async (req, res) => {
    const allFlavors = await dataLayer.getAllFlavors()
    const allDoughTypes = await dataLayer.getAllDoughTypes()
    const allToppings = await dataLayer.getAllToppings()

    const productForm = createProductForm(allFlavors, allDoughTypes, allToppings);
    res.render('products/create_product', {
        'form': productForm.toHTML(bootstrapField),

    })
})

router.post('/create', async (req, res) => {

    const allFlavors = await dataLayer.getAllFlavors()
    const allDoughTypes = await dataLayer.getAllDoughTypes()
    const allToppings = await dataLayer.getAllToppings()

    const productForm = createProductForm(allFlavors, allDoughTypes, allToppings);
    productForm.handle(req, {
        'success': async (form) => {
            let { toppings, ...productData } = form.data;
            productData.image = req.body.image;
            const product = new Product(productData);
            await product.save();
            if (toppings) {
                await product.toppings().attach(toppings.split(","))
            }
            req.flash("success_message", `${product.get('name')} has been created`)
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render("products/create_product", {
                'form': form.toHTML(bootstrapField)
            })
            req.flash("error_message", 'Error, Cinnamon Roll cannot be created')
        }
    })
})

// PRODUCT UPDATE
router.get('/:product_id/update', async (req, res) => {
    // retrieve the product
    const productId = req.params.product_id
    const product = await dataLayer.getProductById(productId)
    const allFlavors = await dataLayer.getAllFlavors()
    const allDoughTypes = await dataLayer.getAllDoughTypes()
    const allToppings = await dataLayer.getAllToppings()
    const productForm = createProductForm(allFlavors, allDoughTypes, allToppings);

    // fill in the existing values
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');
    productForm.fields.stock.value = product.get('stock');
    // productForm.fields.image.value = product.get('image');
    productForm.fields.flavor_id.value = product.get('flavor_id');
    productForm.fields.dough_type_id.value = product.get('dough_type_id');

    let selectedToppings = await product.related('toppings').pluck('id');
    productForm.fields.toppings.value = selectedToppings
    res.render('products/update_product', {
        'form': productForm.toHTML(bootstrapField),
        'image': product.get('image'),
        'product': product.toJSON()
    })

})

router.post('/:product_id/update', async (req, res) => {

    // fetch the product that we want to update
    const productId = req.params.product_id
    const product = await dataLayer.getProductById(productId)

    // process the form
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async (form) => {
            let { toppings, ...productData } = form.data;
            productData.image = req.body.image;
            product.set(productData)
            await product.save();

            let toppingIds = toppings.split(',');
            let existingToppingIds = await product.related('toppings').pluck('id');
            let remove = existingToppingIds.filter(id => toppingIds.includes(id) === false);
            await product.toppings().detach(remove);
            await product.toppings().attach(toppingIds);
            req.flash("success_message", `${product.get('name')} has been updated`)

            res.redirect('/products');
        },
        'error': async (form) => {
            res.render('products/update_product', {
                'form': form.toHTML(bootstrapField),
                'product': product.toJSON()
            })
            res.flash("error_message", 'Error, Cinnamon Roll cannot be updated')
        }
    })

})

// PRODUCT DELETE
router.get('/:product_id/delete', async (req, res) => {
    // fetch the product that we want to delete
    const productId = req.params.product_id
    const product = await dataLayer.getProductById(productId)
    res.render('products/delete', {
        'product': product,
        'name': product.get("name")
    })
});

router.post('/:product_id/delete', async (req, res) => {
    // fetch the product that we want to delete
    const productId = req.params.product_id
    const product = await dataLayer.getProductById(productId)
    await product.destroy();
    req.flash("success_message", `Cinnamon Roll deleted`)
    res.redirect('/products')
})

// FLAVOR CREATE
router.get('/flavors/create', async (req, res) => {
    const flavorForm = createFlavorForm();
    res.render('products/create_flavor', {
        'form': flavorForm.toHTML(bootstrapField)
    })
})

router.post('/flavors/create', async (req, res) => {

    const flavorForm = createFlavorForm();
    flavorForm.handle(req, {
        'success': async (form) => {
            const flavor = new Flavor();
            flavor.set('name', form.data.name);
            await flavor.save();
            req.flash("success_message", `${flavor.get('name')} has been created`)
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render("products/create_flavor", {
                'form': form.toHTML(bootstrapField)
            })
            res.flash("error_message", 'Error, flavor cannot be created')
        }
    })
})

// FLAVOR UPDATE
router.get('/flavors/:flavor_id/update', async (req, res) => {
    // retrieve the flavor
    const flavorId = req.params.flavor_id
    const flavor = await dataLayer.getFlavorById(flavorId)

    const flavorForm = createFlavorForm();
    flavorForm.fields.name.value = flavor.get('name');

    res.render('products/update_item', {
        'form': flavorForm.toHTML(bootstrapField),
        'flavor': flavor.toJSON(),
        'name': flavor.get("name")
    })

})

router.post('/flavors/:flavor_id/update', async (req, res) => {
    // fetch all the flavors
    const allFlavors = await dataLayer.getAllFlavors()

    // fetch the product that we want to update
    const flavorId = req.params.flavor_id
    const flavor = await dataLayer.getFlavorById(flavorId)

    // process the form
    const flavorForm = createFlavorForm(allFlavors);
    flavorForm.handle(req, {
        'success': async (form) => {
            flavor.set(form.data);
            flavor.save();
            req.flash("success_message", `${flavor.get('name')} has been created`)
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render('products/update_item', {
                'form': form.toHTML(bootstrapField)
            })
            res.flash("error_message", 'Error, flavor cannot be updated')
        }
    })
})

// FLAVOR DELETE
router.get('/flavors/:flavor_id/delete', async (req, res) => {
    // fetch the flavors to delete
    const flavorId = req.params.flavor_id
    const flavor = await dataLayer.getFlavorById(flavorId)

    res.render('products/delete', {
        'flavor': flavor.toJSON(),
        'name': flavor.get("name")
    })
})

router.post('/flavors/:flavor_id/delete', async (req, res) => {
    const flavorId = req.params.flavor_id
    const flavor = await dataLayer.getFlavorById(flavorId)
    await flavor.destroy();
    req.flash("success_message", `Flavor has been deleted`)
    res.redirect('/products')
})

// TOPPING CREATE
router.get('/toppings/create', async (req, res) => {
    const toppingForm = createToppingForm();
    res.render('products/create_topping', {
        'form': toppingForm.toHTML(bootstrapField)
    })
})

router.post('/toppings/create', async (req, res) => {
    const toppingForm = createToppingForm();
    toppingForm.handle(req, {
        'success': async (form) => {
            const topping = new Topping();
            topping.set('name', form.data.name);
            await topping.save();
            req.flash("success_message", `${topping.get('name')} has been created`)
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render("products/create_topping", {
                'form': form.toHTML(bootstrapField)
            })
            res.flash("error_message", 'Error, topping cannot be created')
        }
    })
})

// TOPPING UPDATE
router.get('/toppings/:topping_id/update', async (req, res) => {
    // retrieve the toppings
    const toppingId = req.params.topping_id
    const topping = await dataLayer.getToppingById(toppingId)

    const toppingForm = createToppingForm();

    // fill in the existing values
    toppingForm.fields.name.value = topping.get('name');

    res.render('products/update_item', {
        'form': toppingForm.toHTML(bootstrapField),
        'topping': topping.toJSON(),
        'name': topping.get("name")
    })

})

router.post('/toppings/:topping_id/update', async (req, res) => {
    // get the topping to update
    const toppingId = req.params.topping_id
    const topping = await dataLayer.getToppingById(toppingId)

    // process the form
    const toppingForm = createToppingForm();
    toppingForm.handle(req, {
        'success': async (form) => {
            topping.set(form.data)
            topping.save();
            req.flash("success_message", `${topping.get('name')} has been updated`)
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render('products/update_item', {
                'form': form.toHTML(bootstrapField)
            })
            res.flash("error_message", 'Error, topping cannot be updated')
        }
    })

})


// TOPPING DELETE
router.get('/toppings/:topping_id/delete', async (req, res) => {
    // fetch the toppings to delete
    const toppingId = req.params.topping_id
    const topping = await dataLayer.getToppingById(toppingId)

    res.render('products/delete', {
        'topping': topping.toJSON(),
        'name': topping.get("name")
    })
})

router.post('/toppings/:topping_id/delete', async (req, res) => {
    const toppingId = req.params.topping_id
    const topping = await dataLayer.getToppingById(toppingId)
    await topping.destroy();
    req.flash("success_message", `Topping has been deleted`)
    res.redirect('/products')
})

// DOUGHTYPE CREATE 
router.get('/doughtypes/create', async (req, res) => {

    const allIngredients = await dataLayer.getAllIngredients()
    const doughTypeForm = createDoughTypeForm(allIngredients);

    res.render('products/create_doughtype', {
        'form': doughTypeForm.toHTML(bootstrapField)
    })
})

router.post('/doughtypes/create', async (req, res) => {
    const allIngredients = await dataLayer.getAllIngredients()
    const doughTypeForm = createDoughTypeForm(allIngredients);
    doughTypeForm.handle(req, {
        'success': async (form) => {
            let { ingredients, ...doughTypeData } = form.data;
            const doughtype = new DoughType(doughTypeData);
            await doughtype.save();
            if (ingredients) {
                await doughtype.ingredients().attach(ingredients.split(','))
            }
            req.flash("success_message", `${doughtype.get('name')} has been created`)
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render("products/create_doughtype", {
                'form': form.toHTML(bootstrapField)
            })
            res.flash("error_message", 'Error, dough type cannot be created')
        }
    })
})

// DOUGHTYPE UPDATE 
router.get('/doughtypes/:dough_type_id/update', async (req, res) => {
    // retrieve the product
    const doughtypeId = req.params.dough_type_id
    const doughtype = await dataLayer.getDoughTypeById(doughtypeId)

    // fetch all the ingredients
    const allIngredients = await dataLayer.getAllIngredients();
    const doughTypeForm = createDoughTypeForm(allIngredients);

    // fill in the existing values
    doughTypeForm.fields.name.value = doughtype.get('name');
    let selectIngredients = await doughtype.related('ingredients').pluck('id');
    doughTypeForm.fields.ingredients.value = selectIngredients


    res.render('products/update_item', {
        'form': doughTypeForm.toHTML(bootstrapField),
        'doughtype': doughtype,
        'name': doughtype.get("name")
    })

})

router.post('/doughtypes/:dough_type_id/update', async (req, res) => {
    // fetch the doughtype that we want to update
    const doughtypeId = req.params.dough_type_id
    const doughtype = await dataLayer.getDoughTypeById(doughtypeId)

    // process the form
    const doughTypeForm = createDoughTypeForm();
    doughTypeForm.handle(req, {
        'success': async (form) => {
            let { ingredients, ...doughTypeData } = form.data;
            doughtype.set(doughTypeData);
            doughtype.save();
            let ingredientIds = ingredients.split(',');
            let existingIngredients = await doughtype.related('ingredients').pluck('id');
            let toRemove = existingIngredients.filter(id => ingredientIds.includes(id) === false);
            await doughtype.ingredients().detach(toRemove);
            await doughtype.ingredients().attach(ingredientIds)
            req.flash("success_message", `${doughtype.get('name')} has been updated`)
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render('products/update_doughtype', {
                'form': form.toHTML(bootstrapField)
            })
            res.flash("error_message", 'Error, dough type cannot be updated')
        }
    })
})

// DOUGHTYPE DELETE
router.get("/doughtypes/:dough_type_id/delete", async (req, res) => {
    // fetch the ingredients to delete
    const doughtypeId = req.params.dough_type_id
    const doughtype = await dataLayer.getDoughTypeById(doughtypeId)

    res.render('products/delete', {
        'doughtype': doughtype.toJSON(),
        'name': doughtype.get("name")
    })
})

router.post("/doughtypes/:dough_type_id/delete", async (req, res) => {
    const doughtypeId = req.params.dough_type_id
    const doughtype = await dataLayer.getDoughTypeById(doughtypeId)
    await doughtype.destroy();
    req.flash("success_message", `Dough Type has been deleted`)
    res.redirect('/products')
})

//INGREDIENTS CREATE 
router.get('/ingredients/create', async (req, res) => {
    const ingredientForm = createIngredientForm();
    res.render('products/create_ingredient', {
        'form': ingredientForm.toHTML(bootstrapField)
    })
})

router.post('/ingredients/create', async (req, res) => {
    const ingredientForm = createIngredientForm();
    ingredientForm.handle(req, {
        'success': async (form) => {
            const ingredient = new Ingredient();
            ingredient.set('name', form.data.name);
            await ingredient.save();
            req.flash("success_message", `${ingredient.get('name')} has been created`)
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render("products/create_ingredient", {
                'form': form.toHTML(bootstrapField)
            })
            res.flash("error_message", 'Error, ingredient cannot be created')
        }
    })
})

// INGREDIENTS UPDATE 
router.get('/ingredients/:ingredient_id/update', async (req, res) => {
    // retrieve the ingredients
    const ingredientId = req.params.ingredient_id
    const ingredient = await dataLayer.getIngredientById(ingredientId)

    const ingredientForm = createIngredientForm();

    // fill in the existing values
    ingredientForm.fields.name.value = ingredient.get('name');

    res.render('products/update_item', {
        'form': ingredientForm.toHTML(bootstrapField),
        'ingredient': ingredient.toJSON(),
        'name': ingredient.get("name")
    })

})

router.post('/ingredients/:ingredient_id/update', async (req, res) => {
    // get the ingredient to update
    const ingredientId = req.params.ingredient_id
    const ingredient = await dataLayer.getIngredientById(ingredientId)

    // process the form
    const ingredientForm = createIngredientForm();
    ingredientForm.handle(req, {
        'success': async (form) => {
            ingredient.set(form.data)
            ingredient.save();
            req.flash("success_message", `${ingredient.get('name')} has been updated`)
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render('products/update_item', {
                'form': form.toHTML(bootstrapField)
            })
            res.flash("error_message", 'Error, ingredient cannot be updated')
        }
    })

})

// INGREDIENTS DELETE 
router.get("/ingredients/:ingredient_id/delete", async (req, res) => {
    // fetch the ingredients to delete
    const ingredientId = req.params.ingredient_id
    const ingredient = await dataLayer.getIngredientById(ingredientId)

    res.render('products/delete', {
        'ingredient': ingredient.toJSON(),
        'name': ingredient.get("name")
    })
})

router.post('/ingredients/:ingredient_id/delete', async (req, res) => {
    const ingredientId = req.params.ingredient_id
    const ingredient = await dataLayer.getIngredientById(ingredientId)
    await ingredient.destroy();
    req.flash("success_message", `Ingredient has been deleted`)
    res.redirect('/products')
})

// #3 export out the router
module.exports = router;