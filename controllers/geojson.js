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

let get_map = (state) => {

    var geojson_file;

    const fs = require('fs')
    
    if (state == "italy") {
        geojson_file = './geojson/italy.geojson';
    };

    if (state == "italy_prov") {
        geojson_file = './geojson/italy_prov.geojson';
    };

    if (state == "italy_city") {
        geojson_file = './geojson/italy_city.geojson';
    };

    let geojson = JSON.parse(fs.readFileSync(geojson_file));

    // console.log('GEOJSON: ' + JSON.stringify(features));
    
    return geojson;

}

module.exports = {
    get_geoJSON,
    get_map
}