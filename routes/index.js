var express = require('express');
var cors = require('cors');

require('dotenv').config();

var router = express.Router();

var eos, pk;

var whitelist = ['http://api.clementineos.it', 'http://localhost:3001'];

var corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

router.param('key', (req, res, next, key) => {
  
  if (key == 'status') {
    eos = req.app.locals.eos;
    pk = req.app.locals.privateKey
  } else {
    eos = require('../eos')(key);
    pk = require('../privateKeys')(key);
  };

  next();
})

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 
    process.env.TITLE 
  });
});

router.get('/network/:key', cors(corsOptions), (req, res, next) => {
  res.json(eos);
});

router.get('/privateKey/:key', cors(corsOptions), (req, res, next) => {
  res.json(pk);
});

module.exports = router;
