//Dependencies
var models = require('./../../models');
var async = require("async");
var create = require('./saveAlertFunc/3c.createAlertSentInfo.js');
var floor = require('./saveAlertFunc/3a.savefloorFile.js');
var student = require('./saveAlertFunc/3b.student.js');
//var saveAlert = require('./4.toDelete.js');


module.exports.reviewAlert = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertSentTemp.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.Floors.find().exec(callback);
        },
        function(callback){
            models.Utilities.find().exec(callback);
        },
        function(callback){
            models.RequestAssistance.find().exec(callback);
        },
        function(callback){
            models.Alerts.find().exec(callback);
        },
        function(callback){
            models.AclAlertsReal.find().exec(callback);
        },
        function(callback){
            models.AclAlertsTest.find().exec(callback);
        }

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
                request: results[3],
                alerts: results[4], // check if alert is softDeleted for Utilities Failure
                aclReal: results[5], // to check if user has permission to send Request Assistance Alert
                aclTest: results[6] // to check if user has permission to send Request Assistance Alert
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

                    if (tempAlert.alertNameID == 26 ){
                        /*******
                         *  I delete the file that contains code for this alert. Deleted file is:
                         *  C:\Users\Banshee\Desktop\to delete\4.toDelete.js
                         * *********/
                        //saveAlert.saveRequestAssistance(req, res, next);
                    }
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
        }

    ], function (err, tempAlert) {

        if(err) {
            console.log(err);
            res.send({message: 'something went wrong'});
        } else {

            var pushTokenArray = [];
            tempAlert.sentUsersScope.forEach(function (users) {
                if (users.userPushToken)
                    pushTokenArray.push(users.userPushToken);
            });

            /********************************
             *                              *
             *  CALL HERE NOTIFICATION API  *
             *                              *
             * *****************************/

            res.send({redirect: '/dashboard/'});
        }
    });
};

