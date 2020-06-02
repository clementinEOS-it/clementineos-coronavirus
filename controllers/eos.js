require('dotenv').config();

const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');                   // node only; native TextEncoder/Decoder
// const { TextEncoder, TextDecoder } = require('text-encoding');  

const _ = require('lodash');
const moment = require('moment');

let signatureProvider; 
let rpc, api;

// init eos 
let init = (url, defaultPrivateKey) => {

    console.info('**** Connected to EOS BLOCKCHAIN Network -> ' + url + '\n---------------\n');

    signatureProvider = new JsSignatureProvider([defaultPrivateKey]);
    // signatureProvider = new JsSignatureProvider([process.env.PRIVATEKEY]);

    rpc = new JsonRpc(url, { 
        fetch 
    });

    api = new Api({ 
        rpc, 
        signatureProvider, 
        textDecoder: new TextDecoder(), 
        textEncoder: new TextEncoder() 
    });

};

let runAction = async (actions, cb) => {

    try {

        /*
        const result = await api.transact({
            expiration: moment().add(10, 'm').format('YYYY-MM-DDTHH:mm'),
            ref_block_num: '3',
            ref_block_prefix: '3703649114',
            actions: actions
        });
        */

        const result = await api.transact({
            actions: actions
        }, {
            blocksBehind: 3,
            expireSeconds: 30,
            broadcast: true,
            sign: true
        });
        
        cb(false, result);

    } catch (e) {

        console.error('\n ------\n Caught exception run Action -> ' + e);

        if (e instanceof RpcError) {
            cb(true, JSON.stringify(e.json, null, 2));
        }

    };

};

let getDataTable = async (config, cb) => {

    try {
        const resp = await rpc.get_table_rows(config);
        console.log('... receving data table from blockchain n.' + _.size(resp.rows));
        
        cb(false, resp.rows);

    } catch (e) {
        
        console.log('\nCaught exception by Get Data Table ' + e);
        console.log('\nOptions ' + JSON.stringify(config));

        if (e instanceof RpcError) {
            cb(true, JSON.stringify(e.json, null, 2));
        }
    }

}

let getOptionTable = (contract, table, limit) => {

    var options = {
        json: true,                 // Get the response as json
        code: contract.account,     // Contract that we target
        scope: contract.account,    // Account that owns the data
        table: table,               // Table name
        limit: limit,               // Here we limit to 1 to get only row
        reverse: false,             // Optional: Get reversed data
        show_payer: false           // Optional: Show ram payer
    };

    return options;
}

module.exports = {
    init,
    rpc,
    api,
    runAction,
    getDataTable,
    getOptionTable
};