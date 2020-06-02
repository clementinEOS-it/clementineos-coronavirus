var express = require('express');
var block = require('../controllers/block');
var cors = require('cors');

require('dotenv').config();

var router = express.Router();

const whitelist = require('../whitelist');

router.post('/', cors(whitelist.cors), function(req, res, next) {

    console.log('Sending to BLOCKCHAIN ...');

    var contract = req.app.locals.eos.smartContracts.coronavirus;
    
    block.run(contract, 'send', req.body, (err, response) => {
        if (err) {
            console.error(response);
            res.status(500).json(response);
        } else {
            console.table(response);
            res.status(200).json(response);
        }
    });
    
});

router.param('key', (req, res, next, key) => {
  
    console.log('Param: ' + key);
  
    pk = process.env.PRIVATEKEY
    
    if (key == 'status') {
      eos = req.app.locals.eos;
    } else {
      eos = require('../eos')(key);
    };
  
    next();
});
  
router.get('/info/:key', cors(whitelist.cors), (req, res, next) => {

    var r = {
        eos: eos,
        privateKey: pk
    };

    console.table(JSON.stringify(r));

    res.setHeader('Content-Type', 'application/json');
    res.jsonp(r);

});

module.exports = router;
