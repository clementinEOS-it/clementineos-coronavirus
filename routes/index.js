var express = require('express');
var cors = require('cors');
var _ = require('lodash');

require('dotenv').config();

var router = express.Router();

var eos, pk;

const whitelist = require('../whitelist');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { 
    title: process.env.TITLE 
  });
});

router.get('/coronavirus', function(req, res, next) {
  res.render('api', { 
    title: process.env.TITLE 
  });
});

module.exports = router;
