//Dependencies
var moment = require('moment');
var reqAsst = require('./2_3_4.reqAssistance.js');
var models = require('./../../../models');


module.exports.buildSmecsAppUsersArrToSendReqAss = function(alert, utils, reqAssOn, reqAssOff, arraySmecsAppToSent, actionNotification, updateTime) {

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
                            userFirstName: user.firstName,
                            userLastName: user.lastName,
                            userEmail: user.email,
                            userPushToken: user.pushToken,
                            userPhoto: user.photo
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
                    reqAsst.saveRequestAssistance(alert, reqAssOn, boolTrue, actionNotification, updateTime);
                    reqAsst.saveRequestAssistance(alert, reqAssOff, boolFalse, actionNotification, updateTime);
                    alert.save(function (err) {
                        if(err)
                            console.log('err - ', err)

                    })
                }
            });
};


module.exports.saveRequestAssistance = function(alert, reqAss, boolTrueFalse, actionNotification, updateTime) {
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
                                reqAsst.sendPushNotificationReqAssSmecsApp(alert, alert.requestAssistance[x]);
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
                                reqAsst.sendPushNotificationReqAssEmail(alert, alert.requestAssistance[x]);
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





module.exports.sendPushNotificationReqAssSmecsApp = function(alert, utility) {

    models.Alerts.findOne({'alertID': 26}, function (err, alertRequestAsst) {
        if(err || !alertRequestAsst)
            console.log('alert not found. Err 2 - ',err);
        else {
            console.log('alert yyyyyyyyyyyyyyyyy');
            console.log(alert);
            /*
            let alertTemp1 = new models.AlertSentTemp({
                alertGroupID: alertRequestAsst.group.groupID,
                alertGroupName: alertRequestAsst.group.name,
                groupSound: alertRequestAsst.group.mp3,
                groupIcon: alertRequestAsst.group.icon,
                groupColorBk: alertRequestAsst.group.color.bgValue,
                groupColorTx: alertRequestAsst.group.color.textValue,
                alertNameID: alertRequestAsst.alertID,
                alertName: alertRequestAsst.alertName,
                realDrillDemo: alert.realDrillDemo,
                requestProcedureCompleted: alert[0].alertRequestProcedureCompleted,
                requestWeAreSafe: alert[0].alertRequestWeAreSafe,
                requestINeedHelp: alert[0].alertRequestForINeedHelp,
                request911Call: alert[0].alertRequest911Call,
                whoCanCall911: alert[0].whoCanCall911,
                alertIcon: alert[0].icon,
                placeholderNote: placeholderNote,
                placeholderMissingChildLastPlaceSeen: placeholderMissingChildLastPlaceSeen,
                placeholderMissingChildClothesWearing: placeholderMissingChildClothesWearing,
                placeholderStudentWithGunSeated: placeholderStudentWithGunSeated,
                placeholderStudentWithGunBehaviour: placeholderStudentWithGunBehaviour,
                placeholderEvacuateWhereTo: placeholderEvacuateWhereTo,
                alertRoad: alert[0].alertRoad,
                roadIndex: 1

            });
            alertTemp1.save(function(err, resp) {
                if (err) {
                    console.log('err = ',err);
                    if (rec.decoded)
                        res.json({
                            success: false,
                            message: 'Something went wrong, please try again. If this problem persists please contact SMECS tech support team.'
                        })
                } else {
                    callback(null, alertTemp1, alert);
                }
            });
            */
        }

    });


    alert.sentSmecsAppUsersScope.forEach(function (user) {
        console.log(alert.alert.name + ' -> ' + user.utilityName + ' - > Request SMECS APP sent' );
    });
    /********************************
     * NOTIFICATION API HERE        *
     * scope to sent is:            *
     * sentSmecsAppUsersScope *
     ********************************/
};
module.exports.sendPushNotificationReqAssEmail = function(alert, utility) {
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