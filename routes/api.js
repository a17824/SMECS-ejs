//Dependencies
var express = require('express');
var routerApi = express.Router();
var login = require('./authentication/login');
var auth = require('./authentication/auth');
var chooseAlert = require('./alerts/sendingReceiving/1.chooseAlert');


routerApi.post('/login', login.postLogin, function(req, res) {});
routerApi.get('/chooseGroup', auth.auth, chooseAlert.showGroups, function(req, res) {});

routerApi.get('/alerts/sending/chooseAlert', auth.auth, chooseAlert.showAlerts, function(req, res) {});


/* Update pushToken ------------------------------------*/
routerApi.post('/updatePushToken', auth.auth, auth.pin, function(req, res) {});


module.exports = routerApi;
