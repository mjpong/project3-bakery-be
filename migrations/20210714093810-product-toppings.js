'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
};

exports.up = function(db) {
    return db.createTable('products_toppings', {
        id: {
            type: 'int',
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: 'int',
            notNull: true,
            foreignKey: {
                name: 'product_toppings_product_fk',
                table: 'products',
                rules: {
                    onDelete: 'CASCADE',
                    onUpdate: 'RESTRICT'
                },
                mapping: 'id'
            }
        },
        topping_id: {
            type: 'int',
            notNull: true,
            foreignKey: {
                name: 'product_toppings_topping_fk',
                table: 'toppings',
                rules: {
                    onDelete: 'CASCADE',
                    onUpdate: 'RESTRICT'
                },
                mapping: 'id'
            }
        }
    });
};

exports.down = function(db) {
    return db.dropTable("product_toppings");
};

exports._meta = {
    "version": 1
};