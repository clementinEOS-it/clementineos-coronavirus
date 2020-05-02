var express = require('express');
var cvController = require('../controllers/coronavirus');

require('dotenv').config();

var router = express.Router();

router.post('/send', function(req, res, next) {

    console.log('Sending to BLOCKCHAIN ...');
    console.table(req.body);

    var contract = req.app.locals.eos.smartContracts.coronavirus;
    
    var actions = [{
        account: contract.account,
        name: "send",
        authorization: [{
            actor: contract.account,
            permission: "active"
        }],
        data: req.body
    }];

    cvController.run(actions, (err, response) => {
        if (err) {
            res.status(500).json(response);
        } else {
            res.status(200).json(response);
        }
    });
    
});

module.exports = router;
