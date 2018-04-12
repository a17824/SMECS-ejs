//Dependencies
var models = require('./../../models');
var async = require("async");
var floor = require('./saveAlertFunc/3a.savefloorFile.js');
var create = require('./saveAlertFunc/3c.createAlertSentInfo.js');
var student = require('./saveAlertFunc/3b.student.js');
var reqAsst = require('./saveAlertFunc/2_3_4.reqAssistance.js');


module.exports.reviewAlert = function(req, res) {
    async.parallel([
        function(callback){models.AlertSentTemp.findById(req.params.id).exec(callback);},
        function(callback){models.Floors.find().exec(callback);},
        function(callback){models.Utilities.find().exec(callback);},
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
            res.render('alerts/sending/reviewAlert', {
                title: 'Review Alert',
                userAuthID: req.user.userRoleID,
                userAuthRoleName: req.user.userRoleName,
                info: results[0],
                floor: results[1],
                utilities: results[2],
                alerts: results[3], // check if alert is softDeleted for Utilities Failure
                aclReal: results[4], // to check if user has permission to send Request Assistance Alert
                aclTest: results[5] // to check if user has permission to send Request Assistance Alert
            });
        }
    })
};

module.exports.postReviewAlert = function(req, res, next) {
    //console.log(' ALERT 14 REQUEST ASSISTANCE POST ---------------------------------------------------------');
    var alertToUpdate1 = req.body.alertToUpdate;
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
            // Alert Request Assistance
            if (tempAlert.alertNameID == 26 ){

                for (var x = 0; x < tempAlert.requestAssistance.length; x++) {
                    if (tempAlert.requestAssistance[x].reqSmecsApp.stat == 'open') {
                        reqAsst.sendPushNotificationReqAssSmecsApp(tempAlert, tempAlert.requestAssistance[x]);
                    }
                    if (tempAlert.requestAssistance[x].reqEmail.stat == 'open') {
                        reqAsst.sendPushNotificationReqAssEmail(tempAlert, tempAlert.requestAssistance[x]);
                    }
                    if (tempAlert.requestAssistance[x].reqCall.stat == 'open') {
                        reqAsst.sendPushNotificationReqAssCall(tempAlert, tempAlert.requestAssistance[x]);
                    }
                }

                /*
                var stat = alert.status;
                if (!alert || stat == 'closed') {
                    console.log(err);
                    req.flash('error_messages', 'No Request Assistance can be sent because the status of the alert is \'closed\'. This alert was already closed by the Principal or other user with rights to clear/close Alerts' );
                    res.send({redirect: '/alerts/receiving/receiveAlert/' + alertToUpdate1});

*/

            }
            callback(null, tempAlert);
        }

    ], function (err, tempAlert) {


        /********************************
         *                              *
         *  CALL HERE NOTIFICATION API  *
         *                              *
         * *****************************/

        res.send({redirect: '/alerts/received/receiveAlert/' + tempAlert._id});
    });
};
/*
<!-- Alert UTILITY FAILURE  && MEDICAL EMERGENCIES && REQUEST ASSISTANCE-->
<% if (info.alertNameID == 14 ||
    info.alertNameID == 18 ) {%>
<label for="situation"><b>Situation:</b></label><br>

    <!-- checkBox of utility failure -->

    <% for (var i=0; i < info.multiSelectionNames.length; i++) {%>
    <input type="checkbox" name="checkbox"  value="<%= info.multiSelectionNames[i] %>" checked onclick="return false;">
            <label for="utilityName"><%= info.multiSelectionNames[i] %></label><br>
            <% } %>
<% } %>
*/