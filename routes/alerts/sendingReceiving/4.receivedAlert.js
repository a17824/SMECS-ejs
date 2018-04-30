//Dependencies
var models = require('./../../models');
var async = require("async");
var reqAsst = require('./saveAlertFunc/2_3_4.reqAssistance.js');
var functions = require('./../../functions');

module.exports.receivedAlert = function(req, res) {
    async.parallel([
        function(callback){models.AlertSentInfo.findById(req.params.id).exec(callback);},
        function(callback){models.Floors.find().exec(callback);},
        function(callback){models.Utilities.find().exec(callback);},
        function(callback){models.AclAlertsReal.find().exec(callback);},
        function(callback){models.AclAlertsTest.find().exec(callback);},
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        if (!results[0]) {
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
            res.redirect('/alerts/sending/chooseAlert');
        }
        else {
            async.waterfall([
                function (callback) {
                    var canRequestAssistance = false;
                    models.Alerts.findOne({'alertID': results[0].alertNameID}, function(err, alert){//check if Request Assistance is softDeleted
                        if( err ) console.log("No Utility found");
                        else{
                            if(results[0].alertNameID == 14 ){
                                if(alert.softDeleted == false){
                                    if(results[0].testModeON){
                                        var typeAclAlert = results[4];
                                    }else{
                                        var typeAclAlert = results[3];
                                    }
                                    //check if user as rights to Request Assistance for Real Alerts and Test Alerts ---------
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
                res.render('alerts/receiving/received', {
                    title: 'Received Alert',
                    userAuthID: req.user.userRoleID,
                    userAuthRoleName: req.user.userRoleName,
                    info: results[0],
                    floor: results[1],
                    utilities: results[2],
                    canRequestAssistance: canRequestAssistance,
                    enableProcedureButton: enableProcedureButton,
                    aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            });
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

            alert.save();

            res.send({redirect: '/dashboard/'});
        }
    });
};
