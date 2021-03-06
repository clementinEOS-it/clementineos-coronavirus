const _ = require('lodash');
const moment = require('moment');
const axios = require('axios');
var turf = require('@turf/turf');

require('dotenv').config();

//var csv is the CSV file with headers
let csvJSON = (csv) => {

    var lines=csv.split("\n");
  
    var result = [];
  
    var headers=lines[0].split(",");

    // console.log('headers: ' + JSON.stringify(headers[0][0]));
  
    for(var i=1;i<lines.length;i++){
  
        var obj = {};
        var currentline=lines[i].split(",");
  
        for(var j=0; j < headers.length; j++){
            obj[headers[j]] = currentline[j];
        }
  
        result.push(obj);
  
    }
    
    //return result; //JavaScript object
    return JSON.stringify(result); //JSON
}

let byGraphList = (data, cb) => {

    var _data = [];

    _.forEach(data, item => {

        var _d = {};
        var _item = get_data(item, null);

        _d = {
            'Data': _item._ds,
            'Ricoverati_con_sintomi': _item._hws,
            'Terapia_intensiva': _item._ic,
            'Totale_ospedalizzati' : _item._to,
            'Isolamento_domiciliare': _item._hi, 
            'Totale_positivi': _item._tot_cp,
            'Dimessi_guariti': _item._dh,
            'Deceduti': _item._dead,
            'Nuovi_positivi': _item._tot_new_cp,
            'Totale_casi': _item._tot_c,
            'Casi_testati': _item._tc
        };
            
        _data.push(_d);
    });

    cb(_data);

} 

let byGraphListOne = (data, select, cb) => {

    var _data = [];

    _.forEach(data, item => {

        var v;
        var _item = get_data(item, null);

        if (select == 'hws') {
            v = _item._hws;
        } else if (select == 'ic') {
            v = _item._ic;
        } else if (select == 'to') {
            v = _item._to;
        } else if (select == 'hi') {
            v = _item._hi;
        } else if (select == 'tot_cp') {
            v = _item._tot_cp;
        } else if (select == 'tot_c') {
            v = _item._tot_c;
        } else if (select == 'dh') {
            v = _item._dh;
        } else if (select == 'dead') {
            v = _item._dead;
        } else if (select == 'tot_new_cp') {
            v = _item._tot_new_cp;
        } else if (select == 'sw') {    
            v = _item._sw;
        } else if (select == 'tc') {   
            v = _item._tc;
        }

        var _d = {
            'date': moment(_item._ds).format('DD/MM/YYYY'),
            'value': v
        };
            
        _data.push(_d);
    });

    cb(_data);

} 

let get_data = (item, byLatLng) => {

    var _d = {
        _ds: moment(item.date_at).format('YYYY-MM-DD'),
        _ts: moment(item.date_at).unix(),
        _id_hash: '',
        _source_hash: item.source_hash,
        _lat: 0,
        _lng: 0,
        _hws: checkData(item.hws), 
        _ic: checkData(item.ic),
        _to: checkData(item.to),            
        _hi: checkData(item.hi),
        _tot_cp: checkData(item.tot_cp),
        _tot_c: checkData(item.tot_c),
        _dh: checkData(item.dh),
        _dead: checkData(item.dead),
        _sw: checkData(item.sw),
        _tot_new_cp: checkData(item.tot_new_cp), 
        _tc: checkData(item.tc)
    }

    if (byLatLng && byLatLng != null && typeof byLatLng != 'undefined') {
        _d._id_hash = item.id_hash;
        _d._lat = checkDataFloat(item.lat);
        _d._lng = checkDataFloat(item.lng);
    };

    return _d;

}

let byGraph = (data, cb) => {

    var _data = [];

    _.forEach(data, item => {

        var _d = {};
        var keys = Object.keys(item);
        var _item = get_data(item, null);

        _.forEach(keys, k => {

            if (k == "hws") {

                _d = {
                    group: 'Ricoverati con sintomi',
                    date: _item._ds,
                    value: _item._hws
                }
    
            } else if (k == "ic") {
    
                _d = {
                    group: 'Terapia intensiva',
                    date: _item._ds,
                    value: _item._ic
                }
    
            } else if (k == "to") {
    
                _d = {
                    group: 'Totale ospedalizzati',
                    date: _item._ds,
                    value: _item._to
                }
    
            } else if (k == "hi") {
    
                _d = {
                    group: 'Isolamento domiciliare',
                    date: _item._ds,
                    value: _item._hi
                }
    
            } else if (k == "tot_cp") {
    
                _d = {
                    group: 'Totale positivi',
                    date: _item._ds,
                    value: _item._tot_cp
                };
    
            } else if (k == "dh") {
    
                _d = {
                    group: 'Dimessi guariti',
                    date: _item._ds,
                    value: _item._dh
                };
    
            } else if (k == "dead") {
    
                _d = {
                    group: 'Deceduti',
                    date: _item._ds,
                    value: _item._dead
                };
            
            }

            else if (k == "sw") {
    
                _d = {
                    group: 'Tamponi',
                    date: _item._ds,
                    value: _item._sw
                }
            
            } else if (k == "tot_new_cp") {
    
                _d = {
                    group: 'Nuovi positivi',
                    date: _item._ds,
                    value: _item._tot_new_cp
                }
    
            } else if (k == "tot_c") {
    
                _d = {
                    group: 'Totale casi',
                    date: _item._ds,
                    value: _item._tot_c
                }
    
            } else if (k == "tc") {
    
                _d = {
                    group: 'Casi testati',
                    date: _item._ds,
                    value: _item._tc
                }
    
            }
            
            if (_d != null) {
                _data.push(_d);
            }
        });
    });

    cb(_data);

} 

let _runData = (_prev, _last, byLatLng, cb) => {

    var new_array = [];
    
    var _item_last = get_data(_last, byLatLng);
    var _item_prev = get_data(_prev, byLatLng);

    // console.log('----- LAST -----');
    // console.table(_item_last);

    // console.log('----- PREV -----');
    // console.table(_item_prev);

    var keys = Object.keys(_last);

    _.forEach(keys, k => {

        var _d = {
            data: _item_last._ds,
            timestamp: _item_last._ts,
            id_hash: _item_last._id_hash,
            lat: _item_last._lat,
            lng: _item_last._lng,
            item: k,
            title: '',
            subtitle: '',
            value: _item_last['_' + k],
            format: _item_last['_' + k],
            diff: _item_last['_' + k] - _item_prev['_' + k],
            perc: getPercentageChange(_item_prev['_' + k], _item_last['_' + k])
        };
        
        if (k == "hws") {

            _d.title = 'Ricoverati con sintomi';
            _d.subtitle = 'Hospitalized with symptoms 有症狀住院';

        } else if (k == "ic") {

            _d.title = 'Terapia intensiva';
            _d.subtitle = 'Intensive care 重症監護';

        } else if (k == "to") {

            _d.title = 'Totale ospedalizzati';
            _d.subtitle = 'Total hospitalized 住院總人數';

        } else if (k == "hi") {

            _d.title = 'Isolamento domiciliare';
            _d.subtitle = 'Home isolation 家庭隔離';
            
        } else if (k == "tot_cp") {

            _d.title = 'Totale positivi';
            _d.subtitle = 'Total currently positive 目前總計';
            
        } else if (k == "dh") {

            _d.title = 'Dimessi guariti';
            _d.subtitle = 'Discharged healed 出院he愈';
           
        } else if (k == "dead") {

            _d.title = 'Deceduti';
            _d.subtitle = 'deceased 死者';
            
        } else if (k == "sw") {

            _d.title = 'Tamponi';
            _d.subtitle = 'swabs 拭子';
            
        } else if (k == "tot_new_cp") {

            _d.title = 'Nuovi positivi';
            _d.subtitle = 'New currently positive 新的當前積極';
            
        } else if (k == "tot_c") {

            _d.title = 'Totale casi';
            _d.subtitle = 'Total cases 案件總數';
            
        } else if (k == "tc") {

            _d.title = 'Casi testati';
            _d.subtitle = 'Cases Tested 案例测试';
            
        }

        if (_d != null) {

            var idx = _.findIndex(new_array, o => { 
                return o.title == _d.title; 
            });
    
            if (idx == -1) {
                new_array.push(_d);
            } else {
                new_array[idx].perc = _d.perc;
                new_array[idx].data = _d.data;
                new_array[idx].timestamp = _d.timestamp;
                new_array[idx].value = _d.value;
                new_array[idx].diff = _d.diff;
            };
    
            // console.table(_d);
        }
        
    });

    var _perc_dead = parseInt((_item_last._dead / _item_last._tot_c) * 100);
    var _perc_prev_dead = parseInt((_item_prev._dead / _item_last._tot_c) * 100);

    var _d = {
        data: _item_last._ds,
        timestamp: _item_last._ts,
        id_hash: _item_last._id_hash,
        lat: _item_last._lat,
        lng: _item_last._lng,
        item: 'perc_dead',
        title: 'Letalità',
        subtitle: 'Lethality 殺傷力',
        value: _perc_dead,
        format: _perc_dead + ' %',
        diff: _perc_dead - _perc_prev_dead,
        perc: getPercentageChange(_perc_prev_dead, _perc_dead)
    };
    new_array.push(_d);
    // console.table(_d);

    var _perc_head = parseInt((_item_last._dh / _item_last._tot_c) * 100);
    var _perc_prev_head = parseInt((_item_prev._dh / _item_last._tot_c) * 100);

    var _d = {
        data: _item_last._ds,
        timestamp: _item_last._ts,
        id_hash: _item_last._id_hash,
        lat: _item_last._lat,
        lng: _item_last._lng,
        item: 'perc_head',
        title: 'Guarigione',
        subtitle: 'healing 复原',
        value: _perc_head,
        format: _perc_head + ' %',
        diff: _perc_head - _perc_prev_head,
        perc: getPercentageChange(_perc_prev_head, _perc_head)
    };
    new_array.push(_d);
    // console.table(_d);

    cb(new_array);
}

let byDiff = (data) => {

    var _data = [];

    console.log('*** data_byDiff *** ' + _.size(data));

    var _last = _.last(data);
    var _prev = data[_.size(data)-2];

    _runData(_prev, _last, false, result => {
        _data = result;
    });

    return _data;

};

let getPercentageChange = (oldNumber, newNumber) => {
       
    var decreaseValue = oldNumber - newNumber;

    return parseInt((decreaseValue / oldNumber) * 100);

};

let byLatLng = (data, select) => {

    var _data = [];

    var _data_group = _.groupBy(data, item => {
        return getString_LatLng(item);
    });

    // console.table(_data_group);

    var keys = Object.keys(_data_group);
    
    _.forEach(_data_group, item => {

        if (_.size(item) > 0) {
            
            var _last = _.last(item);
            var _prev = item[_.size(item)-2];

            // console.log('Funded n. ' + _.size(item));
            // console.log('LatLng Prev -> ' + getString_LatLng(_prev));
            // console.log('LatLng Last -> ' + getString_LatLng(_last));

            _runData(_prev, _last, true, result => {
                _data = _.union(_data, result);
            });
        }
    });

    if (typeof select != 'undefined') {
        _data = _.filter(_data, o => {
            return o.item == select
        });
    };

    return _data;

};

/*

{
    "from": "gqeaceafdbkq",
    "id": 2,
    "date_at": "2020-02-24",
    "id_hash": "4a319383e66a4335a8bfa34f98532162febf587a38da949baada4142a79f8b6a",
    "source_hash": "d15751d2627b50c696b4f1ae4ede7127780e1c57ef8d4ef15a531067e5eae9b0",
    "lat": "46.49933452999999872",
    "lng": "11.35662422000000049",
    "hws": 0,
    "ic": 0,
    "to": 0,
    "hi": 0,
    "tot_cp": 0,
    "tot_new_cp": 0,
    "dh": 0,
    "dead": 0,
    "tot_c": 0,
    "sw": 1,
    "tc": 0
  }

*/

let getString_LatLng = (item) => {
    return [item.lat,item.lng]
};

let byTime = (data) => {

    var _data = [];

    _.forEach(data, item => {

        var idx = _.findIndex(_data, o => { 
            // console.log('Date : ' + JSON.stringify(o));
            return moment(o.date_at).isSame(moment(item.date_at));
        });

        if (idx == -1) {
            _data.push(item);
        } else {
            _data[idx].hws += checkData(item.hws);
            _data[idx].ic += checkData(item.ic);
            _data[idx].to += checkData(item.to);
            _data[idx].hi += checkData(item.hi);
            _data[idx].tot_cp += checkData(item.tot_cp);
            _data[idx].tot_new_cp += checkData(item.tot_new_cp);
            _data[idx].dh += checkData(item.dh);
            _data[idx].dead += checkData(item.dead);
            _data[idx].tot_c += checkData(item.tot_c);
            _data[idx].sw += checkData(item.sw);
            _data[idx].tc += checkData(item.tc);
        };

    });

    return _data;
    
} 

let checkData = d => {

    if (d == null || typeof d == undefined) {
        return 0
    } else {
        return parseInt(d)
    }
};

let checkDataFloat = d => {

    if (d == null || typeof d == undefined) {
        return 0
    } else {
        return parseFloat(d)
    }
};

let getGeoJSON = (data, state, callback) => {

    var url = (process.env.ENV == 1 ? 'http://localhost:3002/map/' : 'http://map.clementineos.it/map/') + state;
    console.log(url);

    axios.get(url).then(response => {

        var geojson = response.data;
        console.log('Features: ' + _.size(geojson.features));
        var i=1;
        _.forEach(geojson.features, feature => {

            var index = _.findIndex(data, item => {
                var pt = turf.point([item.lng, item.lat]);
                return (turf.booleanPointInPolygon(pt, feature.geometry.coordinates)) 
            });

            feature.properties.api = data[index];
        });

        console.log('Features: ' + _.size(geojson.features));
        callback(false, geojson);

    }).catch(error => {
        // handle error
        console.error(error);
        callback(true, error);
    });

}

module.exports = {
    byTime,
    byDiff,
    byLatLng,
    csvJSON,
    byGraph,
    byGraphList,
    byGraphListOne,
    getGeoJSON
};