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
  return db.createTable("products", {
    id: {
      type: "int",
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: "string",
      length: 150
    },
    description: {
      type: "string",
      length: 500
    },
    cost: {
      type: "int",
      unsigned: true
    },
    stock: {
      type: "int",
      unsigned: true
    },
    image: {
      type: "string",
      length: 250
    }
  });
};

exports.down = function (db) {
  return db.dropTable("products");
};

exports._meta = {
  "version": 1
};