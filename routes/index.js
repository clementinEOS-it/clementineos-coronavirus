var express = require('express');
var cors = require('cors');

require('dotenv').config();

var router = express.Router();

var corsOptions = {
  origin: 'http://api.clementineos.it',
  optionsSuccessStatus: 200 
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: process.env.TITLE });
});

router.get('/network', cors(corsOptions), function(req, res, next) {
  res.json(req.app.locals.eos);
});

module.exports = router;
