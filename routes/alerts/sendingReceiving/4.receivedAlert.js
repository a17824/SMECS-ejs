//Dependencies
var models = require('./../../models');
var async = require("async");
var reqAsst = require('./saveAlertFunc/2_3_4.reqAssistance.js');
var functions = require('./../../functions');
var moment = require('moment');
var pushNotification = require('./../sendingReceiving/pushNotification.js');
let reportsApi = require('./../../api/reports.js');
let reportsEJS = require('./../reports/reports.js');
let timeDifFunc = require('./../../api/reports.js');
let canReqAssFunc = require('./4.receivedAlert.js');

module.exports.receivedAlert = function(req, res) {

    async.parallel([
        function(callback){models.AlertSentInfo.findById(req.params.id).exec(callback);},
        function(callback){models.Building.find().exec(callback);},
        function(callback){models.Floors.find().exec(callback);},
        function(callback){models.Room.find().exec(callback);},
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
            console.log('RECEIVED ALERT NOT FOUND - ',err);
            res.redirect('/alerts/sending/chooseAlert');
        }
        else {
            reportsApi.receivedViewedAlert(req, results[0]); //mark alert as been received and viewed

            async.waterfall([
                function (callback) {
                    let canRequestAssistance = false;

                    models.Alerts.findOne({'alertID': results[0].alert.alertID}, function(err, alert){//check if Request Assistance is softDeleted
                        if(err || !alert) console.log("No Alert found");
                        else{
                            canReqAssFunc.canRequestAssistanceFunction(req, res, results[0], canRequestAssistance, function (result) {
                                canRequestAssistance = result;
                                let enableProcedureButton = false;
                                if(alert.alertProcedure)
                                    enableProcedureButton = true;

                                callback(null, canRequestAssistance, enableProcedureButton);
                            });
                        }
                    });
                }
            ], function (err, canRequestAssistance, enableProcedureButton) {

                let title = 'Received Alert';
                if(results[0].alert.alertID == 26)
                    title = 'Choose contact type(s) to Req. Assistance';

                let usersWithPushToken = [];
                results[0].sentTo.forEach(function (user) {
                    if(user.pushToken.length > 0)
                        usersWithPushToken.push(user);
                });

                reportsEJS.totalNumbers(results[0],function (result,err) {
                    if(err) console.log('totalNumbers err - ',);
                    else {
                        if(req.decoded){ //API user
                            res.json({
                                success: 'true',
                                userAuthRoleName: req.decoded.user.userRoleName,
                                userAuthEmail: req.decoded.user.email,
                                alertInfo: results[0],
                                building: results[1],
                                floor: results[2],
                                room: results[3],
                                utilities: results[4],
                                canRequestAssistance: canRequestAssistance,
                                enableProcedureButton: enableProcedureButton,
                                usersWithPushToken: usersWithPushToken,
                                total: result
                            });

                        }else{  //EJS user
                            res.render('alerts/receiving/received', {
                                title: title,
                                userAuthRoleName: req.user.userRoleName,
                                userAuthEmail: req.user.email,
                                info: results[0],
                                floor: results[2],
                                utilities: results[4],
                                canRequestAssistance: canRequestAssistance,
                                enableProcedureButton: enableProcedureButton,
                                aclSideMenu: results[5],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                                userAuthPhoto: req.user.photo,
                                total: result
                            });
                        }
                    }

                });


            });
        }
    })
};

module.exports.postReceivedAlert = function(req, res, next) {
    var alertToUpdate1 = req.body.alertToUpdate;
    var exitButton = req.body.exitButton;
    let redirectPage = req.body.redirectPage;


    models.AlertSentInfo.findById({'_id': alertToUpdate1}, function (err, alert) {
        if(err){
            console.log('err - changing Alert STATUS');
        }else {



            // ALERT 14 REQUEST ASSISTANCE
            if ((alert.alert.alertID == 14 || alert.alert.alertID == 26) && exitButton == 'false') {

                let reqAssOn = req.body.reqAssChecked;
                let reqAssOff = req.body.reqAssNotChecked;

                // API EJS ----------
                if (req.decoded) {       // API user
                    exitButton = 'false';
                    reqAssOn = reqAssOn.split(',');
                    reqAssOff = reqAssOff.split(',');
                }
                //-------------------


                models.Utilities.find({'utilityID': alert.multiSelectionIDs}, function (err, utils) {
                    if(err)
                        console.log('finding UtilityID 4receivedAlert.js err - ',err);
                    else{

                        //delete default contact for "reportDetails" page (this is after user has sent at least one request. It memorizes user options on radio buttons to req assistance
                        if(redirectPage !== '/alerts/received/receiveAlert/' + alert._id){
                            alert.requestAssistance.forEach(function (utility) {
                                utility.defaultContact = 'ask';
                            });
                        }
                        //console.log('utils = ',utils);
                        var arraySmecsAppToSent =[];
                        reqAsst.buildSmecsAppUsersArrToSendReqAss(alert, utils, reqAssOn, reqAssOff, arraySmecsAppToSent,'notify','dontUpdate',req,res);
                        res.send({redirect: redirectPage});
                    }
                });
            }else{
                // All ALERTS
                alert.save();
                if (req.decoded) {
                    res.json({success: true});
                } else
                    res.send({redirect: '/reports/homeReports/'});
            }
        }
    });
};


module.exports.procSafeHelp = function(req, res, next) {
    let alertToUpdate1 = req.body.alertToUpdate;
    let checkboxType = req.body.checkboxType;

    // API EJS ----------
    let userApiEjs;

    if (req.decoded) {      // API user
        userApiEjs = req.decoded.user.email;
    }
    else{
        userApiEjs = req.user.email; // EJS user.
    }
    //-------------------

    models.AlertSentInfo.findById({'_id': alertToUpdate1}, function (err, alert) {
        if(err){console.log('err - changing Alert STATUS');
        }else {
            alert.sentTo.forEach(function (user) {
                if (user.email == userApiEjs) {
                    updateProcedureCompletedWeAreSafe(alert, user, checkboxType, function (result, err) {
                        if(err || !result) console.log('updateProcedureCompletedWeAreSafe err = ',err);
                        else {
                            alert.save(function (err) {
                                if (err) console.log('err - ', err);
                                else {
                                    if(checkboxType === 'called911') {
                                        // needs to send push notification of user that called 911
                                    }
                                    if(checkboxType === 'iNeedHelp') {
                                        // needs to send push notification of user that needs help
                                    }

                                    /*****  CALL HERE NOTIFICATION API  *****/
                                    pushNotification.refreshAlertInfo(alert, 'refreshAlertInfo');



                                    if (req.decoded)
                                        res.json({success: true});
                                    console.log('save success');
                                }
                            });
                        }

                    });
                }
            });
        }
    });
};



module.exports.helpers = function(req, res) {
    let alertToUpdate1 = req.body.alertToUpdate;
    let whoNeedsHelp = req.body.whoNeedsHelp;
    console.log('whoNeedsHelp = ',whoNeedsHelp);
    let wrapped = moment(new Date());

    let userToHelpAuth;
    if(req.decoded)  //API
        userToHelpAuth = req.decoded.user;
    else
        userToHelpAuth = req.user;

    models.AlertSentInfo.findById({'_id': alertToUpdate1}, function (err, alert) {
        if (err || !alert) console.log('helper err - ', err);
        else {
            for (let i = 0; i < alert.sentTo.length; i++) {
                if (alert.sentTo[i].email === whoNeedsHelp) { //user that needs help
                    let helperDate = wrapped.format('YYYY-MM-DD');
                    let helperTime = wrapped.format('h:mm:ss a');

                    alert.sentTo.forEach(function (userToHelp) {

                        if(userToHelp.email === userToHelpAuth.email) {  //user that will help

                            //time user took to offer help
                            timeDifFunc.timeDif(userToHelp.viewed.viewedDate, userToHelp.viewed.viewedTime, helperDate, helperTime,function (result,err) {
                                if(err || !result) console.log('timeDif err = ',err);
                                else {
                                    let userToHelp = {
                                        firstName: userToHelpAuth.firstName,
                                        lastName: userToHelpAuth.lastName,
                                        pushToken: userToHelpAuth.pushToken,
                                        email: userToHelpAuth.email,
                                        photo: userToHelpAuth.photo,
                                        date: helperDate,
                                        time: helperTime,
                                        timeDif: result
                                    };
                                    alert.sentTo[i].iNeedHelp.helpers.push(userToHelp);
                                    alert.save();
                                    /*****  CALL HERE NOTIFICATION API  *****/
                                    pushNotification.refreshAlertInfo(alert, 'refreshAlertInfo');

                                    if(req.decoded) {   //API
                                        res.json({
                                            success: true
                                        });
                                    }
                                    else {
                                        return res.send({redirect:'/reports/showReportsDetails/' + alertToUpdate1 + '/helpersPage'});
                                    }
                                }
                            });
                        }
                    });
                    break
                }
            }
        }

    })
};


function updateProcedureCompletedWeAreSafe(alert, user, requestType, callback) {
    let wrapped = moment(new Date());

    if(!user[requestType].boolean){
        user[requestType].boolean = true;
        user[requestType].date = wrapped.format('YYYY-MM-DD');
        user[requestType].time = wrapped.format('h:mm:ss a');

        //time user took to complete procedure or WeAreSafe or iNeedHelp after viewing alert

        timeDifFunc.timeDif(user.viewed.viewedDate, user.viewed.viewedTime, user[requestType].date, user[requestType].time,function (result,err) {
            if(err || !result) console.log('timeDif err = ',err);
            else {
                user[requestType].timeDif = result;
            }
        });

    }else {
        user[requestType].boolean = false;
        user[requestType].date = undefined;
        user[requestType].time = undefined;
        user[requestType].timeDif = undefined;
        if(requestType === 'iNeedHelp')
            user[requestType].helpers = undefined;
    }
    console.log('success - ' + requestType + ' for ' + user.firstName + ' ' + user.lastName + ' status changed to ' + user[requestType].boolean);
    callback('done');
}


module.exports.canRequestAssistanceFunction= function(req, res, alert, canRequestAssistance, callback) {
    if(alert.alert.alertID == 14 || alert.alert.alertID == 26) {
        models.Alerts.findOne({'alertID': 26}, function (err, alert26) {
            if (err || !alert26) console.log("No alert26 found");
            else {

                if (alert26.softDeleted == false) {//check if Request Assistance is not softDeleted

                    // API EJS ----------
                    let userApiEjs;
                    if (req.decoded)        // API user
                        userApiEjs = req.decoded.user.userRoleID;
                    else
                        userApiEjs = req.user.userRoleID; // EJS user
                    //-------------------

                    //check if user as rights to Request Assistance for Real Alerts and Test Alerts ---------
                    if (alert.realDrillDemo == 'real') {
                        let role = alert26.whoCanSendReceive.sendReal;
                        userApiEjs.forEach(function (userAuthRole) {
                            for (let t = 0; t < role.length; t++) {
                                if (userAuthRole == role[t].roleID && role[t].checkbox == true) {
                                    canRequestAssistance = true;
                                    break;
                                }
                            }
                        })
                    }
                    if (alert.realDrillDemo == 'drill') {
                        let role = alert26.whoCanSendReceive.sendDrill;
                        userApiEjs.forEach(function (userAuthRole) {
                            for (let t = 0; t < role.length; t++) {
                                if (userAuthRole == role[t].roleID && role[t].checkbox == true) {
                                    canRequestAssistance = true;
                                    break;
                                }
                            }
                        })
                    }
                    //----------- end of check if user as rights to Request Assistance for Real Alerts and Test Alerts
                }
            }
            callback(canRequestAssistance)
        });
    }
    else {
        callback(canRequestAssistance)
    }

};