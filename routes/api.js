var express = require('express');
var coronavirusController = require('../controllers/coronavirus');
var geoJSONController = require('../controllers/geojson');
const _ = require('lodash');
const { Parser } = require('json2csv');

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

    //var _limit = getLimit(req);
    var _limit = (req.query.limit || -1);

    getBlockchainTable(contract, _limit, (err, response) => {

        if (err) {
            res.status(500).send('');
        } else {
            var r = coronavirusController.data_byLatLng(response);
            res.status(200).json(r);
        };
    });
    
});

router.get('/geojson', (req, res, next) => {

    var contract = req.app.locals.eos.smartContracts.coronavirus;
    
    //var _limit = getLimit(req);
    var _limit = (req.query.limit || -1);

    getBlockchainTable(contract, _limit, (err, response) => {

        if (err) {
            res.status(500).send('');
        } else {
            var r = coronavirusController.data_byLatLng(response);
            var r = geoJSONController.get_geoJSON(r); 
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
            var r = coronavirusController.data_byTime(response);
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
            var r = coronavirusController.data_byTime(response);
            var r = coronavirusController.data_byDiff(r);
            res.status(200).json(r);
        };

    });
    
});

router.get('/csv/group', (req, res, next) => {

    var contract = req.app.locals.eos.smartContracts.coronavirus;
    
    //var _limit = getLimit(req);
    var _limit = (req.query.limit || -1);

    getBlockchainTable(contract, _limit, (err, response) => {

        if (err) {
            res.status(500).send('');
        } else {

            var r = coronavirusController.data_byTime(response);

            console.log('data by group ... select ' + req.query.select);

            if (typeof req.query.select != "undefined") {

                const fields = ['date', 'value'];
            
                const opts = { 
                    fields 
                };

                coronavirusController.data_byGraphList_select(r, req.query.select, _response => {
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

                coronavirusController.data_byGraph(r, _response => {
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
    
    //var _limit = getLimit(req);
    var _limit = (req.query.limit || -1);

    getBlockchainTable(contract, _limit, (err, response) => {

        if (err) {
            res.status(500).send('');
        } else {

            var r = coronavirusController.data_byTime(response);

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

            coronavirusController.data_byGraphList(r, response => {
                const parser = new Parser(opts);
                const csv = parser.parse(response);
                res.setHeader('Content-Type', 'text/csv');
                res.status(200).send(csv);
            });
        }
    })
});

let getBlockchainTable = (contract, limit, cb) => {

    coronavirusController.getTable(contract, limit, 'virusdata', (err, response) => {

        var r = _.sortBy(response, item => {
            return item.dateISO
        });

        cb(err, r);

    });

};

/*
let getLimit = (req) => {

    if (req.query.limit == null || typeof req.query.limit == 'undefined') {
        return -1
    } else {
        return req.query.limit;
    }

}
*/

module.exports = router;
