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
  return db.createTable("users", {
    id: {
      type: "int",
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: "string",
      length: 45,
      notNull: false
    },
    email: {
      type: "string",
      length: 100
    },
    password: {
      type: "string",
      length: 100
    },
    phone: {
      type: "string",
      length: 100
    },
    address: {
      type: "string",
      length: 255
    },
    dob: "date"
  });
};

exports.down = function (db) {
  return db.dropTable("users");
};


exports._meta = {
  "version": 1
};