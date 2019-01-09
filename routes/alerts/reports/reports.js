//Dependencies
var models = require('./../../models');
var async = require("async");
var aclPermissions = require('./../../acl/aclPermissions');
var moment = require('moment');
var pushNotification = require('./../sendingReceiving/pushNotification.js');
var functions = require('../../functions');
var MobileDetect = require('mobile-detect');


//* SHOW REPORTS. */
module.exports.homeReports = function(req, res, next) {
    async.parallel([
        function(callback){
            models.AlertSentInfo.find().sort({"sentDate":-1}).sort({"sentTime":-1}).exec(callback);
        },
        function(callback){aclPermissions.clearReports(req, res, callback);},          //aclPermissions clearReports
        function(callback){aclPermissions.deleteReports(req, res, callback);},       //aclPermissions deleteReports
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTabUsers(req, res, 'showUsers');
        functions.redirectTabBuildings(req, res, 'showBuilding');

        var page = 'home-reports/home-reports';

        var md = new MobileDetect(req.headers['user-agent']);
        if(md.is('iPad') == true)
            page = 'home-reports/home-mobReports';


        res.render(page,{
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
        res.render('home-reports/archivedReports',{
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
        res.render('home-reports/trashReports',{
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
        return res.send({redirect: '/reports/homeReports'});
    }
})
};
/* ------------ end of SoftDeleted USERS. */

/* Move Alerts to Archive. */
module.exports.moveToArchiveInboxTrash = function(req, res) {

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
                    if (page == '/reports/showTrashReports'){
                        alert.softDeletedBy = null;
                        alert.softDeletedDate = null;
                        alert.softDeletedTime = null;
                        alert.expirationDate = undefined;
                    }
                }
                if (action == 'archive') {
                    alert.archived = true;
                    if (page == '/reports/showTrashReports'){
                        alert.softDeletedBy = null;
                        alert.softDeletedDate = null;
                        alert.softDeletedTime = null;
                        alert.expirationDate = undefined;
                    }
                }
                if (action == 'trash') {
                    var wrapped = moment(new Date());
                    alert.archived = false;
                    alert.softDeletedBy = req.session.user.firstName + " " + req.session.user.lastName;
                    alert.softDeletedDate = wrapped.format('YYYY-MM-DD');
                    alert.softDeletedTime = wrapped.format('h:mm:ss');
                    alert.expirationDate = new Date(Date.now() + ( 30 * 24 * 3600 * 1000)); //( 'days' * 24 * 3600 * 1000) milliseconds
                }
                alert.save();
            });
            return res.send({redirect: page});
        }
    })
};
/* ------------ end of Move Alerts to Archive. */


module.exports.reportsDetails = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertSentInfo.findById(req.params.id).exec(callback);
        },
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){

        var page = 'home-reports/reportDetails';
        if(req.params.id == '5b1e96f26e727c382cbce097')
            page = 'home-reports/reportDetailsSim';
        if(req.params.id == '5b1eb1d86e727c382cbce0a6')
            page = 'home-reports/reportDetailsSimAllGreen';


        res.render(page,{
            title: 'REPORTS SENT',
            userAuthID: req.user.userPrivilegeID,
            report: results[0],
            aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })

};


/* to delete ------------------------------------------------------
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
*/

