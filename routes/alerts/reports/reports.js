//Dependencies
var models = require('./../../models');
var async = require("async");
var aclPermissions = require('./../../acl/aclPermissions');
var moment = require('moment');
var pushNotification = require('./../sendingReceiving/pushNotification.js');
var functions = require('../../functions');
var MobileDetect = require('mobile-detect');
let reportsApi = require('./../../api/reports.js');
let reportsEJS = require('./reports.js');


//* SHOW REPORTS. */
module.exports.homeReports = function(req, res, next) {
    async.parallel([
        function(callback){
            models.AlertSentInfo.find().sort({"_id":-1}).exec(callback);
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
            models.AlertSentInfo.find().sort({"_id":-1}).sort({"sentTime":-1}).exec(callback);
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
            models.AlertSentInfo.find().sort({"_id":-1}).sort({"sentTime":-1}).exec(callback);
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

            });
            /*****  CALL HERE NOTIFICATION API  *****/
            pushNotification.updateBadge(alerts);
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
        if(err || !results) console.log('something wrong with results. err - ', err);
        else {
            if (!req.decoded)       // EJS user
                reportsApi.receivedViewedAlert(req, results[0]); //mark alert as been received and viewed

            var page = 'home-reports/reportDetails';
            if(req.params.id == '5b1e96f26e727c382cbce097')
                page = 'home-reports/reportDetailsSim';
            if(req.params.id == '5b1eb1d86e727c382cbce0a6')
                page = 'home-reports/reportDetailsSimAllGreen';



            reportsEJS.totalNumbers(results[0],function (result,err) {
                if(err) console.log('totalNumbers err - ',);
                else {
                    res.render(page,{
                        title: 'REPORTS SENT',
                        userAuthID: req.user.userPrivilegeID,
                        report: results[0],
                        aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                        userAuthName: req.user.firstName + ' ' + req.user.lastName,
                        userAuthPhoto: req.user.photo,
                        total: result
                    });
                }
            });
        }
    })
};



module.exports.totalNumbers = function(alert, callback) {
    let total = {
        sentToAll: [],
        sentToNoPushToken: [],
        sentToWithPushToken: [],
        sentToAllNumber: Number,
        sentToWithPushTokenNumber: Number,
        sentToNoPushTokenNumber: Number,
        receivedBy: [],
        notReceivedBy: [],
        notReceivedNumber: Number,
        viewedBy: [],
        notViewedBy: [],
        viewedNumber: Number,
        notViewedNumber: Number,
        procedureDoneBy: [],
        notProcedureDoneBy: [],
        procedureDoneNumber: Number,
        notProcedureDoneNumber: Number,
        iNeedHelp: [],
        notWeAreSafe: [],
        weAreSafeNumber: Number,
        notWeAreSafeNumber: Number,
        weAreSafe: [],
        notINeedHelp: [],
        iNeedHelpNumber: Number,
        notINeedHelpNumber: Number
    };


    //How many users with pushToken, NoPushToken  Alert was sent
    alert.sentTo.forEach(function (user) {
        if(user.pushToken.length > 0)
            total.sentToWithPushToken.push(user);
        else
            total.sentToNoPushToken.push(user);
        total.sentToAll.push(user);
    });
    total.sentToAllNumber = total.sentToAll.length;
    total.sentToWithPushTokenNumber = total.sentToWithPushToken.length;
    total.sentToNoPushTokenNumber = total.sentToNoPushToken.length;
    //end of How many users with pushToken Alert was sent


    //How many users Received Alert
    alert.sentTo.forEach(function (user) {
        if( user.pushToken.length > 0){
            if(user.received.receivedBoolean)
                total.receivedBy.push(user);
            else
                total.notReceivedBy.push(user);
        }
    });
    total.receivedNumber = total.receivedBy.length;
    total.notReceivedNumber = total.sentToWithPushTokenNumber - total.receivedNumber;
    //end of How many users Received Alert

    //How many users Viewed Alert
    alert.sentTo.forEach(function (user) {
        if( user.pushToken.length > 0 && user.received.receivedBoolean) {
            if (user.viewed.viewedBoolean) {
                total.viewedBy.push(user);
            }

            else
                total.notViewedBy.push(user);
        }
    });
    total.viewedNumber = total.viewedBy.length;
    total.notViewedNumber = total.notViewedBy.length;
    //end of How many users Viewed Alert


    //How many users completed Procedure
    alert.sentTo.forEach(function (user) {
        if( user.pushToken.length > 0 && user.received.receivedBoolean && user.viewed.viewedBoolean) {
            if (user.procedureCompleted.boolean){
                total.procedureDoneBy.push(user);
            }
            else{
                total.notProcedureDoneBy.push(user);
            }
        }
    });
    total.procedureDoneNumber = total.procedureDoneBy.length;
    total.notProcedureDoneNumber = total.notProcedureDoneBy.length;
    //end of How many users completed Procedure


    //How many users WeAreSafe
    alert.sentTo.forEach(function (user) {
        if( user.pushToken.length > 0 && user.received.receivedBoolean && user.viewed.viewedBoolean) {
            if (user.weAreSafe.boolean)
                total.weAreSafe.push(user);
            else {
                total.notWeAreSafe.push(user);
            }
        }
    });
    total.weAreSafeNumber = total.weAreSafe.length;
    total.notWeAreSafeNumber = total.notWeAreSafe.length;
    //end of How many users WeAreSafe


    //How many users iNeedHelp
    alert.sentTo.forEach(function (user) {
        if( user.pushToken.length > 0 && user.received.receivedBoolean && user.viewed.viewedBoolean) {
            if(user.iNeedHelp.boolean)
                total.iNeedHelp.push(user);
            else{
                total.notINeedHelp.push(user);
            }
        }
    });
    total.iNeedHelpNumber = total.iNeedHelp.length;
    total.notINeedHelpNumber = total.notINeedHelp.length;
    console.log('total.iNeedHelpNumber = ',total.iNeedHelpNumber);
    console.log('total.iNeedHelp = ',total.iNeedHelp);

    //end of How many users iNeedHelp

    callback(total)
};