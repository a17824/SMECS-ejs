//Dependencies
var models = require('./../../models');
var async = require("async");
var floor = require('./saveAlertFunc/3a.savefloorFile.js');
var alertSentInfo = require('./saveAlertFunc/3c.alertSentInfo.js');
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
                    userAuthGroupAlerts: results[4].userRoleName, //for Call911 button
                    info: results[0],
                    floor: results[1],
                    utilities: results[2],
                    results: results[3] // check if alert is softDeleted for Utilities Failure

                });

            }else{  // run SMECS EJS
                res.render('alerts/sending/reviewAlert', {
                    title: 'Review Alert',
                    userAuthRoleName: req.user.userRoleName,
                    info: results[0],
                    floor: results[1],
                    utilities: results[2],
                    alerts: results[3], // check if alert is softDeleted for Utilities Failure
                    aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            }
        }
    })
};

module.exports.postReviewAlert = function(req, res, next) {
    var alertToUpdate1;
    let redirectAPI; //API user
    let redirectEJS; //EJS user

    if(req.body.alertToUpdate == 0) //panic alert
        alertToUpdate1 = req.params.id;
    else
        alertToUpdate1 = req.body.alertToUpdate; //all other alerts


    async.waterfall([
        function (callback) {
            models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, tempAlert) {
/*
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

                    student.updateStudentFile(req, res, tempAlert);
                }
*/
                /***      ALERT ROAD      ***/
                tempAlert.alertRoad.forEach(function (road) {
                    if(road.step == tempAlert.roadIndex) {
                        for (let i=0; i < road.callFunction.length; i++) {
                            if(road.callFunction[i] == 'saveFloorFile')
                                floor.saveFloorFile(req, res, tempAlert);
                            if(road.callFunction[i] == 'updateStudentFile')
                                student.updateStudentFile(req, res, tempAlert);
                            if(road.callFunction[i] == 'createAlert')
                                createAlert(req, res, tempAlert);
                        }
                        redirectAPI = road.redirectAPI;
                        redirectEJS = road.redirectEJS + alertToUpdate1;
                    }
                });
                tempAlert.roadIndex = ++tempAlert.roadIndex;
                tempAlert.save();
                /***     end of ALERT ROAD      ***/


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
                                reqAsst.buildSmecsAppUsersArrToSendReqAss(alert, utils, tempAlert.reqAssOn, tempAlert.reqAssOff, arraySmecsAppToSent,'notify','update');

                            }
                        });
                    }
                });
            }
            callback(null, tempAlert);
        }

    ], function (err, tempAlert) {

        //alertSentInfo.update(req, res, tempAlert,function (result,err) {  //update AlertSentInfo

            /*****  CALL HERE NOTIFICATION API  *****/
            //pushNotification.alert(result, 'newAlert');

        //});

        /***      ALERT ROAD      ***/
        tempAlert.alertRoad.forEach(function (road) {
            if(road.step == tempAlert.roadIndex) {
                for (let i=0; i < road.callFunction.length; i++) {
                    if(road.callFunction[i] == 'updateAlert')
                        updateAlert(req, res, tempAlert);
                }
                //redirectAPI = road.redirectAPI;
                //redirectEJS = road.redirectEJS + alertToUpdate1;
            }
        });
        tempAlert.roadIndex = ++tempAlert.roadIndex;
        tempAlert.save();
        /***     end of ALERT ROAD      ***/


/*
        if(req.decoded){ //API user
            res.json({
                success: true,
                message: 'Alert Successfully sent.',
                redirect: 'home'
            });

        }else{  //EJS user
            res.send({redirect: '/alerts/received/receiveAlert/' + tempAlert._id});
        }
*/

        if(req.decoded){ // run SMECS API
            res.json({
                success: true,
                message: 'Alert Successfully sent.',
                redirect: redirectAPI
            });
        }else{  // run SMECS EJS
            res.send({redirect: redirectEJS});
        }
    });
};

function createAlert(req, res, alertTemp1) {
    console.log('CREATE');
    if(alertTemp1.realDrillDemo !== 'demo') {
        alertTemp1.latitude = req.body.latitude;
        alertTemp1.longitude = req.body.longitude;
        alertSentInfo.create(req, res, alertTemp1,function (result,err) {  //create AlertSentInfo
            /*****  CALL HERE NOTIFICATION API  *****/
            pushNotification.alert(result, 'newAlert');
        });
    }
}
function updateAlert(req, res, alertTemp1) {
    console.log('UPDATE');
    if(alertTemp1.realDrillDemo !== 'demo') {
        alertSentInfo.update(req, res, alertTemp1,function (result,err) {  //update AlertSentInfo

            /*****  CALL HERE NOTIFICATION API  *****/
            pushNotification.alert(result, 'newAlert');

        });
    }
}