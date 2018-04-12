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
                                reqAsst.sendPushNotificationReqAssSmecsApp(alert, alert.requestAssistance[x]);
                        }
                    }
                    if (util[2] == 'email') {
                        alert.requestAssistance[x].reqEmail.sentReqEmail = boolTrueFalse;
                        if (boolTrueFalse) {
                            alert.requestAssistance[x].reqEmail.stat = 'open';
                            alert.requestAssistance[x].reqEmail.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                            if(alert.alertNameID !== 26)
                                reqAsst.sendPushNotificationReqAssEmail(alert, alert.requestAssistance[x]);
                        }
                    }
                    if (util[2] == 'call') {
                        alert.requestAssistance[x].reqCall.sentReqCall = boolTrueFalse;
                        if (boolTrueFalse) {
                            alert.requestAssistance[x].reqCall.stat = 'open';
                            alert.requestAssistance[x].reqCall.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                            if(alert.alertNameID !== 26)
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
    console.log(alert.alertName + ' -> ' + utility.utilityName + ' - > Request SMECS APP sent' );
    /*************************
     * NOTIFICATION API HERE *
     *************************/
};
module.exports.sendPushNotificationReqAssEmail = function(alert, utility) {
    console.log(alert.alertName + ' -> ' + utility.utilityName + ' - > Request EMAIL sent');
    /*************************
     * NOTIFICATION API HERE *
     *************************/
};
module.exports.sendPushNotificationReqAssCall = function(alert, utility) {
    console.log(alert.alertName + ' -> ' + utility.utilityName + ' - > Request CALL sent');
    /*************************
     * NOTIFICATION API HERE *
     *************************/
};