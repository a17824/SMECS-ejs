//Dependencies
var models = require('./../../models');
var async = require("async");
var aclPermissions = require('./../../acl/aclPermissions');
var moment = require('moment');
var pushNotification = require('./../sendingReceiving/pushNotification.js');
var functions = require('../../functions');


//* SHOW REPORTS. */
module.exports.reportsAlerts = function(req, res, next) {
    async.parallel([
        function(callback){
            models.AlertSentInfo.find().sort({"sentDate":-1}).sort({"sentTime":-1}).exec(callback);
        },
        function(callback){aclPermissions.clearReports(req, res, callback);},          //aclPermissions clearReports
        function(callback){aclPermissions.deleteReports(req, res, callback);},       //aclPermissions deleteReports
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTabUsers(req, res, 'showUsers');
        res.render('reports/reports',{
            title: 'REPORTS SENT',
            reportSent: results[0],
            aclClearReports: results[1],           //aclPermissions clearReports
            aclDeleteReports: results[2],        //aclPermissions deleteReports
            aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};

//* SHOW REPORTS Archived. */
module.exports.reportsArchived = function(req, res, next) {
    async.parallel([
        function(callback){
            models.AlertSentInfo.find().sort({"sentDate":-1}).sort({"sentTime":-1}).exec(callback);
        },
        function(callback){aclPermissions.clearReports(req, res, callback);},          //aclPermissions clearReports
        function(callback){aclPermissions.deleteReports(req, res, callback);},       //aclPermissions deleteReports
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        res.render('reports/archived',{
            title: 'Reports Archived',
            reportSent: results[0],
            aclClearReports: results[1],           //aclPermissions clearReports
            aclDeleteReports: results[2],        //aclPermissions deleteReports
            aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};

//* SHOW REPORTS Archived. */
module.exports.reportsTrash = function(req, res, next) {
    async.parallel([
        function(callback){
            models.AlertSentInfo.find().sort({"sentDate":-1}).sort({"sentTime":-1}).exec(callback);
        },
        function(callback){aclPermissions.clearReports(req, res, callback);},          //aclPermissions clearReports
        function(callback){aclPermissions.deleteReports(req, res, callback);},       //aclPermissions deleteReports
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        res.render('reports/trashReports',{
            title: 'Trash',
            reportSent: results[0],
            aclClearReports: results[1],           //aclPermissions clearReports
            aclDeleteReports: results[2],        //aclPermissions deleteReports
            aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};

/* Update STATUS Report. */
module.exports.updateStatus = function(req, res) {

    var statusToChange = req.body.searchIDsChecked;
    var wrapped = moment(new Date());

    models.AlertSentInfo.find({'_id': statusToChange}, function (err, alerts) {
        if (err) {
            console.log('err - changing Alert STATUS');
        } else {
            alerts.forEach(function(alert){
                if (alert.status.statusString == 'open') {
                    alert.status.statusString = 'closed';
                    alert.status.statusClosedDate = wrapped.format('YYYY-MM-DD');
                    alert.status.statusClosedTime = wrapped.format('h:mm:ss a');
                } else {
                    alert.status.statusString = 'open';
                    alert.status.statusClosedDate = undefined;
                    alert.status.statusClosedTime = undefined;
                }
                alert.save();
                console.log('success - Alert status changed to ' + alert.status.statusString);
                /*****  CALL HERE NOTIFICATION API  *****/
                pushNotification.alert(alert, 'closeAlert');
            });
            return res.send({redirect: '/reports/showReports'});
        }
    })
};
/* ------------ end of SoftDeleted USERS. */

/* Move Alerts to Archive. */
module.exports.moveToArchiveOrInbox = function(req, res) {
    var statusToChange = req.body.searchIDsChecked;
    var action = req.body.action;
    var page = req.body.page;

    models.AlertSentInfo.find({'_id': statusToChange}, function (err, alerts) {
        if (err) {
            console.log('err - changing Alert to Archive or Inbox');
        } else {
            alerts.forEach(function(alert){

                if (action == 'inbox'){
                    alert.archived = false;
                    if (page == '/reports/showTrashReports')
                        alert.softDeleted = null;
                }
                if (action == 'archive') {
                    alert.archived = true;
                    if (page == '/reports/showTrashReports')
                        alert.softDeleted = null;
                }
                alert.save();
            });
            return res.send({redirect: page});
        }
    })
};
/* ------------ end of SoftDeleted USERS. */


module.exports.reportsUsers = function(req, res, next) {
    async.parallel([
        function(callback){
            models.ReportsSent.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.ReportsReceived.find().sort({"scope":1}).sort({"to":1}).exec(callback);
        },
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        res.render('reports/showReportsReceived',{
            title:'REPORTS RECEIVED',
            reportSent: results[0],
            reportReceived: results[1],
            aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};


module.exports.reportsDetails = function(req, res, next) {
    models.ReportsSent.findById(req.params.id,function(error, details) {
        console.log(details);
        res.render('reports/showReportsDetails', { title: 'Alert Details', details: details });
    });
};