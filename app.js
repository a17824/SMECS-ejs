var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var bluebird = require('bluebird');
//me
var mongoose =  require('mongoose');
var db = mongoose.connection;
var cors = require('cors');
var session = require('client-sessions');
var flash = require('express-flash');

//.js file
var routesApi = require('./routes/api');
var routesEjs = require('./routes/ejs');
var routes = require('./routes/index');





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(logger('dev'));
app.use(bodyParser.json({limit: '9mb'}));
app.use(cookieParser());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

//50mb size limit to upload photos
//was FALSE by default. was TRUE for auth Template
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


// middleware
app.use(session({
    cookieName: 'session',
    secret: 'fsdklflrnkgjhalkvnahgf65uf346',
    duration: 30 * 60 * 1000,   //time in milliseconds. in this case will expired in 30min
    activeDuration: 30 * 60 * 1000, //if user sends another request, it will extend session another 30min
    httpOnly: true, //doesn't let javascript access cookies ever
    secure: true, // only use cookies over https
    ephemeral: true // delete this cookie when the browser is closed (nice when people use public computers)
}));

app.use(flash());
app.use(function(req, res, next){
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    next();
});

// use cors
app.use(cors());

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/api', routesApi);
app.use('/', routes);
app.use('/', routesEjs);

//bluebird
mongoose.Promise = require('bluebird');

//connecting to database

mongoose.connect('mongodb://a17824:Abington2018@192.168.3.248:2999/SMECS_database', { useMongoClient: true });
//mongoose.connect('mongodb://a17824:Abington2018@71.232.115.210:2999/SMECS_database', { useMongoClient: true });

//if we connect successfully or if a connection error occurs
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    // yay!
});

// error handlers

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// catch 403 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Forbidden');
    err.status = 403;
    res.render('login', {error: "403", csrfToken: req.csrfToken()});
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
