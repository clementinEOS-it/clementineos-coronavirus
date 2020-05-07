require('dotenv').config();

const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');                   // node only; native TextEncoder/Decoder
// const { TextEncoder, TextDecoder } = require('text-encoding');  

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

module.exports = {
    init,
    rpc,
    api,
    runAction
};