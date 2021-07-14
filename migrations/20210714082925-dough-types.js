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
  return db.createTable("dough_types", {
    id: {
      type: "int",
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: "string",
      length: 45,
      notNull: false
    }
  });
};

exports.down = function (db) {
  return db.dropTable("dough_types");
};

exports._meta = {
  "version": 1
};