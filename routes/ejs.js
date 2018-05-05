//Dependencies
var express = require('express');
var routerEjs = express.Router();
var login = require('./authentication/login');
var auth = require('./authentication/auth');
var chooseAlert = require('./alerts/sendingReceiving/1.chooseAlert');


var login = require('./authentication/login');
var csrf = require('csurf');

routerEjs.use(csrf());


/* GET login page. */
routerEjs.get('/login', login.getLogin, function(req, res) {});
routerEjs.post('/login', login.postLogin, function(req, res) {});
routerEjs.get('/logout', login.getLogout, function(req, res) {});

module.exports = routerEjs;
