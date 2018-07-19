//Dependencies
var models = require('./../../models');
var async = require("async");
var reqAsst = require('./saveAlertFunc/2_3_4.reqAssistance.js');
var functions = require('./../../functions');
var moment = require('moment');
var pushNotification = require('./../sendingReceiving/pushNotification.js');

module.exports.receivedAlert = function(req, res) {

    async.parallel([
        function(callback){models.AlertSentInfo.findById(req.params.id).exec(callback);},
        function(callback){models.Floors.find().exec(callback);},
        function(callback){models.Utilities.find().exec(callback);},

        function(callback) {
            if(req.decoded) { //API user
                models.Users.findOne({'email': req.decoded.user.email}).exec(callback);
            }else{  //EJS user
                functions.aclSideMenu(req, res, function (acl) {callback(null, acl);}); //aclPermissions sideMenu
            }
        }

    ],function(err, results){
        if (!results[0]) {
            console.log(err);
            console.log('RECEIVED ALERT NOT FOUND');
            res.redirect('/alerts/sending/chooseAlert');
        }
        else {
            async.waterfall([
                function (callback) {
                    var canRequestAssistance = false;
                    models.Alerts.findOne({'alertID': results[0].alert.alertID}, function(err, alert){//check if Request Assistance is softDeleted
                        if( err ) console.log("No Utility found");
                        else{
                            if(results[0].alert.alertID == 14 ||
                                results[0].alert.alertID == 26){
                                if(alert.softDeleted == false){

                                    // API EJS ----------
                                    var userApiEjs;
                                    if (req.decoded)        // API user
                                        userApiEjs = req.decoded.user.userRoleID;
                                    else
                                        userApiEjs = req.user.userRoleID; // EJS user
                                    //-------------------

                                    //check if user as rights to Request Assistance for Real Alerts and Test Alerts ---------
                                    if(results[0].testModeON){
                                        var role = alert.whoCanSendReceive.receiveDrill;
                                        userApiEjs.forEach(function (userAuthRole) {
                                            for (var t = 0; t < role.length; t++) {
                                                if(userAuthRole == role[t].roleID && role[t].checkbox == true){
                                                    canRequestAssistance = true;
                                                    break;
                                                }
                                            }
                                        })
                                    }else{
                                        var role = alert.whoCanSendReceive.receiveReal;
                                        userApiEjs.forEach(function (userAuthRole) {
                                            for (var t = 0; t < role.length; t++) {
                                                if(userAuthRole == role[t].roleID && role[t].checkbox == true){
                                                    canRequestAssistance = true;
                                                    break;
                                                }
                                            }
                                        })

                                    }
                                    //----------- end of check if user as rights to Request Assistance for Real Alerts and Test Alerts

                                }
                            }
                            var enableProcedureButton = false;

                            if(alert.alertProcedure)
                                enableProcedureButton = true;

                            callback(null, canRequestAssistance, enableProcedureButton);
                        }
                    });
                }
            ], function (err, canRequestAssistance, enableProcedureButton) {

                if(req.decoded){ //API user
                    res.json({
                        success: 'true',
                        userAuthRoleName: req.decoded.user.userRoleName,
                        userAuthEmail: req.decoded.user.email,
                        alertInfo: results[0],
                        floor: results[1],
                        utilities: results[2],
                        canRequestAssistance: canRequestAssistance,
                        enableProcedureButton: enableProcedureButton
                    });

                }else{  //EJS user
                    res.render('alerts/receiving/received', {
                        title: 'Received Alert',
                        userAuthRoleName: req.user.userRoleName,
                        userAuthEmail: req.user.email,
                        info: results[0],
                        floor: results[1],
                        utilities: results[2],
                        canRequestAssistance: canRequestAssistance,
                        enableProcedureButton: enableProcedureButton,
                        aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                        userAuthName: req.user.firstName + ' ' + req.user.lastName,
                        userAuthPhoto: req.user.photo
                    });
                }
            });
        }
    })
};

module.exports.postReceivedAlert = function(req, res, next) {
    var alertToUpdate1 = req.body.alertToUpdate;
    var exitButton = req.body.exitButton;
    var procedureCompleted = req.body.procedureCompleted;
    var weAreSafe = req.body.weAreSafe;
    var iNeedHelp = req.body.needHelp;




    models.AlertSentInfo.findById({'_id': alertToUpdate1}, function (err, alert) {
        if(err){
            console.log('err - changing Alert STATUS');
        }else {

            // API EJS ----------
            var userApiEjs;
            if (req.decoded) {      // API user
                userApiEjs = req.decoded.user.email;
                exitButton = 'false';
            }
            else
                userApiEjs = req.user.email; // EJS user
            //-------------------

            // All ALERTS
            if(alert.requestProcedureCompleted){
                alert.sentTo.forEach(function (user) {
                    if (user.email == userApiEjs && user.procedureCompleted.boolean.toString() !== procedureCompleted.toString()) {
                        updateProcedureCompletedWeAreSafe(alert, user, 'procedureCompleted');
                    }
                });
            }
            // All ALERTS
            if(alert.requestWeAreSafe){
                alert.sentTo.forEach(function (user) {
                    if (user.email == userApiEjs && user.weAreSafe.boolean.toString() !== weAreSafe.toString()) {
                        updateProcedureCompletedWeAreSafe(alert, user, 'weAreSafe');
                    }
                });
            }
            // All ALERTS
            if(alert.requestINeedHelp){
                alert.sentTo.forEach(function (user) {
                    if (user.email == userApiEjs && user.iNeedHelp.boolean.toString() !== iNeedHelp.toString()) {
                        updateProcedureCompletedWeAreSafe(alert, user, 'iNeedHelp');
                    }
                });
            }

            // ALERT 14 REQUEST ASSISTANCE
            if ((alert.alert.alertID == 14 || alert.alert.alertID == 26) && exitButton == 'false') {
                var reqAssOn = req.body.reqAssChecked;
                var reqAssOff = req.body.reqAssNotChecked;

                // API EJS ----------
                var userApiEjs;
                if (req.decoded) {       // API user
                    exitButton = 'false';
                    reqAssOn = reqAssOn.split(',');
                    reqAssOff = reqAssOff.split(',');
                }
                //-------------------

                models.Utilities.find({'utilityID': alert.multiSelectionIDs}, function (err, utils) {
                    if(err)
                        console.log('err - ',err);
                    else{
                        var arraySmecsAppToSent =[];
                        reqAsst.buildSmecsAppUsersArrToSendReqAss(alert, utils, reqAssOn, reqAssOff, arraySmecsAppToSent,'notify','dontUpdate');
                        res.send({redirect: '/alerts/received/receiveAlert/' + alertToUpdate1});
                    }
                });
            }else{
                // All ALERTS
                alert.save();
                if (req.decoded) {
                    res.json({success: true});
                } else
                    res.send({redirect: '/alerts/sending/chooseAlert/'});
            }
        }
    });
};

function updateProcedureCompletedWeAreSafe(alert, user, requestType) {
    var wrapped = moment(new Date());

    if(!user[requestType].boolean){
        user[requestType].boolean = true;
        user[requestType].date = wrapped.format('YYYY-MM-DD');
        user[requestType].time = wrapped.format('h:mm:ss a');
    }else {
        user[requestType].boolean = false;
        user[requestType].date = undefined;
        user[requestType].time = undefined;
    }
    console.log('success - ' + requestType + ' for ' + user.firstName + ' ' + user.lastName + ' status changed to ' + user[requestType].boolean);


    /*****  CALL HERE NOTIFICATION API  *****/
    //if user has permission to see who completed procedure or we aresafe
    pushNotification.alert(alert, 'updateAlert'); //change closeAlert function? does it need new function?

}