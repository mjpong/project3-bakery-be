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
  return db.createTable("types", {
      id: {type:"smallint", primaryKey: true, autoIncrement: true},
      name: {type: "string", length: 45, notNull:false},
      ingredients:{type: "string", length: 500, notNull: false }
  });
};

exports.down = function(db) {
  return db.dropTable("types");
};


exports._meta = {
  "version": 1
};
