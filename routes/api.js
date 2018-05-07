//Dependencies
var express = require('express');
var routerApi = express.Router();
var login = require('./authentication/login');
var auth = require('./authentication/auth');
var chooseAlert = require('./alerts/sendingReceiving/1.chooseAlert');
var email = require('./authentication/email');
var sendingAlert = require('./alerts/sendingReceiving/2.sendingAlert.js');
var reviewAlert = require('./alerts/sendingReceiving/3.reviewAlert.js');
var reports = require('./api/reports.js');

/* AUTHENTICATE ---------------------- */
routerApi.post('/login', login.postLogin, function(req, res) {});

/* FORGOT PASSWORD ------------------- */
routerApi.post('/forgot', email.forgotPost, function(req, res) {});

/* Send Alert - ChooseGroup (HOME). -------------------------------*/
routerApi.get('/chooseGroup', auth.auth, chooseAlert.showGroups, function(req, res) {});

/* Send Alert - Alerts ChooseGroup buttons ON. -------------------------------*/
routerApi.get('/alerts/sending/chooseGroupAlert/:id', auth.auth, chooseAlert.showAlerts, function(req, res) {});

/* Send Alert - Alerts ChooseGroup buttons OFF. -------------------------------*/
routerApi.get('/alerts/sending/chooseAlert', auth.auth, chooseAlert.showAlerts, function(req, res) {});
routerApi.post('/alerts/sending/chooseAlert', auth.auth,  chooseAlert.showAlertsPost, function(req, res) {});

/* Send Alert - Floor. -------------------------------*/
routerApi.get('/alerts/sending/floor/:id', auth.auth, sendingAlert.showFloor, function(req, res) {});
routerApi.post('/alerts/sending/floor', auth.auth, sendingAlert.postFloor, function(req, res) {});

/* Send Alert - FloorLocation. -------------------------------*/
routerApi.get('/alerts/sending/floorLocation/:id', auth.auth, sendingAlert.showFloorLocation, function(req, res) {});
routerApi.post('/alerts/sending/floorLocation', auth.auth, sendingAlert.postFloorLocation, function(req, res) {});

/* Send Alert - Notes. -------------------------------*/
routerApi.get('/alerts/sending/notes/:id', auth.auth, sendingAlert.showNotes, function(req, res) {});
routerApi.post('/alerts/sending/notes', auth.auth, sendingAlert.postNotes, function(req, res) {});

/* Send Alert - Student. -------------------------------*/
routerApi.get('/alerts/sending/student/:id', auth.auth, sendingAlert.showStudent, function(req, res) {});
routerApi.post('/alerts/sending/student', auth.auth, sendingAlert.postStudent, function(req, res) {});

/* Send Alert - MultiSelections. -------------------------------*/
routerApi.get('/alerts/sending/multiSelection/:id', auth.auth, sendingAlert.showMultiSelection, function(req, res) {});
routerApi.post('/alerts/sending/multiSelection', auth.auth, sendingAlert.postMultiSelection, function(req, res) {});

/* Send Alert - Review ALert. -------------------------------*/
routerApi.get('/alerts/sending/reviewAlert/:id', auth.auth, reviewAlert.reviewAlert, function(req, res, next) {});
routerApi.post('/alerts/sending/reviewAlert', auth.auth, reviewAlert.postReviewAlert, function(req, res) {});

/* Update pushToken ------------------------------------*/
routerApi.post('/updatePushToken', auth.auth, auth.pin, function(req, res) {});

/* Get all alerts ------------------------------------*/
routerApi.get('/reports/reportsGet', auth.auth, reports.reportsGet, function(req, res) {});

/* Get details on single alert ------------------------------------*/
routerApi.get('/reports/alertInfo/:id', auth.auth, reports.alertInfoGet, function(req, res) {});

/* Get number of open alerts ------------------------------------*/
routerApi.get('/reports/openAlerts', auth.auth, reports.openAlertsGet, function(req, res) {});

/* Get procedure ------------------------------------*/
routerApi.get('/reports/procedureGet/:id', auth.auth, reports.procedureGet, function(req, res) {});
routerApi.get('/reports/proceduresGet', auth.auth, reports.proceduresGet, function(req, res) {});

/* Post received alert ----------------------------------*/
routerApi.post('/alertReceipt', auth.auth, reports.alertReceiptPost, function(req, res) {});
routerApi.post('/alertViewed', auth.auth, reports.alertViewedPost, function(req, res) {});


module.exports = routerApi;