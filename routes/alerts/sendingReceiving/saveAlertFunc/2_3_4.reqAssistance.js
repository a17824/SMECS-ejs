//Dependencies
var moment = require('moment');
var reqAsst = require('./2_3_4.reqAssistance.js');
var models = require('./../../../models');
let whoReceiveAlert = require('./../saveAlertFunc/1b.createRolesUsersScope.js');
let pushNotification = require('./../pushNotification.js');

module.exports.buildSmecsAppUsersArrToSendReqAss = function(alert, utils, reqAssOn, reqAssOff, arraySmecsAppToSent, actionNotification, updateTime,req,res) {

    function usersScopeToSendAlert(callback) {
        let array = [];
        let flagLength = 0;
        console.log('utils.length = ',utils.length);
        for(let i = 0; i < utils.length; i++) {
            console.log('first i = ', i);
            //console.log('1 flagLength = ', flagLength);
            models.Users.find({email: utils[i].smecsUsers, pushToken: {"$exists": true}}, function (err, users) {
                console.log('second i = ', i);
                if (err || !users) {
                    console.log('No users to send Req Asst SMECS APP alert. err - ', err);
                    callback(array);
                }

                else {
                    //console.log('users = ', users);
                    users.forEach(function (user) {
                        let userWithPushToken = {
                            utilityID: utils[i].utilityID,
                            utilityName: utils[i].utilityName,
                            userEmail: user.email,
                            userPushToken: user.pushToken
                        };
                        array.push(userWithPushToken);
                    });
                    flagLength++;
                    //console.log('2 flagLength = ', flagLength);
                    console.log('outside i = ', i);
                    if (i == utils.length - 1) { //If last forEach loop, then does the callback
                        //if (idx === arr.length - 1) { //If last forEach loop, then does the callback
                        console.log('LAST LOOP LAST LOOP');
                        //console.log('inside i = ', i);
                    }
                    if (flagLength == utils.length) { //If last forEach loop, then does the callback
                        //if (idx === arr.length - 1) { //If last forEach loop, then does the callback
                        console.log('LAST LOOP flagLength');
                        //console.log('inside i = ', i);
                        //console.log('array = ', array);
                        callback(array);
                    }
                }
            })
        }
        /*
        utils.forEach(function (utility,idx, arr) {
            models.Users.find({email: utility.smecsUsers, pushToken: {"$exists": true}}, function (err, users) {
                if (err || !users) {
                    console.log('No users to send Req Asst SMECS APP alert. err - ', err);
                    callback(array);
                }

                else {
                    console.log('users = ', users);
                    users.forEach(function (user) {
                        let userWithPushToken = {
                            utilityID: utility.utilityID,
                            utilityName: utility.utilityName,
                            userEmail: user.email,
                            userPushToken: user.pushToken
                        };
                        array.push(userWithPushToken);
                    });

                    if (idx === arr.length - 1) { //If last forEach loop, then does the callback
                        console.log('LAST LOOP LAST LOOP');
                        console.log('array = ', array);
                        callback(array);
                    }
                }
            });
        });
        */
    }
    console.log('CALL');
    usersScopeToSendAlert (function (result, err) {
        if(err){
            console.log('err = ', err);
        }else {
            //console.log('utils = ',utils);
            //console.log('result = ',result);
            //console.log('before arraySmecsAppToSent = ',arraySmecsAppToSent);

            arraySmecsAppToSent = arraySmecsAppToSent.concat(result);

            //console.log('after arraySmecsAppToSent = ',arraySmecsAppToSent);
            alert.sentSmecsAppUsersScope = arraySmecsAppToSent;
            let boolTrue = true;
            //var boolFalse = false;
            reqAsst.saveRequestAssistance(alert, reqAssOn, boolTrue, actionNotification, updateTime, req,res);
            //reqAsst.saveRequestAssistance(alert, reqAssOff, boolFalse, actionNotification, updateTime, req,res);
            alert.save(function (err) {
                if(err)
                    console.log('err - ', err)

            })
        }
    });
};


module.exports.saveRequestAssistance = function(alert, reqAss, boolTrueFalse, actionNotification, updateTime, req,res) {
    var arr;
    var arrOn = [];
    var wrapped = moment(new Date());

    if(typeof reqAss !== 'undefined' && reqAss){
        reqAss.forEach(function (utility) {
            arr = utility.split("_|_").map(function (val) {
                return val
            });
            arrOn.push(arr);
        });

        arrOn.forEach(function (util) {
            for (var x = 0; x < alert.requestAssistance.length; x++) {
                if (util[1] == alert.requestAssistance[x].utilityName) {
                    if (util[2] == 'smecsApp') {
                        alert.requestAssistance[x].reqSmecsApp.sentReqSmecsApp = boolTrueFalse;
                        if(actionNotification == 'notify' && alert.requestAssistance[x].reqSmecsApp.stat == 'open'){
                            if(updateTime == 'update')
                                alert.requestAssistance[x].reqSmecsApp.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                        }
                        if (typeof alert.requestAssistance[x].reqSmecsApp.stat == 'undefined' && boolTrueFalse == true) {
                            alert.requestAssistance[x].reqSmecsApp.stat = 'open';
                            alert.requestAssistance[x].reqSmecsApp.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                            if(actionNotification == 'notify')
                                reqAsst.sendPushNotificationReqAssSmecsApp(alert, alert.requestAssistance[x], req,res);
                        }
                    }

                    if (util[2] == 'email') {
                        alert.requestAssistance[x].reqEmail.sentReqEmail = boolTrueFalse;
                        if(actionNotification == 'notify' && alert.requestAssistance[x].reqEmail.stat == 'open'){
                            if(updateTime == 'update')
                                alert.requestAssistance[x].reqEmail.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                        }
                        if (typeof alert.requestAssistance[x].reqEmail.stat == 'undefined' && boolTrueFalse == true) {
                            alert.requestAssistance[x].reqEmail.stat = 'open';
                            alert.requestAssistance[x].reqEmail.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                            if(actionNotification == 'notify')
                                reqAsst.sendPushNotificationReqAssEmail(alert, alert.requestAssistance[x], req);
                        }
                    }
                    if (util[2] == 'call') {
                        alert.requestAssistance[x].reqCall.sentReqCall = boolTrueFalse;
                        if(actionNotification == 'notify' && alert.requestAssistance[x].reqCall.stat == 'open'){
                            if(updateTime == 'update')
                                alert.requestAssistance[x].reqCall.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                        }
                        if (typeof alert.requestAssistance[x].reqCall.stat == 'undefined' && boolTrueFalse == true) {
                            alert.requestAssistance[x].reqCall.stat = 'open';
                            alert.requestAssistance[x].reqCall.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                            if(actionNotification == 'notify')
                                reqAsst.sendPushNotificationReqAssCall(alert, alert.requestAssistance[x]);
                        }
                    }
                    break;
                }
            }
        });
    }
};




//REQUEST ASSISTANCE auto
module.exports.sendPushNotificationReqAssSmecsApp = function(alert, utility, req,res) {

    let requestedAssistanceSMECSUtility = [];   //to create new requested alert SMECS req with only the chosen utility
    requestedAssistanceSMECSUtility.push(utility);

    let newSentSmecsAppUsersScope = [];//to create new sentSmecsAppUsersScope with only the chosen utility
    alert.sentSmecsAppUsersScope.forEach(function (util) {
        if (utility.utilityID == util.utilityID)
            newSentSmecsAppUsersScope.push(util);
    });

    models.Alerts.findOne({'alertID': 26}, function (err, alertRequestAsst) {
        if(err || !alertRequestAsst)
            console.log('alert not found. Err 2 - ',err);
        else {
            //build automatically request assistance alert
            let alertTemp1 = new models.AlertSentTemp({
                alertGroupID: alertRequestAsst.group.groupID,
                alertGroupName: alertRequestAsst.group.name,
                groupSound: alertRequestAsst.group.mp3,
                groupIcon: alertRequestAsst.group.icon,
                groupColorBk: alertRequestAsst.group.color.bgValue,
                groupColorTx: alertRequestAsst.group.textValue,
                alertNameID: alertRequestAsst.alertID,
                alertName: alertRequestAsst.alertName,
                requestProcedureCompleted: alertRequestAsst.alertRequestProcedureCompleted,
                requestWeAreSafe: alertRequestAsst.alertRequestWeAreSafe,
                requestINeedHelp: alertRequestAsst.alertRequestForINeedHelp,
                request911Call: alertRequestAsst.alertRequest911Call,
                whoCanCall911: alertRequestAsst.whoCanCall911,
                alertIcon: alertRequestAsst.icon,
                alertRoad: alertRequestAsst.alertRoad,
                alertWith: {
                    reqAssistance: true,
                    multiUtilities: true,
                    multiSelection: true,
                    floor: true,
                    notes: true,
                    htmlTags: {
                        labelFloor: "Lcation",
                        showHideDiv: "showThis"
                    }
                },
                realDrillDemo: alert.realDrillDemo,
                alertSent: true

            });
            alertTemp1.save(function(err) {
                if (err) {
                    console.log('err = ',err);
                    if (req.decoded)
                        res.json({
                            success: false,
                            message: 'Something went wrong, please try again. If this problem persists please contact SMECS tech support team.'
                        })
                } else {
                    console.log('AUTO alert temp successfully created');

                    whoReceiveAlert.getUsersToReceiveAlert(req, res, alertTemp1, function (result,err) { //get internal users that can receive request assistance alert
                        if(err){
                            console.log('err = ', err);
                        }else {
                            let alertTemp1 = result;
                            if(alertTemp1.sentRoleIDScope < 1){
                                console.log('No scopes or users to send this alert');
                            }
                            else {
                                //GET USERS

                                //local users
                                let sentTo = [];
                                alertTemp1.sentTo.forEach(function (user) {
                                    let internalUsers = {
                                        email: user.email,
                                        pushToken: user.pushToken
                                    };
                                    sentTo.push(internalUsers);
                                });

                                //external users
                                alert.sentSmecsAppUsersScope.forEach(function (user) {
                                    if(user.utilityName === utility.utilityName){
                                        console.log(alert.alert.name + ' -> ' + user.utilityName + ' - > ' + user.userEmail + ' - >Request SMECS APP sent' );
                                        let externalUsers = {
                                            email: user.userEmail,
                                            pushToken: user.userPushToken
                                        };
                                        sentTo.push(externalUsers);
                                    }
                                });
                                //end of Get Users

                                //get user that will request assistance
                                let wrapped = moment(new Date());
                                let sentByApiEjs, userAuthEmail;
                                if (req.decoded) {       // API user
                                    sentByApiEjs = req.decoded.user.firstName + " " + req.decoded.user.lastName;
                                    userAuthEmail = req.decoded.user.email;
                                }else {
                                    sentByApiEjs = req.session.user.firstName + " " + req.session.user.lastName;
                                    userAuthEmail = req.user.email;
                                }
                                //end of get user that will request assistance

                                let alert1 = new models.AlertSentInfo({
                                    group: {
                                        groupID: alertRequestAsst.group.groupID,
                                        name: alertRequestAsst.group.name,
                                        sound: alertRequestAsst.group.mp3,
                                        icon: alertRequestAsst.group.icon,
                                        color: {
                                            bgValue: alertRequestAsst.group.color.bgValue,
                                            textValue: alertRequestAsst.group.textValue
                                        }
                                    },
                                    alert: {
                                        alertID: alertRequestAsst.alertID,
                                        name: alertRequestAsst.alertName,
                                        icon: alertRequestAsst.icon
                                    },
                                    sentBy: sentByApiEjs,
                                    sentDate: wrapped.format('YYYY-MM-DD'),
                                    sentTime: wrapped.format('h:mm:ss a'),
                                    sentRoleIDScope: alertTemp1.sentRoleIDScope,
                                    sentRoleNameScope: alertTemp1.sentRoleNameScope,
                                    //sentTo: sentTo,
                                    requestProcedureCompleted: alertTemp1.requestProcedureCompleted,
                                    requestWeAreSafe: alertTemp1.requestWeAreSafe,
                                    requestINeedHelp: alertTemp1.requestINeedHelp,
                                    request911Call: alertTemp1.request911Call,
                                    whoCanCall911: alertTemp1.whoCanCall911,
                                    realDrillDemo: alertTemp1.realDrillDemo,
                                    note: alert.note,
                                    buildingID: alert.buildingID,
                                    buildingName: alert.buildingName,
                                    floorID: alert.floorID,
                                    floorName: alert.floorName,
                                    floorPhoto: alert.floorPhoto,
                                    sniperCoordinateX: alert.sniperCoordinateX,
                                    sniperCoordinateY: alert.sniperCoordinateY,
                                    multiSelectionNames: alert.multiSelectionNames,
                                    multiSelectionIDs: alert.multiSelectionIDs,
                                    requestAssistance: requestedAssistanceSMECSUtility,
                                    sentSmecsAppUsersScope: newSentSmecsAppUsersScope,
                                    latitude: alert.latitude,
                                    longitude: alert.longitude,
                                    alertRoad: alertTemp1.alertRoad,
                                    alertWith: alertTemp1.alertWith,
                                    autoAlert: true,
                                    parent: alert._id,

                                    /*
                                    //Auto close alert to not show in reportDetails
                                    status: {
                                        statusString: 'closed',
                                        statusClosedDate: wrapped.format('YYYY-MM-DD'),
                                        statusClosedTime: wrapped.format('h:mm:ss a')
                                    },
                                    archived: false,
                                    softDeletedBy: req.session.user.firstName + " " + req.session.user.lastName,
                                    softDeletedDate: wrapped.format('YYYY-MM-DD'),
                                    softDeletedTime: wrapped.format('h:mm:ss'),
                                    expirationDate: new Date(Date.now() + ( 30 * 24 * 3600 * 1000)), //( 'days' * 24 * 3600 * 1000) milliseconds
                                    //end of Auto close alert to not show in reportDetails
                                    */

                                });
                                alert1.save(function(err, resp) {
                                    if (err) {
                                        console.log('err = ',err);

                                    } else {
                                        /********************************
                                         * NOTIFICATION API HERE        *
                                         * scope to sent is:            *
                                         * sentSmecsAppUsersScope *
                                         ********************************/

                                        pushNotification.alert(alert1, 'newAlert', userAuthEmail, function (result2,err2) {
                                            if (err2 || !result2) console.log('sending updateAlert. err - ', err2);
                                            else {

                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });
};
module.exports.sendPushNotificationReqAssEmail = function(alert, utility, req) {
    console.log(alert.alert.name + ' -> ' + utility.utilityName + ' - > Request EMAIL sent');
    /********************************
     * NOTIFICATION API HERE        *
     * scope to sent is:            *
     * requestAssistance *
     ********************************/
};
module.exports.sendPushNotificationReqAssCall = function(alert, utility) {
    console.log(alert.alert.name + ' -> ' + utility.utilityName + ' - > Request CALL sent');
    /*************************
     * NOTIFICATION API HERE *
     *************************/
};