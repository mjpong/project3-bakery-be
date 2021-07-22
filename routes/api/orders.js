const express = require('express')
const router = express.Router();
const productDataLayer = require('../../dal/products')
const { Order, Product} = require('../../models');

module.exports = router;