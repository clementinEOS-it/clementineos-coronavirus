const _ = require('lodash');
const moment = require('moment');
var eosController = require('../controllers/eos');
const axios = require('axios');
const async = require('async');
const crypto = require('crypto');
const opendata = require('../opendata/coronavirus');

require('dotenv').config();

var baseURL = 'http://localhost:' + process.env.PORT + '/block/coronavirus';

// Set config defaults when creating the instance
const instance = axios.create({
    baseURL: baseURL,
    headers: {'Origin': baseURL}
});

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


let send = (socket, data, cb) => {

    var _response = {
        blocks: [],
        errors: []  
    };

    var processed;
    var error;

    async.eachSeries(data, (d, callback) => {

        instance.post('/', d).then(response => {

            // var resp = JSON.parse(response);
            error = response.data.error;
            var status = response.status;

            processed = response.data.data.processed;
            
            console.log('Status receiving data -> ' + status);
            console.log('receiving data from API Send .... Error -> ' + error.value + ' Block Num -> ' + processed.block_num);
            
            if (error.value) {
                console.warn('Error ...');
                _response.errors.push(JSON.stringify(resp_data.error));
            };

            callback();

        }).catch(error => {

            _response.errors.push(JSON.stringify(error));
            callback();

        }).then(function () {
            // always executed
            console.log('always ...');

            if (!error.value) {
                _response.blocks.push(processed);
                console.log('sending socket n.' + _.size(_response.blocks));
                socket.emit('block', JSON.stringify(processed));
            };

        });  
    
    }, err => {
        
        if (err) {
            console.error('Error to SEND.');
        };

        cb(_.size(_response.errors) > 0, _response);
    });
    
};

let update = (socket, cb) => {

    getData(opendata, (err, data) => {

        var msg = 'sending n.' + _.size(data) + ' data to Blockchain network ... ';
        console.info(msg);
        socket.emit('update', msg);

        if (!err && (_.size(data) > 0)) {
            send(socket, data, cb);
        } else if (err) {
            var msg = 'Can\'t read source url opendata!';
            console.warn('error', msg);
            socket.emit('error', msg);
            cb(true, {});
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
