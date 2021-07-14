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
  return db.addColumn('products', 'dough_type_id', {
    type: 'int',
    notNull: true,
    foreignKey: {
      name: 'product_dough_type_fk',
      table: 'dough_types',
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
    db.removeForeignKey("products", "product_dough_type_fk"),
    db.removeColumn("products", "dough_type_id")
  )
}

exports._meta = {
  "version": 1
};
