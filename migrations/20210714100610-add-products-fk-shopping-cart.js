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

exports.up = function (db) {
  return db.addColumn('shopping_cart_item', 'product_id', {
    type: 'int',
    notNull: true,
    foreignKey: {
      name: 'shopping_cart_item_product_fk',
      table: 'products',
      rules: {
        onDelete: 'CASCADE',
        onUpdate: 'RESTRICT'
      },
      mapping: 'id'
    }
  })
};

exports.down = function (db) {
  return (
    db.removeForeignKey("shopping_cart_item", "shopping_cart_item_product_fk"),
    db.removeColumn("shopping_cart_item", "product_id")
  )
}

exports._meta = {
  "version": 1
};
