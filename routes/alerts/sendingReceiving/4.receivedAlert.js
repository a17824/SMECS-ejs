//Dependencies
var models = require('./../../models');
var async = require("async");
var reqAsst = require('./saveAlertFunc/2_3_4.reqAssistance.js');

module.exports.receivedAlert = function(req, res) {
    async.parallel([
        function(callback){models.AlertSentInfo.findById(req.params.id).exec(callback);},
        function(callback){models.Floors.find().exec(callback);},
        function(callback){models.Utilities.find().exec(callback);},
        function(callback){models.RequestAssistance.find().exec(callback);},
        function(callback){models.Alerts.find().exec(callback);},
        function(callback){models.AclAlertsReal.find().exec(callback);},
        function(callback){models.AclAlertsTest.find().exec(callback);}

    ],function(err, results){
        if (!results[0]) {
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
            res.redirect('/alerts/sending/chooseAlert');
        }
        else {


            if(results[0].alertNameID == 14){
                //check if user as rights to Request Assistance for Real Alerts and Test Alerts ---------
                if(results[0].testModeON){
                    var typeAclAlert = results[6];
                }else{
                    var typeAclAlert = results[5];
                }
                var canRequestAssistance = false;
                for (var i=0; i < typeAclAlert.length; i++) {
                    for (var t = 0; t < req.user.userRoleID.length; t++) {
                        if (typeAclAlert[i].checkBoxID == 's' + req.user.userRoleID[t] + 26 && typeAclAlert[i].checkBoxValue == true) {
                            canRequestAssistance = true;
                            break;
                        }
                    }
                    if (canRequestAssistance) {
                        break;
                    }
                }
                //----------- end of check if user as rights to Request Assistance for Real Alerts and Test Alerts

                res.render('alerts/receiving/receivedMultiSelection', {
                    title: 'Received Alert Assistance',
                    userAuthID: req.user.userRoleID,
                    userAuthRoleName: req.user.userRoleName,
                    info: results[0],
                    floor: results[1],
                    utilities: results[2],
                    request: results[3],
                    alerts: results[4], // check if alert is softDeleted for Utilities Failure
                    canRequestAssistance: canRequestAssistance
                });
            }else{
                res.render('alerts/receiving/receivedDefault', {
                    title: 'Received Alert',
                    userAuthID: req.user.userRoleID,
                    userAuthRoleName: req.user.userRoleName,
                    info: results[0],
                    floor: results[1],
                    utilities: results[2],
                    request: results[3],
                    alerts: results[4] // check if alert is softDeleted for Utilities Failure

                });

            }
        }
    })
};

module.exports.postReceivedAlert = function(req, res, next) {
    //console.log(' ALERT 14 REQUEST ASSISTANCE POST ---------------------------------------------------------');
    var alertToUpdate1 = req.body.alertToUpdate;

    models.AlertSentInfo.findById({'_id': alertToUpdate1}, function (err, alert) {

        // Alert Request Assistance
        if (alert.alertNameID == 14) {
            var boolTrue = true;
            var boolFalse = false;
            var reqAssOn = req.body.reqAssChecked;
            var reqAssOff = req.body.reqAssNotChecked;

            reqAsst.saveRequestAssistance(alert, reqAssOn, boolTrue);
            reqAsst.saveRequestAssistance(alert, reqAssOff, boolFalse);
            res.send({redirect: '/dashboard/'});
        }
    });
};
