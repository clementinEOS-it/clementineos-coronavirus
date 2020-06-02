const _ = require('lodash');
const moment = require('moment');
const eos = require('eosblockchain');
const axios = require('axios');
const async = require('async');
const crypto = require('crypto');
const opendata = require('../opendata/coronavirus');
const eosNet = require('../eos')(process.env.ACCOUNT)

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

let isNew = (api_data, item) => {

    var element = _.find(api_data, { 
        'id_hash': item.key
        // , 'source_hash': item.source_hash
        // ,'date_at': item.dateISO
    });

    /*
    var element = _.find(api_data, o => {

        // console.log('Element find :' + JSON.stringify(o));


        return (item.key == o.id_hash) &&
               (item.source_hash == o.source_hash) &&
               (moment(item.dateISO).isSame(o.date_at)) &&
               item.lng == o.lng &&
               item.hws == o.hws &&
               item.ic == o.ic &&
               item.to == o.to &&
               item.hi == o.hi &&
               item.tot_cp == o.tot_cp && 
               item.tot_new_cp == o.tot_new_cp &&
               item.dh == o.dh &&
               item.dead == o.dead &&
               item.tot_c == o.tot_c &&
               item.sw == o.sw &&
               item.tc == o.tc
    });
    */

    if (typeof element == 'undefined') {
        console.log('***** New opendata element funded *****');
        console.table(item);
    } else {
        console.log('Opendata id -> ' + element.id_hash + ' already updated.');
    };

    return (typeof element == 'undefined');

};

let send = (socket, data, api_data, cb) => {

    var _response = {
        blocks: [],
        errors: []  
    };

    var processed, error;

    async.eachSeries(data, (d, callback) => {

        // controllo se esiste già
        if (isNew(api_data, d)) {

            var contract = eosNet.smartContracts.coronavirus;
    
            run(contract, 'send', d, (err, response) => {

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
                        socket.emit('error', resp_data.error);
                    } else {
                        _response.blocks.push(processed);
                        console.log('sending socket n.' + _.size(_response.blocks));
                        socket.emit('block', JSON.stringify(processed));
                    };

                    callback();
                }
            });
        } else {
            socket.emit('update', 'Last transactions: ' + d.key + ' - ' + d.dateISO);
            callback();
        };

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

let run = (contract, action, data, cb) => {

    eos.run(contract, action, data, (err, result) => {

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

        cb(err, _r);

    });
};

module.exports = {
    run,
    update
}
