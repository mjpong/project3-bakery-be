const bookshelf = require('../bookshelf')

const Flavor = bookshelf.model('Flavor', {
    tableName:'flavors'
});



module.exports = { Flavor };