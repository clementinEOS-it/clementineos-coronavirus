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
    // console.table(contract);

    // var _limit = getLimit(req);
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

    getBlockchainTable(contract, _limit, (err, response) => {

        if (err) {
            res.status(500).send('');
        } else {
            var r = api.byLatLng(response);
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
    
    //var _limit = getLimit(req);
    var _limit = (req.query.limit || -1);

    getBlockchainTable(contract, _limit, (err, response) => {

        if (err) {
            res.status(500).send('');
        } else {
            console.log('by diff ...');
            var r = api.byTime(response);
            var r = api.byDiff(r);
            res.status(200).json(r);
        };

    });
    
});

router.get('/csv/group', (req, res, next) => {

    var contract = req.app.locals.eos.smartContracts.coronavirus;
    
    var _limit = (req.query.limit || -1);

    getBlockchainTable(contract, _limit, (err, response) => {

        if (err) {
            res.status(500).send('');
        } else {

            var r = api.byTime(response);

            console.log('data by group ... select ' + req.query.select);

            if (typeof req.query.select != "undefined") {

                const fields = ['date', 'value'];
            
                const opts = { 
                    fields 
                };

                api.yGraphListOne(r, req.query.select, _response => {
                    const parser = new Parser(opts);
                    const csv = parser.parse(_response);
                    res.setHeader('Content-Type', 'text/csv');
                    res.status(200).send(csv);
                });

            } else {

                const fields = ['group', 'date', 'value'];
            
                const opts = { 
                    fields 
                };

                api.byGraph(r, _response => {
                    const parser = new Parser(opts);
                    const csv = parser.parse(_response);
                    res.setHeader('Content-Type', 'text/csv');
                    res.status(200).send(csv);
                });

            }
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

        cb(err, r);

    });

};

module.exports = router;
