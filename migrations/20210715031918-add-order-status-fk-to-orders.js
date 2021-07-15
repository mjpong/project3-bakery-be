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
  return db.addColumn('orders', 'order_status_id', {
    type: 'int',
    notNull: true,
    foreignKey: {
      name: 'orders_order_status_fk',
      table: 'order_status',
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
    db.removeForeignKey("orders", "orders_order_status_fk"),
    db.removeColumn("orders", "order_status_id")
  )
}


exports._meta = {
  "version": 1
};
