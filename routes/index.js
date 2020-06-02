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

router.param('key', (req, res, next, key) => {
  
  console.log('Param: ' + key);

  pk = process.env.PRIVATEKEY
  
  if (key == 'status') {
    eos = req.app.locals.eos;
    // pk = process.env.PRIVATEKEY
  } else {
    eos = require('../eos')(key);
    // pk = require('../privateKeys')(key);
  };

  next();
});

router.get('/blockchain/:key', cors(whitelist.cors), (req, res, next) => {

  var r = {
    eos: eos,
    privateKey: pk
  };

  console.table(JSON.stringify(r));

  res.setHeader('Content-Type', 'application/json');
  res.jsonp(r);

});

module.exports = router;
