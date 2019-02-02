//Dependencies
var moment = require('moment');
var reqAsst = require('./2_3_4.reqAssistance.js');
var models = require('./../../../models');
let whoReceiveAlert = require('./../saveAlertFunc/1b.createRolesUsersScope.js');
let pushNotification = require('./../pushNotification.js');

module.exports.buildSmecsAppUsersArrToSendReqAss = function(alert, utils, reqAssOn, reqAssOff, arraySmecsAppToSent, actionNotification, updateTime,req,res) {

    function usersScopeToSendAlert(callback) {
        var array = [];
        utils.forEach(function (utility,idx, arr) {
            models.Users.find({email: utility.smecsUsers, pushToken: { "$exists": true }}, function (err, users) {
                if(err || !users)
                    console.log('No users to send Req Asst alert. err - ',err);
                else {
                    users.forEach(function (user) {
                        var userWithPushToken = {
                            utilityID: utility.utilityID,
                            utilityName: utility.utilityName,
                            userEmail: user.email,
                            userPushToken: user.pushToken
                        };
                        array.push(userWithPushToken);
                    });
                    if (idx === arr.length - 1) { //If last forEach loop, then does the callback
                        callback(array);
                    }
                }
            });
        });
    }
    usersScopeToSendAlert (function (result, err) {
                if(err){
                    console.log('err = ', err);
                }else {
                    console.log('result');
                    console.log(result);
                    console.log('***********');
                    console.log('arraySmecsAppToSent');
                    console.log(arraySmecsAppToSent);
                    arraySmecsAppToSent = arraySmecsAppToSent.concat(result);
                    console.log('------------');
                    console.log(arraySmecsAppToSent);
                    alert.sentSmecsAppUsersScope = arraySmecsAppToSent;
                    var boolTrue = true;
                    var boolFalse = false;
                    reqAsst.saveRequestAssistance(alert, reqAssOn, boolTrue, actionNotification, updateTime, req,res);
                    reqAsst.saveRequestAssistance(alert, reqAssOff, boolFalse, actionNotification, updateTime, req,res);
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
                    console.log('alertTemp1 _id = ',alertTemp1._id);

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
                                    sentTo: sentTo,
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
                                    floorPhoto: alert._id + '_' + alert.floorPhoto,
                                    sniperCoordinateX: alert.sniperCoordinateX,
                                    sniperCoordinateY: alert.sniperCoordinateY,
                                    multiSelectionNames: alert.multiSelectionNames,
                                    multiSelectionIDs: alert.multiSelectionIDs,
                                    requestAssistance: alert.requestAssistance,
                                    sentSmecsAppUsersScope: alert.sentSmecsAppUsersScope,
                                    latitude: alert.latitude,
                                    longitude: alert.longitude,
                                    alertRoad: alertTemp1.alertRoad
                                });
                                alert1.save(function(err, resp) {
                                    if (err) {
                                        console.log('err = ',err);

                                    } else {
                                        //send pushNotification
                                        pushNotification.alert(alert1, 'newAlert', userAuthEmail);
                                                /********************************
                                                 * NOTIFICATION API HERE        *
                                                 * scope to sent is:            *
                                                 * sentSmecsAppUsersScope *
                                                 ********************************/
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