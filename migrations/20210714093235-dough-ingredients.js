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
    return db.createTable('dough_types_ingredients', {
        id: {
            type: 'int',
            primaryKey: true,
            autoIncrement: true
        },
        dough_type_id: {
            type: 'int',
            notNull: true,
            foreignKey: {
                name: 'dough_ingredients_dough_type_fk',
                table: 'dough_types',
                rules: {
                    onDelete: 'CASCADE',
                    onUpdate: 'RESTRICT'
                },
                mapping: 'id'
            }
        },
        ingredient_id: {
            type: 'int',
            notNull: true,
            foreignKey: {
                name: 'dough_ingredients_ingredient_fk',
                table: 'ingredients',
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
    return db.dropTable("dough_ingredients");
};

exports._meta = {
    "version": 1
};