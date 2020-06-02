var createError     = require('http-errors');
var express         = require('express');
var path            = require('path');
var cookieParser    = require('cookie-parser');
var logger          = require('morgan');

const cookieSession = require('cookie-session');
const crypto        = require('crypto');
const cors          = require('cors');

require('dotenv').config();

// Routes
var indexRouter = require('./routes/index');
var cvBlock = require('./routes/blockchain');
var cvAPI = require('./routes/blockchain');

// Controllers
var eosController = require('./controllers/eos');

// --------------------------------------------
var app = express();

console.info('---------------\n**** Started ' + process.env.TITLE + ' on port ' + process.env.PORT);

// ---------------------------------------------------
// CONFIGURING EOS BLOCKCHAIN NETWORK
app.locals.eos = require('./eos')(process.env.ACCOUNT);
app.locals.privateKey = process.env.PRIVATEKEY;

console.info('**** Eos Network Index ' + app.locals.eos.account);
eosController.init(app.locals.eos.url, app.locals.privateKey);
app.locals.rpc = eosController.rpc;
app.locals.api = eosController.api;

// --------------------------------------------
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ----- session ----- */
app.use(cookieSession({
  name: 'clementine',
  keys: [crypto.randomBytes(32).toString('hex')],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// --------------------------------------------
// Bootstrap 
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/socket', express.static(__dirname + '/node_modules/socket.io-client/dist'));
app.use('/moment', express.static(__dirname + '/node_modules/moment'));
app.use('/lodash', express.static(__dirname + '/node_modules/lodash'));
app.use('/vue', express.static(__dirname + '/node_modules/vue/dist'));

// --------------------------------------------
// CORS
app.use(cors());

// --------------------------------------------
// API Endpoints
app.use('/', indexRouter);
app.use('/blockchain', cvBlock);
app.use('/api/v1', cvAPI);

// --------------------------------------------
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

});

module.exports = app;
