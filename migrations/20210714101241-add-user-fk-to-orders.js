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
  return db.addColumn('orders', 'user_id', {
    type: 'int',
    notNull: true,
    foreignKey: {
      name: 'order_user_fk',
      table: 'users',
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
    db.removeForeignKey("orders", "order_user_fk"),
    db.removeColumn("orders", "user_id")
  )
}

exports._meta = {
  "version": 1
};
