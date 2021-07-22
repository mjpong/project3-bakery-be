// import in the Product model
const {
    Product,
    Flavor,
    DoughType,
    Ingredient,
    Topping
} = require("../models")

const getProductById = async (productId) => {
    return await Product.where({
        'id': parseInt(productId)
    }).fetch({
        require: true,
        withRelated: ['toppings', "dough_type", "flavor", "dough_type.ingredients"]
    });
}

const getFlavorById = async (flavorId) => {
    return await Flavor.where({
        'id': parseInt(flavorId)
    }).fetch({
        require: true
    });
}

const getToppingById = async (toppingId) => {
    return await Topping.where({
        'id': parseInt(toppingId)
    }).fetch({
        require: true
    });
}

const getDoughTypeById = async (doughtypeId) => {
    return await DoughType.where({
        'id': parseInt(doughtypeId)
    }).fetch({
        require: true,
        withRelated: ['ingredients']
    });
}

const getIngredientById = async (ingredientId) => {
    return await Ingredient.where({
        'id': parseInt(ingredientId)
    }).fetch({
        require: true
    });
}


const getAllProducts = async () => {
    return await Product.fetchAll()
}

const getAllFlavors = async () => {
    return await Flavor.fetchAll().map((flavor) => {
        return [flavor.get('id'), flavor.get('name')];
    })
}

const getAllToppings = async () => {
    return await Topping.fetchAll().map((topping) => {
        return [topping.get('id'), topping.get('name')];
    })
}

const getAllDoughTypes = async () => {
    return await DoughType.fetchAll().map((doughtype) => {
        return [doughtype.get('id'), doughtype.get('name')];
    })
}

const getAllIngredients = async () => {
    return await Ingredient.fetchAll().map(ingredient => {
        return [ingredient.get('id'), ingredient.get('name')]
    })
}

module.exports = {
    getProductById,
    getToppingById,
    getFlavorById,
    getDoughTypeById,
    getIngredientById,
    getAllProducts,
    getAllFlavors,
    getAllToppings,
    getAllDoughTypes,
    getAllIngredients
}