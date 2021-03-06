//Dependencies
var express = require('express');
var routerEjs = express.Router();
var login = require('./authentication/login');
var csrf = require('csurf');

routerEjs.use(csrf());

/* GET login page. */
routerEjs.get('/login', login.getLogin, function(req, res) {});
routerEjs.get('/loginSessionExpired', login.getLoginSessionExpired, function(req, res) {});
routerEjs.get('/loginParents', login.getLoginParentSelfRegistration, function(req, res) {});
routerEjs.get('/loginFurtherInstructions/:emailMessage', login.getLoginFurtherInstructions, function(req, res) {});
routerEjs.get('/loginResetPassword', login.getLoginResetPassword, function(req, res) {});
routerEjs.post('/login', login.postLogin, function(req, res) {});
routerEjs.get('/logout', login.getLogout, function(req, res) {});

module.exports = routerEjs;
