const bookshelf = require('../bookshelf')

const DoughType = bookshelf.model('DoughType', {
    tableName: 'dough_types',
    products() {
        return this.hasMany('Product');
    },
    ingredients() {
        return this.belongsToMany("Ingredient")
    }
});

const Flavor = bookshelf.model('Flavor', {
    tableName: 'flavors',
    products() {
        return this.hasMany('Product');
    }
});

const Ingredient = bookshelf.model('Ingredient', {
    tableName: 'ingredients',
    dough_types() {
        return this.belongsToMany("DoughType")
    }
});

const OrderStatus = bookshelf.model('OrderStatus', {
    tableName: 'order_status',
    orders() {
        return this.hasMany("Order")
    }
});

const Order = bookshelf.model('Order', {
    tableName: 'orders',
    user() {
        return this.belongsTo("User")
    },
    order_status() {
        return this.belongsTo("OrderStatus")
    },
    products() {
        return this.belongsToMany("Product")
    }
});

const Product = bookshelf.model('Product', {
    tableName: 'products',
    dough_type() {
        return this.belongsTo('DoughType')
    },
    flavor() {
        return this.belongsTo('Flavor')
    },
    shopping_cart_items() {
        return this.hasMany("ShoppingCartItem")
    },
    toppings() {
        return this.belongsToMany("Topping")
    },
    orders() {
        return this.belongsToMany("Order")
    }
});

const ShoppingCartItem = bookshelf.model('ShoppingCartItem', {
    tableName: 'shopping_cart_item',
    product() {
        return this.belongsTo('Product');
    },
    user() {
        return this.belongsTo('User');
    }
});

const Topping = bookshelf.model('Topping', {
    tableName: 'toppings',
    products() {
        return this.belongsToMany("Product")
    }
});

const User = bookshelf.model('User', {
    tableName: 'users',
    shopping_cart_items() {
        return this.hasMany("ShoppingCartItem")
    },
    orders() {
        return this.hasMany("Order")
    }
});



module.exports = {
    DoughType,
    Flavor,
    Ingredient,
    OrderStatus,
    Order,
    Product,
    ShoppingCartItem,
    Topping,
    User
};