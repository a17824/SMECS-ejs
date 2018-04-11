//Dependencies
var moment = require('moment');
var reqAsst = require('./2_3_4.reqAssistance.js');

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
                        if (boolTrueFalse) {
                            alert.requestAssistance[x].reqSmecsApp.stat = 'open';
                            alert.requestAssistance[x].reqSmecsApp.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                            if(alert.alertNameID !== 26)
                                reqAsst.sendPushNotificationReqAssSmecsApp(alert);
                        }
                    }
                    if (util[2] == 'email') {
                        alert.requestAssistance[x].reqEmail.sentReqEmail = boolTrueFalse;
                        if (boolTrueFalse) {
                            alert.requestAssistance[x].reqEmail.stat = 'open';
                            alert.requestAssistance[x].reqEmail.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                            if(alert.alertNameID !== 26)
                                reqAsst.sendPushNotificationReqAssEmail(alert);
                        }
                    }
                    if (util[2] == 'call') {
                        alert.requestAssistance[x].reqCall.sentReqCall = boolTrueFalse;
                        if (boolTrueFalse) {
                            alert.requestAssistance[x].reqCall.stat = 'open';
                            alert.requestAssistance[x].reqCall.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                            if(alert.alertNameID !== 26)
                                reqAsst.sendPushNotificationReqAssCall(alert);
                        }
                    }
                    alert.save();
                    break
                }
            }
        });
    }
};

module.exports.sendPushNotificationReqAssSmecsApp = function(alert) {
    console.log('Request SMECS APP sent = ', alert.alertName);
    /*************************
     * NOTIFICATION API HERE *
     *************************/
};
module.exports.sendPushNotificationReqAssEmail = function(alert) {
    console.log('Request EMAIL sent = ', alert.alertName);
    /*************************
     * NOTIFICATION API HERE *
     *************************/
};
module.exports.sendPushNotificationReqAssCall = function(alert) {
    console.log('Request CALL sent = ', alert.alertName);
    /*************************
     * NOTIFICATION API HERE *
     *************************/
};