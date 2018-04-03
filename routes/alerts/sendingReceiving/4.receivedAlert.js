//Dependencies
var models = require('./../../models');
var async = require("async");
var moment = require('moment');


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

                res.render('alerts/receiving/alertsAssistance', {
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
                res.render('alerts/receiving/alertsDefault', {
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
            saveRequestAssistance(alert, req.body.reqAssChecked, boolTrue);
            saveRequestAssistance(alert, req.body.reqAssNotChecked, boolFalse);
            res.send({redirect: '/dashboard/'});
        }
    });

    /*
                    models.AlertSentInfo.findById({'_id': alertToUpdate1}, function (err, alert) {
                        var stat = alert.status;
                        if (!alert || stat == 'closed') {
                            console.log(err);
                            req.flash('error_messages', 'No Request Assistance can be sent because the status of the alert is \'closed\'. This alert was already closed by the Principal or other user with rights to clear/close Alerts' );
                            res.send({redirect: '/alerts/receiving/receiveAlert/' + alertToUpdate1});
                        }
                        else {
                            //ALERT Utilities Failures Request Assistance,
                            var utilityName = req.body.utilityName;
                            alert.askedForAssistance = true;
                            alert.save();
                            var wrapped = moment(new Date());
                            var requestAssistance1 = new models.RequestAssistance({
                                idAlert: req.body.alertToUpdate,
                                status: stat,
                                sentTime: wrapped.format('YYYY-MM-DD, h:mm:ss a'),
                                alertNameID: req.body.alertNameID,
                                alertName: req.body.alertName,
                                utilityID: req.body.utilityID,
                                utilityName: req.body.utilityName,
                                requestAssistanceSmecsApp: req.body.raSmecsApp,
                                requestAssistanceEmail: req.body.raEmail,
                                requestAssistanceCall: req.body.raCall,
                                smecsContacts: smecsContacts,
                                emailContact: emailContact,
                                callContact: callContact
                            });
                            requestAssistance1.save(function (err) {
                                if (err && (err.code === 11000 || err.code === 11001)) {
                                    return res.status(409).send('showAlert')
                                }else{
                                    console.log("saved Request Assistance");
                                    req.flash('success_messages', '(request successful)' );
                                    res.send({redirect: '/alerts/receiving/receiveAlert/' + alertToUpdate1});
                                }
                            });
                            if (req.body.raSmecsApp == 'true'){
                                whoReceiveAlert.sendAlertRequestAssistance(utilityName);
                                //req.flash('error_messages', '(request successful)' );
                            }
                            if (req.body.raEmail == 'true'){
                                email.sendAlertRequestAssistance(req, utilityName, next);
                                //req.flash('error_messages', '(email request sent successfully)' );
                            }
                            if (req.body.raCall == 'true'){
                                //send email function
                                models.Utilities.findOne({'utilityName': utilityName}, function(err, utility){
                                    console.log('AQUI FAZ CHAMDA REQUEST ASSISTANCE ALERT PARA: ' + utility.phone)
                                });
                            }
                        }
                    });
    */


    /*
    async.waterfall([
        function (callback) {
            models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, tempAlert) {
                // Alert that requires FLOOR function
                if (tempAlert.alertNameID == 2 ||
                    tempAlert.alertNameID == 4 ||
                    tempAlert.alertNameID == 5 ||
                    tempAlert.alertNameID == 6 ||
                    tempAlert.alertNameID == 7 ||
                    tempAlert.alertNameID == 9 ||
                    tempAlert.alertNameID == 10 ||
                    tempAlert.alertNameID == 11 ||
                    tempAlert.alertNameID == 14 ||
                    tempAlert.alertNameID == 15 ||
                    tempAlert.alertNameID == 16 ||
                    tempAlert.alertNameID == 17 ||
                    tempAlert.alertNameID == 18 ||
                    tempAlert.alertNameID == 19 ||
                    tempAlert.alertNameID == 23 ||
                    tempAlert.alertNameID == 26 ) {

                    floor.saveFloorFile(req, res, tempAlert);

                }

                // Alert that requires STUDENT function
                if (tempAlert.alertNameID == 4 ||
                    tempAlert.alertNameID == 5 ||
                    tempAlert.alertNameID == 16 ||
                    tempAlert.alertNameID == 17 ||
                    tempAlert.alertNameID == 19) {

                    student.saveStudentFile(req, res, tempAlert);
                }
                callback(null, tempAlert);
            });
        },
        function (tempAlert, callback) {
            create.alertSentInfo(req, res, tempAlert); //create AlertSentInfo
            callback(null, tempAlert);
        },
        function (tempAlert, callback) {


            callback(null, tempAlert);
        }

    ], function (err, tempAlert) {


        /********************************
         *                              *
         *  CALL HERE NOTIFICATION API  *
         *                              *
         * *****************************

        res.send({redirect: '/dashboard/'});
    });
    */
};

function saveRequestAssistance(alert, reqAss, boolTrueFalse) {
    var arr;
    var arrOn = [];
    var wrapped = moment(new Date());
    reqAss.forEach(function (utility) {
        arr = utility.split("_|_").map(function (val){
            return val
        });
        arrOn.push(arr);
    });
    arrOn.forEach(function (util) {
        for (var x = 0; x < alert.requestAssistance.length; x++) {
            if( util[1] == alert.requestAssistance[x].utilityName){
                if (util[2] == 'smecsApp'){
                    alert.requestAssistance[x].reqSmecsApp.sentReqSmecsApp = boolTrueFalse;
                    if(boolTrueFalse){
                        alert.requestAssistance[x].reqSmecsApp.stat = 'open';
                        alert.requestAssistance[x].reqSmecsApp.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                        /*************************
                         * NOTIFICATION API HERE *
                         *************************/
                    }
                }
                if (util[2] == 'email'){
                    alert.requestAssistance[x].reqEmail.sentReqEmail = boolTrueFalse;
                    if(boolTrueFalse){
                        alert.requestAssistance[x].reqEmail.stat = 'open';
                        alert.requestAssistance[x].reqEmail.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                        /*******************
                         * EMAIL  API HERE *
                         *******************/
                    }
                }
                if (util[2] == 'call'){
                    alert.requestAssistance[x].reqCall.sentReqCall = boolTrueFalse;
                    if(boolTrueFalse){
                        alert.requestAssistance[x].reqCall.stat = 'open';
                        alert.requestAssistance[x].reqCall.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                        /******************
                         * CALL  API HERE *
                         ******************/
                    }
                }
                alert.save();
                break
            }

        }



    });
}