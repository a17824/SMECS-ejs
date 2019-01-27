//Dependencies
//var FCM = require('fcm-node'); //for Firebase
let models = require('./../../models');
let async = require("async");
let alertSentInfo = require('./saveAlertFunc/3c.alertSentInfo.js');
let pushNotification = require('./pushNotification.js');
let bcrypt = require('bcryptjs');
let functions = require('./../../functions');
var floor = require('./saveAlertFunc/3a.savefloorFile.js');
let student = require('./saveAlertFunc/3b.student.js');
let reqAsst = require('./saveAlertFunc/2_3_4.reqAssistance.js');
let redirectTo = require('./createAlert');


/* Verify PIN. -------------------------------*/
module.exports.verifyPinGet = function(req, res) {
    let alertToUpdate = req.params.id;

    models.AlertSentTemp.findById(alertToUpdate, function (err, alertTemp) {
        if(!alertTemp || err)
            console.log('updateRoadIndex failed. err = ',err);
        else {
            if(alertTemp.alertSent){ //if alert already sent, skip send alert
                let flag = 'alertSent';
                ++alertTemp.roadIndex;
                alertTemp.save(function (err) {
                    if(err)
                        console.log('failed to update alertTemp.roadIndex. ERR = ',err);
                    else
                        console.log('success decreasing alertTemp.roadIndex');
                });
                redirectTo.redirectTo(req,res,alertTemp,flag);
            }
            else { // else go to send alert
                async.parallel([
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
                                success: true
                            });

                        }else{  // run SMECS EJS
                            res.render('alerts/sending/verifyPin', {
                                title: 'Verify Pin',
                                alertToUpdate: alertToUpdate,
                                aclSideMenu: results[0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                                userAuthPhoto: req.user.photo
                            });
                        }
                    }
                });
            }



        }
    });
};

module.exports.verifyPinPost = function(req, res) {
    let bodyPin = req.body.pin;
    let alertToUpdate = req.body.alertToUpdate;
    let flag = 'GETtoPOST';

    let email; // EJS user
    if (req.decoded)      // API user
        email = req.decoded.user.email;
    else
        email = req.user.email;

    models.Users.findOne({'email': email}, function (err, user) {
        if (err) {
            if (req.decoded) {     // API user
                return res.json({
                    success: false,
                    message: 'Failed to locate user.'
                });
            }
            else    // EJS user
                console.log('Failed to locate user. err = ',err);
        }
        else {
            if ( typeof bodyPin !== 'undefined' && bodyPin )
            {
                if (!bcrypt.compareSync(bodyPin, user.pin)) {
                    console.log('Wrong Pin');
                    if (req.decoded) {     // API user
                        return res.json({
                            success: false,
                            message: 'Authentication failed. Wrong Pin.'
                        });
                    }
                    else  { // EJS user
                        console.log('Incorrect Pin');
                        req.flash('error_messages', ' Incorrect PIN');
                        //res.redirect('/floor/add1');
                        return res.send({redirect:'/verifyPin/' + alertToUpdate})
                    }

                } else {
                    console.log('Pin OK');
                    models.AlertSentTemp.findById(alertToUpdate, function (err, alertTemp) {
                        if (!alertTemp) {
                            functions.alertTimeExpired(req,res);
                        }
                        else {
                            redirectTo.redirectTo(req,res,alertTemp,flag);
                        }
                    });
                }
            } else {
                console.log('Pin undefined');
                console.log('req.body.pin = ',req.body.pin);
            }
        }
    });
};
/* end of Verify PIN. -------------------------------*/





//function redirectTo(req, res, alertTemp,flag) {
module.exports.redirectTo= function(req, res, alertTemp,flag,arg1,arg2) {
    /***      ALERT ROAD      ***/
    let redirectAPI = ''; //API user
    let redirectEJS = ''; //EJS user

    console.log('1111111');
    let flagWait = 0;

    function waitForAlertRoadToEnd(cb){

        alertTemp.alertRoad.forEach(function (road) {

            if(road.step == alertTemp.roadIndex) {

                for (let i=0; i < road.callFunction.length; i++) {

                    if (road.callFunction[i] === 'studentStep1')
                        studentStep1(req, res, alertTemp);
                    if (road.callFunction[i] === 'busMap')
                        busMap(req, res, alertTemp);
                    if(road.callFunction[i] === 'studentMissingStudent')
                        studentMissingStudent(req, res, alertTemp);
                    if(road.callFunction[i] === 'notesStudentWithGun')
                        notesStudentWithGun(req, res, alertTemp);
                    if(road.callFunction[i] === 'notesBus')
                        notesBus(req, res, alertTemp);
                    if(road.callFunction[i] === 'student2')
                        student2(req, res, alertTemp, arg1, arg2);
                    if(road.callFunction[i] === 'studentSaveFile')
                        studentSaveFile(req, res, alertTemp);
                    if(road.callFunction[i] === 'multiUtilities'){
                        flagWait = 1;
                        multiUtilities(req, res, alertTemp, function (waitForCallback) {
                            console.log(waitForCallback);
                            cb('3333');
                        });
                    }
                    if(road.callFunction[i] === 'multiMedical')
                        multiMedical(req, res, alertTemp);
                    if(road.callFunction[i] === 'multiSchoolClosed')
                        multiSchoolClosed(req, res, alertTemp);
                    if(road.callFunction[i] === 'saveFloorFile')
                        floor.saveFloorFile(req, res, alertTemp);
                    if(road.callFunction[i] === 'updateStudentFile')
                        student.updateStudentFile(req, res, alertTemp);
                    if(road.callFunction[i] === 'busEarlyLate')
                        busEarlyLate(req, res, alertTemp);
                    if(road.callFunction[i] === 'earlyDismissal')
                        earlyDismissal(req, res, alertTemp);
                }
                redirectAPI = road.redirectAPI;
                redirectEJS = road.redirectEJS + alertTemp._id;
            }
        });
        if(flagWait == 0){
           cb('3333');
        }
        //cb
    }

    waitForAlertRoadToEnd(function (waitForCallback) {
        console.log(waitForCallback);
        ++alertTemp.roadIndex;
        alertTemp.save(function (err) {
            if(err)
                console.log('create.js module.exports.redirectTo alertTemp.save ERR = ',err)
        });
        if(flag === 'floorMap'){ //if user choose a floor and photo exists
            redirectAPI = arg1;
            redirectEJS = arg2;
            flag = 'GETtoPOST';
            --alertTemp.roadIndex;
        }
        if(req.decoded){ // run SMECS API
            res.json({
                success: true,
                redirect: redirectAPI,
                alert_ID: alertTemp._id
            });
        }
        else{  // run SMECS EJS
            if(flag === 'GETtoPOST') {
                res.send({redirect: redirectEJS});
            }
            else{
                res.redirect(redirectEJS);
            }
        }
    });



    /***     end of ALERT ROAD      ***/
};


//ALERT ROAD FUNCTIONS
/* Create AlertSentInfo and Send PushNotification. -------------------------------*/
module.exports.createAlert= function(req, res) {
    let alertToUpdate = req.params.id;
    let flag = 'create';

    let email; // EJS user
    if (req.decoded)      // API user
        email = req.decoded.user.email;
    else
        email = req.user.email;

    models.AlertSentTemp.findById({'_id': alertToUpdate}, function (err, alertTemp) {
        if (!alertTemp) {
            functions.alertTimeExpired(req,res);
        }
        else {
            if(alertTemp.realDrillDemo !== 'demo') {
                alertTemp.latitude = req.body.latitude;
                alertTemp.longitude = req.body.longitude;

                alertSentInfo.create(req, res, alertTemp,function (result,err) {  //create AlertSentInfo
                    /*****  CALL HERE NOTIFICATION API  *****/
                    pushNotification.alert(result, 'newAlert', email);
                    alertTemp.alertSent = true;
                    alertTemp.save(function (err) {
                        if(err)
                            console.log('failed to update alertTemp.alertSent to = false. ERR = ',err);
                        else
                            console.log('success to update alertTemp.alertSent to = true');
                    });
                    redirectTo.redirectTo(req,res,alertTemp,flag);
                });
            }
            else {
                //DEMO mode ON
                redirectTo.redirectTo(req,res,alertTemp,flag);
            }
        }
    });
};
/* end of Create AlertSentInfo and Send PushNotification. -------------------------------*/

module.exports.updateAlert= function(req, res) {
    let alertToUpdate = req.params.id;
    let flag = 'update';
    models.AlertSentTemp.findById(alertToUpdate, function (err, alertTemp) {
        alertSentInfo.update(req, res, alertTemp,function (result) {  //update AlertSentInfo

            /*****  CALL HERE NOTIFICATION API  *****/
            pushNotification.alert(result, 'updateAlert');
            redirectTo.redirectTo(req,res,alertTemp,flag);
        });
    });
};

module.exports.updateRoadIndex= function(req, res) {
    let alertToUpdate = req.body.alertToUpdate;
    let floorLocation = req.body.floorLocation;
    let flag = 'GETtoPOST';

    models.AlertSentTemp.findById(alertToUpdate, function (err, alertTemp) {
        if(!alertTemp || err){
            console.log('updateRoadIndex failed. err = ',err);
            functions.alertTimeExpired(req,res);
        }
        else {
            if(floorLocation){ // if back button comes from floorLocation.ejs
                --alertTemp.roadIndex;
                redirectTo.redirectTo(req,res,alertTemp,flag);
            }
            else {
                --alertTemp.roadIndex;
                --alertTemp.roadIndex;

                alertTemp.alertRoad.forEach(function (road) {
                    if (road.step == alertTemp.roadIndex && road.redirectAPI === 'createAlert') {
                        --alertTemp.roadIndex;
                        alertTemp.alertRoad.forEach(function (road2) {
                            if (road2.step == alertTemp.roadIndex && road2.redirectAPI === 'verifyPin') {
                                --alertTemp.roadIndex;
                            }
                        })
                    }
                });
                redirectTo.redirectTo(req,res,alertTemp,flag);
            }

        }
    });
};



function studentStep1(req, res, alertTemp1) {
    alertTemp1.studentPhoto = 'photoNotAvailable.bmp';
    student.saveStudentFile(req, res, alertTemp1);
}
function busMap(req, res, alertTemp1) {
    alertTemp1.mapBus = req.body.mapBus;
}
function multiSchoolClosed(req, res, alertTemp1) {
    //console.log(typeof req.body.daysClosed);
    //console.log('daysClosed = ',req.body.daysClosed);
    alertTemp1.daysClosed = req.body.daysClosed;
}
function multiMedical(req, res, alertTemp1) {
    alertTemp1.medicalInjuredParties = req.body.medicalInjuredParties;
}
function multiUtilities(req, res, alert, callBack) {
    models.Utilities.find({'utilityID': alert.multiSelectionIDs}, function (err, utils) {
        if(err){
            console.log('err = ', err);
        }else {
            alert.requestAssistance = [];
            utils.forEach(function (util) {
                var request = {
                    utilityID: util.utilityID,
                    utilityName: util.utilityName,
                    contactName: util.contactName,
                    phone: util.phone,
                    email: util.email,
                    smecsApp: util.smecsApp
                };
                alert.requestAssistance.push(request);
            });

            if (alert.alertNameID == 26) {
                alert.reqAssOn = req.body.reqAssChecked;
                alert.reqAssOff = req.body.reqAssNotChecked;

                var reqAssOn, reqAssOff;

                if (req.decoded) {       // API user
                    reqAssOn = req.body.reqAssChecked.split(',').map(String);
                    reqAssOff = req.body.reqAssNotChecked.split(',').map(String);
                } else {                 // EJS user
                    reqAssOn = req.body.reqAssChecked;
                    reqAssOff = req.body.reqAssNotChecked;
                }


                alert.reqAssOn = reqAssOn;
                alert.reqAssOff = reqAssOff;


                var arraySmecsAppToSent = [];
                reqAsst.buildSmecsAppUsersArrToSendReqAss(alert, utils, reqAssOn, reqAssOff, arraySmecsAppToSent, 'dontNotify', 'update',req,res);
            }

            if (alert.alertNameID !== 26) {
                console.log('requestAssistance = ',alert.requestAssistance);
                alert.save();
            }
            callBack('222222')
        }
    });
}
function notesBus(req, res, alertTemp1) {
    alertTemp1.busAccidentNoInjuries = req.body.busAccidentNoInjuries;
}
function student2(req, res, alertTemp1, studentName, studentPhoto) {
    alertTemp1.studentName = studentName;
    alertTemp1.studentPhoto = studentPhoto;
}
function studentSaveFile(req, res, alertTemp1) {
    student.saveStudentFile(req, res, alertTemp1);
}
function studentMissingStudent(req, res, alertTemp1) {
    alertTemp1.missingChildLastTimeSeen = req.body.lastTimeSeen;
    alertTemp1.missingChildLastPlaceSeen = req.body.lastPlaceSeen;
    alertTemp1.missingChildClothesWearing = req.body.clothesWearing;
}
function notesStudentWithGun(req, res, alertTemp1) {
    alertTemp1.studentWithGunSeated = req.body.seat;
    alertTemp1.studentWithGunBehaviour = req.body.studentBehaviour;
}
function busEarlyLate(req, res, alertTemp1) {
    alertTemp1.busMorningAfternoon = req.body.busMorningAfternoon;
    alertTemp1.busDelayedAhead = req.body.busDelayedAhead;
    alertTemp1.busTimeChanged = req.body.busTime;
    alertTemp1.busTimeChangedEmail = req.body.busSendEmail;
}
function earlyDismissal(req, res, alertTemp1) {
    //console.log(typeof req.body.earlyDismissalTime);
    //console.log('earlyDismissalDate = ',req.body.earlyDismissalDate);
    alertTemp1.earlyDismissalDate = req.body.earlyDismissalDate;
    alertTemp1.earlyDismissalTime = req.body.earlyDismissalTime;
    alertTemp1.busTimeChangedEmail = req.body.busSendEmail;
}