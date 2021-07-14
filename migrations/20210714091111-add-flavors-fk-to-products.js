'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.addColumn('products', 'flavor_id', {
    type: 'int',
    notNull: true,
    foreignKey: {
      name: 'product_flavor_fk',
      table: 'flavors',
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
    db.removeForeignKey("products", "product_flavor_fk"),
    db.removeColumn("products", "flavor_id")
  )
}

exports._meta = {
  "version": 1
};