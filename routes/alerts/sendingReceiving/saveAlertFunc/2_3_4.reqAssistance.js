//Dependencies
var moment = require('moment');
var reqAsst = require('./2_3_4.reqAssistance.js');
var models = require('./../../../models');
let whoReceiveAlert = require('./../saveAlertFunc/1b.createRolesUsersScope.js');


module.exports.buildSmecsAppUsersArrToSendReqAss = function(alert, utils, reqAssOn, reqAssOff, arraySmecsAppToSent, actionNotification, updateTime,req,res) {

    function usersScopeToSendAlert(callback) {
        var array = [];
        utils.forEach(function (utility,idx, arr) {
            models.Users.find({email: utility.smecsUsers, pushToken: { "$exists": true }}, function (err, users) {
                if(err)
                    console.log('err - ',err);
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
                    arraySmecsAppToSent = arraySmecsAppToSent.concat(result);
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





module.exports.sendPushNotificationReqAssSmecsApp = function(alert, utility, req,res) {
    console.log('*****************************');
    alert.sentSmecsAppUsersScope.forEach(function (user) { //external users
        console.log('user = ',user);
        console.log(alert.alert.name + ' -> ' + user.utilityName + ' - > Request SMECS APP sent' );
    });
    /********************************
     * NOTIFICATION API HERE        *
     * scope to sent is:            *
     * sentSmecsAppUsersScope *
     ********************************/

    models.Alerts.findOne({'alertID': 26}, function (err, alertRequestAsst) {
        if(err || !alertRequestAsst)
            console.log('alert not found. Err 2 - ',err);
        else {
            //build automatically request assintance alert
            let alertTemp1 = new models.AlertSentTemp({
                alertGroupID: alertRequestAsst.group.groupID,
                alertGroupName: alertRequestAsst.group.name,
                groupSound: alertRequestAsst.group.mp3,
                groupIcon: alertRequestAsst.group.icon,
                groupColorBk: alertRequestAsst.group.color.bgValue,
                groupColorTx: alertRequestAsst.group.textValue,
                alertNameID: alertRequestAsst.alertID,
                alertName: alertRequestAsst.alertName,
                realDrillDemo: alert.realDrillDemo,
                requestProcedureCompleted: alertRequestAsst.alertRequestProcedureCompleted,
                requestWeAreSafe: alertRequestAsst.alertRequestWeAreSafe,
                requestINeedHelp: alertRequestAsst.alertRequestForINeedHelp,
                request911Call: alertRequestAsst.alertRequest911Call,
                whoCanCall911: alertRequestAsst.whoCanCall911,
                alertIcon: alertRequestAsst.icon,
                alertRoad: alertRequestAsst.alertRoad

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
                }
            });
/*
            let sentTo = [];
            alert.sentTo.forEach(function (user) { //local users
                let sentToArr = {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    pushToken: user.pushToken
                };
                sentTo.push(sentToArr);
            });
            alert.sentSmecsAppUsersScope.forEach(function (user) { //external users
                console.log('user = ',user);
                console.log(alert.alert.name + ' -> ' + user.utilityName + ' - > Request SMECS APP sent' );
                let sentToArr = {
                    email: user.email,
                    pushToken: user.pushToken
                };
                sentTo.push(sentToArr);
            });

            let wrapped = moment(new Date());
            let sentByApiEjs; //get user that will request assistance
            if (req.decoded)        // API user
                sentByApiEjs = req.decoded.user.firstName + " " + req.decoded.user.lastName;
            else
                sentByApiEjs = req.session.user.firstName + " " + req.session.user.lastName;
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

            });



            alert1.save(function(err, resp) {
                if (err) {
                    console.log('err = ',err);

                } else {
                    //send pushNotification

                }
            });

            whoReceiveAlert.getUsersToReceiveAlert(req, res, alert1, function (result,err) { //get school users that can receive request assistance alert
                if(err){
                    console.log('err = ', err);
                }else {
                    let alert2 = result;
                    if(alert2.sentRoleIDScope < 1){
                        console.log('No scopes or users to send this alert');
                    }


                }
            });

*/

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