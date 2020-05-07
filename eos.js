const _ = require('lodash');

var networks = [
    {
        key: 'gqeaceafdbkq',
        url: 'https://api.testnet.eos.io',
        smartContracts: {
            coronavirus: {
                account: 'gqeaceafdbkq',
                code: 'gqeaceafdbkq', 
                scope: 'gqeaceafdbkq'
            }
        }
    },{
        key: 'iaqvrxpyvqgw',
        url: 'https://api.testnet.eos.io',
        smartContracts: {
            coronavirus: {
                account: 'iaqvrxpyvqgw',
                code: 'iaqvrxpyvqgw', 
                scope: 'iaqvrxpyvqgw'
            }
        }
    },
    {
        key: 'sxrzkuxwuxju',
        url: 'https://api.testnet.eos.io',
        smartContracts: {
            coronavirus: {
                account: 'sxrzkuxwuxju',
                code: 'sxrzkuxwuxju', 
                scope: 'sxrzkuxwuxju'
            }
        }
    },{
        key: 'clementine35',
        url: 'https://jungle2.cryptolions.io',
        smartContracts: {
            coronavirus: {
                account: 'clementine35',
                code: 'clementine35', 
                scope: 'clementine35'
            }
        }
    },{
        key: 'follwhirab33',
        url: 'https://api-bostest.blockzone.net',
        smartContracts: {
            coronavirus: {
                account: 'follwhirab33',
                code: 'follwhirab33', 
                scope: 'follwhirab33'
            }
        }
    },{
        key: 'gzilenieos33',
        url: 'https://testnet.eos.miami',
        smartContracts: {
            coronavirus: {
                account: 'gzilenieos33',
                code: 'gzilenieos33', 
                scope: 'gzilenieos33'
            }
        }
    },
    {
        key: 'local',
        url: 'http://localhost:8888',
        smartContracts: {
            coronavirus: {
                account: 'eosio',
                code: 'eosio', 
                scope: 'eosio'
            }
        }
    }
]

let get = key => {

    var i = _.findIndex(networks, o => { 
        return o.key == key; 
    });

    if (i==-1) {
        return networks[1];
    } else {
        return networks[i];
    }

}

module.exports = get;
