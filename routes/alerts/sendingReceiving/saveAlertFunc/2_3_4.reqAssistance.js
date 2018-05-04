//Dependencies
var moment = require('moment');
var reqAsst = require('./2_3_4.reqAssistance.js');
var models = require('./../../../models');


module.exports.buildSmecsAppUsersArrToSendReqAss = function(alert, utils, reqAssOn, reqAssOff, arraySmecsAppToSent) {
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
                    reqAsst.saveRequestAssistance(alert, reqAssOn, boolTrue);
                    reqAsst.saveRequestAssistance(alert, reqAssOff, boolFalse);
                    alert.save();
                }
            });
};


module.exports.saveRequestAssistance = function(alert, reqAss, boolTrueFalse) {
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
                        if (typeof alert.requestAssistance[x].reqSmecsApp.stat == 'undefined' && boolTrueFalse == true) {
                            alert.requestAssistance[x].reqSmecsApp.stat = 'open';
                            alert.requestAssistance[x].reqSmecsApp.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                            //if(alert.alertNameID !== 26)
                                reqAsst.sendPushNotificationReqAssSmecsApp(alert, alert.requestAssistance[x]);
                        }
                    }
                    if (util[2] == 'email') {
                        alert.requestAssistance[x].reqEmail.sentReqEmail = boolTrueFalse;
                        if (typeof alert.requestAssistance[x].reqEmail.stat == 'undefined' && boolTrueFalse == true) {
                            alert.requestAssistance[x].reqEmail.stat = 'open';
                            alert.requestAssistance[x].reqEmail.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                            //if(alert.alertNameID !== 26)
                                reqAsst.sendPushNotificationReqAssEmail(alert, alert.requestAssistance[x]);
                        }
                    }
                    if (util[2] == 'call') {
                        alert.requestAssistance[x].reqCall.sentReqCall = boolTrueFalse;
                        if (typeof alert.requestAssistance[x].reqCall.stat == 'undefined' && boolTrueFalse == true) {
                            alert.requestAssistance[x].reqCall.stat = 'open';
                            alert.requestAssistance[x].reqCall.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                            //if(alert.alertNameID !== 26)
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
    alert.sentSmecsAppUsersScope.forEach(function (user) {
        console.log(alert.alertName + ' -> ' + user.utilityName + ' - > Request SMECS APP sent' );
    });

    /********************************
     * NOTIFICATION API HERE        *
     * scope to sent is:            *
     * sentSmecsAppUsersScope *
     ********************************/
};
module.exports.sendPushNotificationReqAssEmail = function(alert, utility) {
    console.log(alert.alertName + ' -> ' + utility.utilityName + ' - > Request EMAIL sent');
    /********************************
     * NOTIFICATION API HERE        *
     * scope to sent is:            *
     * requestAssistance *
     ********************************/
};
module.exports.sendPushNotificationReqAssCall = function(alert, utility) {
    console.log(alert.alertName + ' -> ' + utility.utilityName + ' - > Request CALL sent');
    /*************************
     * NOTIFICATION API HERE *
     *************************/
};