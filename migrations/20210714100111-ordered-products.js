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
    return db.createTable('orders_products', {
        id: {
            type: 'int',
            primaryKey: true,
            autoIncrement: true
        },
        order_id: {
            type: 'int',
            notNull: true,
            foreignKey: {
                name: 'ordered_products_order_fk',
                table: 'orders',
                rules: {
                    onDelete: 'CASCADE',
                    onUpdate: 'RESTRICT'
                },
                mapping: 'id'
            }
        },
        product_id: {
            type: 'int',
            notNull: true,
            foreignKey: {
                name: 'ordered_products_product_fk',
                table: 'products',
                rules: {
                    onDelete: 'CASCADE',
                    onUpdate: 'RESTRICT'
                },
                mapping: 'id'
            }
        },
        quantity: {
            "type": "int",
            "unsigned": true,
        }
    });
};

exports.down = function(db) {
    return db.dropTable("ordered_products");
};

exports._meta = {
    "version": 1
};