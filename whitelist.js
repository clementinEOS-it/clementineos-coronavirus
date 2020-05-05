var origins = ['http://api.clementineos.it/', 
               'http://localhost:3001/', 
               'http://localhost:3002/',
               'http://localhost:3002/block/coronavirus',
               'https://clementineos-block.herokuapp.com'];

var cors = {
  origin: function (origin, callback) {
    console.log('ORIGIN ENDPOINT API: ' + origin);
    if (_.indexOf(origins, origin) != -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};

module.exports = {
    origins,
    cors
};