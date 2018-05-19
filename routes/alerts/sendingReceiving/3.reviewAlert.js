//Dependencies
var models = require('./../../models');
var async = require("async");
var floor = require('./saveAlertFunc/3a.savefloorFile.js');
var create = require('./saveAlertFunc/3c.createAlertSentInfo.js');
var student = require('./saveAlertFunc/3b.student.js');
var reqAsst = require('./saveAlertFunc/2_3_4.reqAssistance.js');
var pushNotification = require('./pushNotification.js');
var functions = require('./../../functions');


module.exports.reviewAlert = function(req, res) {
    async.parallel([
        function(callback){models.AlertSentTemp.findById(req.params.id).exec(callback);},
        function(callback){models.Floors.find().exec(callback);},
        function(callback){models.Utilities.find().exec(callback);},
        function(callback){models.Alerts.find().exec(callback);},
        function(callback){models.AclAlertsReal.find().exec(callback);},
        function(callback){models.AclAlertsTest.find().exec(callback);},
        function(callback) {
            if(req.decoded) { //API user
                models.Users.findOne({'email': req.decoded.user.email}).exec(callback);
            }else{  //EJS user
                functions.aclSideMenu(req, res, function (acl) {callback(null, acl);}); //aclPermissions sideMenu
            }
        }

    ],function(err, results){
        if (!results[0]) {
            functions.alertTimeExpired(req,res);
        }
        else {

            if(req.decoded){ // run SMECS API
                res.json({
                    success: true,
                    userAuthGroupAlerts: results[6].userRoleName, //for Call911 button
                    info: results[0],
                    floor: results[1],
                    utilities: results[2],
                    results: results[3], // check if alert is softDeleted for Utilities Failure
                    aclReal: results[4], // to check if user has permission to send Request Assistance Alert
                    aclTest: results[5], // to check if user has permission to send Request Assistance Alert
                });

            }else{  // run SMECS EJS
                res.render('alerts/sending/reviewAlert', {
                    title: 'Review Alert',
                    userAuthRoleName: req.user.userRoleName,
                    info: results[0],
                    floor: results[1],
                    utilities: results[2],
                    alerts: results[3], // check if alert is softDeleted for Utilities Failure
                    aclReal: results[4], // to check if user has permission to send Request Assistance Alert
                    aclTest: results[5], // to check if user has permission to send Request Assistance Alert
                    aclSideMenu: results[6],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            }
        }
    })
};

module.exports.postReviewAlert = function(req, res, next) {
    var alertToUpdate1;

    if(req.body.alertToUpdate == 0) //panic alert
        alertToUpdate1 = req.params.id;
    else
        alertToUpdate1 = req.body.alertToUpdate; //all other alerts


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

            // Alert Request Assistance
            if (tempAlert.alertNameID == 26 ){

                models.Utilities.find({'utilityID': tempAlert.multiSelectionIDs}, function (err, utils) {
                    if (err)
                        console.log('err - ', err);
                    else {
                        models.AlertSentInfo.findById({'_id': alertToUpdate1}, function (err, alert) {
                            if(err){
                                console.log('err = ', err);
                            }else {
                                var arraySmecsAppToSent =[];
                                reqAsst.buildSmecsAppUsersArrToSendReqAss(alert, utils, tempAlert.reqAssOn, tempAlert.reqAssOff, arraySmecsAppToSent);

                            }
                        });
                    }
                });
            }
            callback(null, tempAlert);
        }

    ], function (err, tempAlert) {

        create.alertSentInfo(req, res, tempAlert,function (result,err) {  //create AlertSentInfo

            /*****  CALL HERE NOTIFICATION API  *****/
            pushNotification.alert(tempAlert, 'newAlert');

        });

        if(req.decoded){ //API user
            res.json({
                success: true,
                message: 'Alert Successfully sent.',
                redirect: 'home'
            });

        }else{  //EJS user
            res.send({redirect: '/alerts/received/receiveAlert/' + tempAlert._id});
        }
    });
};
