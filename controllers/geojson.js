require('dotenv').config();
const _ = require('lodash');

let get_geoJSON = (data) => {

    var _g = {
        type: "FeatureCollection",
        features: []
    };
    
    _.forEach(data, d => {
        console.log(d);

        var _f = {
            type: "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [parseFloat(d.lng), parseFloat(d.lat)]
            },
            "properties": d
        }

        _g.features.push(_f);
    
    });
                          
    return _g;
};

module.exports = get_geoJSON;