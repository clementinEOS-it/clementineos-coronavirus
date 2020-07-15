var express = require('express');
var api = require('../controllers/api');
var geojson = require('../controllers/geojson');
const _ = require('lodash');
const { Parser } = require('json2csv');
var eos = require('eosblockchain');

require('dotenv').config();

var router = express.Router();

router.get('/', (req, res, next) => {

    var contract = req.app.locals.eos.smartContracts.coronavirus;
    var _limit = (req.query.limit || -1);

    getBlockchainTable(contract, _limit, (err, response) => {
        if (err) {
            res.status(500).send('');
        } else {
            res.status(200).json(response);
        };
    });
    
});

router.get('/latlng', (req, res, next) => {

    var contract = req.app.locals.eos.smartContracts.coronavirus;
    // console.table(contract);

    var _limit = (req.query.limit || -1);
    var _select = req.query.select;

    getBlockchainTable(contract, _limit, (err, response) => {

        if (err) {
            res.status(500).send('');
        } else {
            var r = api.byLatLng(response, _select);

            res.status(200).json(r);
        };
    });
    
});

router.get('/geojson', (req, res, next) => {

    var contract = req.app.locals.eos.smartContracts.coronavirus;
    
    var _limit = (req.query.limit || -1);

    getBlockchainTable(contract, _limit, (err, response) => {

        if (err) {
            res.status(500).send('');
        } else {
            var r = api.byLatLng(response);
            var r = geojson(r); 
            res.status(200).json(r);
        };
    });
    
});

router.get('/time', (req, res, next) => {

    var contract = req.app.locals.eos.smartContracts.coronavirus;
    
    //var _limit = getLimit(req);
    var _limit = (req.query.limit || -1);

    getBlockchainTable(contract, _limit, (err, response) => {

        if (err) {
            res.status(500).send('');
        } else {

            console.log('by time ...');
            var r = api.byTime(response);
            res.status(200).json(r);
        };

    });
    
});

// GET Data Tables from Blockchain
router.get('/diff', (req, res, next) => {

    var contract = req.app.locals.eos.smartContracts.coronavirus;
    
    var _limit = (req.query.limit || -1);
    var _select = (req.query.select || -1);

    getBlockchainTable(contract, _limit, (err, response) => {

        if (err) {
            res.status(500).send('');
        } else {
            console.log('by diff ...');
            var r = api.byTime(response);
            r = api.byDiff(r);

            var maxD = _.maxBy(r, item => {
                return item.data;
            });

            // console.log(JSON.stringify(maxD));
  
            r = _.filter(r, item => {
                return item.data == maxD.data
            });
            
            console.table(JSON.stringify(r));

            if (typeof _select != 'undefined') {
                r = _.filter(r, o => {
                    return o.item == _select
                });
            };

            res.status(200).json(r);

        };

    });
    
});

router.get('/group', (req, res, next) => {

    var contract = req.app.locals.eos.smartContracts.coronavirus;
    var _limit = (req.query.limit || -1);
    var _select = req.query.select;

    getGroupData(contract, _limit, _select, (err, response) => {
        if (err) {
            res.status(500).send(response);
        } else {
            res.status(200).send(response);
        }
    })

});

router.get('/csv/group', (req, res, next) => {

    var contract = req.app.locals.eos.smartContracts.coronavirus;
    var _limit = (req.query.limit || -1);
    var _select = req.query.select;

    getGroupData(contract, _limit, _select, (err, response) => {

        if (err) {
            res.status(500).send(response);
        } else {

            let fields;

            if (typeof _select != "undefined") {
                fields = ['date', 'value'];
            } else {
                fields = ['group', 'date', 'value'];
            };

            const opts = { 
                fields 
            };

            const parser = new Parser(opts);
            const csv = parser.parse(response);
            res.setHeader('Content-Type', 'text/csv');
            res.status(200).send(csv);

        }
    })
});

router.get('/csv/list', (req, res, next) => {

    var contract = req.app.locals.eos.smartContracts.coronavirus;
    
    var _limit = (req.query.limit || -1);

    getBlockchainTable(contract, _limit, (err, response) => {

        if (err) {
            res.status(500).send('');
        } else {

            var r = api.byTime(response);

            console.log('data by list ...');
            
            const fields = [
                'Data',
                'Ricoverati_con_sintomi', 
                'Terapia_intensiva',
                'Totale_ospedalizzati',
                'Isolamento_domiciliare', 
                'Totale_positivi',
                'Dimessi_guariti',
                'Deceduti',
                'Tamponi',
                'Nuovi_positivi',
                'Casi_testati'
            ];
            
            const opts = { 
                fields 
            };

            api.byGraphList(r, response => {
                const parser = new Parser(opts);
                const csv = parser.parse(response);
                res.setHeader('Content-Type', 'text/csv');
                res.status(200).send(csv);
            });
        }
    })
});

let getBlockchainTable = (contract, limit, cb) => {

    var options = {
        table : 'virusdata',
        limit: limit
    };

    eos.getTable(contract, options, (error, response) => {
        
        var r = _.sortBy(response, item => {
            return item.dateISO
        });

        cb(error, r);

    });

};

let getGroupData = (contract, _limit, _select, callback) => {

    getBlockchainTable(contract, _limit, (err, response) => {

        if (err) {
            callback(err, {});
        } else {

            var r = api.byTime(response);

            if (typeof _select != "undefined") {

                console.log('data by group ... select ' + _select);

                api.byGraphListOne(r, _select, _response => {
                    callback(false, _response);
                });

            } else {
                api.byGraph(r, _response => {
                    callback(false, _response);
                });
            }
        }
    });

}

module.exports = router;
