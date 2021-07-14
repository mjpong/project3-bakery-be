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
  return db.addColumn('order_status', 'order_id', {
    type: 'int',
    notNull: true,
    foreignKey: {
      name: 'order_status_order_fk',
      table: 'orders',
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
    db.removeForeignKey("order_status", "order_status_order_fk"),
    db.removeColumn("order_status", "order_id")
  )
}

exports._meta = {
  "version": 1
};
