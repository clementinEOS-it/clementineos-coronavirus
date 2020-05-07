const _ = require('lodash');
const moment = require('moment');
var eosController = require('../controllers/eos');
const axios = require('axios');
const async = require('async');
const crypto = require('crypto');
const opendata = require('../opendata/coronavirus');
const eosNet = require('../eos')(process.env.EOSNETWORK)

require('dotenv').config();

var api_url;

if (process.env.TEST == 1) {
    api_url = 'http://localhost:3001/covid19/v1/';
} else {
    api_url = 'http://api.clementineos.it/covid19/v1/';
};

let getAPI = (cb) => {
    axios.get(api_url).then(data => {
        cb(false, data);
    }).catch(error => {
        // handle error
        console.error(error);
        cb(true, error);
    });
};

let getData = (source, cb) => {

    var _data = [];
    
    axios.get(source.url).then(data => {

        _.forEach(data.data, item => {

            var lat = 0, lng = 0;

            if ((typeof item.lat == 'undefined' && typeof item.long == 'undefined') ||
                (item.lat == 'null' && item.long == 'null')) {
                    lat = 0;
                    lng = 0;
            } else {
                lat = checkDataFloat(item.lat);
                lng = checkDataFloat(item.long);
            };

            var _d = {
                dateISO: moment(item.data).format('YYYY-MM-DD'),
                source_hash: getKey(source.id),
                key: getKey(item),
                lat: lat,
                lng: lng,
                hws: checkData(item.ricoverati_con_sintomi),
                ic: checkData(item.terapia_intensiva),
                to: checkData(item.totale_ospedalizzati),
                hi: checkData(item.isolamento_domiciliare),
                tot_cp: checkData(item.totale_positivi),
                tot_new_cp: checkData(item.variazione_totale_positivi),
                dh: checkData(item.dimessi_guariti),
                dead: checkData(item.deceduti),
                tot_c: checkData(item.totale_casi),
                sw: checkData(item.tamponi),
                tc: checkData(item.casi_testati)
            };

            _data.push(_d);

        });

        cb(false, _data);
            
    }).catch(error => {
        // handle error
        console.error(error);
        cb(true, error);
    });

};

let getKey = (s) => {

    var key = 'COVID19_' + s.stato + '_' + s.codice_regione + '_' + String(s.denominazione_regione).replace("'","") + "_" + moment(s.data).unix();
    
    var crypto_key = crypto.createHash("sha256")
        .update(key)
        .digest("hex");

    return crypto_key;
};

let checkData = (d) => {

    if (d == null || typeof d == undefined) {
        return 0
    } else {
        return parseInt(d)
    }
};

let checkDataFloat = (d) => {

    if (d == null || typeof d == undefined) {
        return 0
    } else {
        return parseFloat(d)
    }
};

let post = (data, cb) => {

    var contract = eosNet.smartContracts.coronavirus;
    
    var actions = [{
        account: contract.account,
        name: "send",
        authorization: [{
            actor: contract.account,
            permission: "active"
        }],
        data: data
    }];

    // console.table(actions.data);

    run(actions, cb);
};

let isFindOne = (api_data, item) => {

    // console.log('--- Element item: ' + JSON.stringify(item));

    var i = _.findIndex(api_data, o => {
        return item.key == o.id_hash
    });

    if (i != -1) {

        // console.log('--- Element api_data: ' + JSON.stringify(api_data[i]))

        return item.dateISO == api_data[i].date_at &&
               item.source_hash == api_data[i].source_hash &&
               item.lat == api_data[i].lat &&
               item.lng == api_data[i].lng &&
               item.hws == api_data[i].hws &&
               item.ic == api_data[i].ic &&
               item.to == api_data[i].to &&
               item.hi == api_data[i].hi &&
               item.tot_cp == api_data[i].tot_cp && 
               item.tot_new_cp == api_data[i].tot_new_cp &&
               item.dh == api_data[i].dh &&
               item.dead == api_data[i].dead &&
               item.tot_c == api_data[i].tot_c &&
               item.sw == api_data[i].sw &&
               item.tc == api_data[i].tc;

    } else {
        return false;
    }

    /*
    {
        "from": "gqeaceafdbkq",
        "id": 1,
        "date_at": "2020-02-24",
        "id_hash": "d62bef36c69237dfa5eb6c1aee43d44b5581d09ebe572a46462fa506e971e993",
        "source_hash": "43b216b115b78343991832dac34d25534c3455634d3819c59e8228b07d7753a3",
        "lat": "40.63947052000000326",
        "lng": "15.80514834000000057",
        "hws": 0,
        "ic": 0,
        "to": 0,
        "hi": 0,
        "tot_cp": 0,
        "tot_new_cp": 0,
        "dh": 0,
        "dead": 0,
        "tot_c": 0,
        "sw": 0,
        "tc": 0
    }
    */

};

let send = (socket, data, api_data, cb) => {

    var _response = {
        blocks: [],
        errors: []  
    };

    var processed, error;

    async.eachSeries(data, (d, callback) => {

        // controllo se esiste già
        if (!isFindOne(api_data, d)) {

            console.log('New opendata element funded ...')
            // console.table(d);

            post(d, (err, response) => {

                if (err) {
                    console.error('Error to send data blockchain ....');
                    _response.errors.push(JSON.stringify(d));
                    callback();
                } else {

                    // var resp = JSON.parse(response);
                    error = response.error;
                    processed = response.data.processed;
                    
                    console.log('receiving data from API Send .... Error -> ' + error.value + ' Block Num -> ' + processed.block_num);
                    
                    if (error.value) {
                        console.error('Error ...');
                        _response.errors.push(JSON.stringify(resp_data.error));
                        console.table(resp_data.error);
                    } else {
                        _response.blocks.push(processed);
                        console.log('sending socket n.' + _.size(_response.blocks));
                        console.table(d);
                        socket.emit('block', JSON.stringify(processed));
                    };

                    callback();
                }
            });
        } else {
            console.log('Opendata id -> ' + d.id_hash + ' already updated.');
        }

    }, err => {
        cb(_.size(_response.errors) > 0, _response);
    });
    
};

let update = (socket, cb) => {

    var result;
    var api_data;

    async.series({
        one: function(callback) {

            getAPI((err, data) => {
                if (err) {
                    callback(err, 'Error to get Data Table from Blockchain');
                } else {
                    api_data = data.data;
                    callback(null, 'Ok to get Data Table from Blockchain');
                }
            });

        },
        two: function(callback){

            getData(opendata, (err, data) => {

                var msg = 'sending n.' + _.size(data) + ' data to Blockchain network ... ';
                console.info(msg);
                socket.emit('update', msg);
        
                if (!err && (_.size(data) > 0)) {
                    result = data;
                    callback(null, 'Ok to send data to blockchain ... ');
                } else if (err) {
                    var msg = 'Can\'t read source url opendata!';
                    console.warn('error', msg);
                    socket.emit('error', msg);
                    callback(err, msg);
                };
            }); 

        }
    }, function(err, results) {
        if (err) {
            cb(true, results);
        } else if (_.size(result) > 0) {
            send(socket, 
                 result, 
                 api_data, 
                 cb);
        };
    });

};

let run = (actions, cb) => {

    // console.log('Run Actions ...');
    // console.log(JSON.stringify(actions));

    eosController.runAction(actions, (err, result) => {

        var _r = {
            data: result,
            error: {
                value: false,
                actions: [],
                description: {},
                created_at: 0
            }
        };

        if (err) {
            
            _r.data = {};
            _r.error = {
                value: true,
                actions: actions,
                description: result,
                created_at: moment().toISOString()
            };

            console.error('ERROR -> ' + moment().toISOString());

        } else {
            console.info('OK -> ' + moment().toISOString());
        };

        // console.log(JSON.stringify(result));
        cb(err, _r);

    });
};

module.exports = {
    run,
    update
}
