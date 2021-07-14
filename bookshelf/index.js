// Setting up the database connection
const knex = require('knex')({
    client: 'mysql',
    connection: {
      user: 'foo',
      password:'bar',
      database:'bakery'
    }
  })
  const bookshelf = require('bookshelf')(knex)
  
  module.exports = bookshelf;
  
  