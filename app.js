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

var session = require('client-sessions');
var flash = require('express-flash');

//.js file
var routes = require('./routes/index');
var login = require('./routes/authentication/login');




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true })); //was FALSE by default. was TRUE for auth Template

// middleware
app.use(session({
    cookieName: 'session',
    secret: 'fsdklflrnkgjhalkvnahgf65uf346',
    duration: 30 * 60 * 1000,
    activeDuration: 30 * 60 * 1000,
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

app.use('/', routes);
app.use('/', login);


//bluebird
mongoose.Promise = require('bluebird');

//connecting to database
mongoose.connect('mongodb://a17824:Abington2018@localhost:2999/SMECS_database', { useMongoClient: true });
//mongoose.connect('mongodb://ricky:database2>@ds249415.mlab.com:49415/smecs_database');
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
