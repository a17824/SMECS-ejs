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
                    if (road.callFunction[i] === 'materialSpill')
                        materialSpill(req, res, alertTemp);
                    if (road.callFunction[i] === 'evacuateTo')
                        evacuateTo(req, res, alertTemp);
                    if (road.callFunction[i] === 'reqAssistance')
                        reqAssistance(req, res, alertTemp);

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

        // for back/exit button
        if(alertTemp.roadIndex === '1')
            alertTemp.roadIndexExit = true;
        // endo of for back/exit button


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
        if (err || !alertTemp) {
            functions.alertTimeExpired(req,res);
        }
        else {
            // for back/exit button
            alertTemp.roadIndexNumberToExit = alertTemp.roadIndex;
            alertTemp.roadIndexExit = true;
            // endo of for back/exit button

            if(alertTemp.realDrillDemo !== 'demo') {



                alertSentInfo.create(req, res, alertTemp,function (result,err) {  //create AlertSentInfo
                    if(err || !result) console.log('something worng creating Alert. err - ', err);
                    else {
                        /*****  CALL HERE NOTIFICATION API  *****/
                        //if(alertTemp.alertNameID !== 26){
                        pushNotification.alert(result, 'newAlert', email, function (result2,err2) {
                            if(err2 || !result2) console.log('sending pushNotification. err - ', err2);
                            else {
                                alertTemp.alertSent = true;
                                alertTemp.save(function (err3) {
                                    if(err3)
                                        console.log('failed to update alertTemp.alertSent to = true. ERR = ',err3);
                                    else
                                        console.log('success to update alertTemp.alertSent to = true');
                                });
                                redirectTo.redirectTo(req,res,alertTemp,flag);
                            }
                        });
                        //}
                        /*
                        else {
                            alertTemp.alertSent = true;
                            alertTemp.save(function (err) {
                                if(err)
                                    console.log('26 failed to update alertTemp.alertSent to = true. ERR = ',err);
                                else
                                    console.log('26 success to update alertTemp.alertSent to = true');
                            });
                            redirectTo.redirectTo(req,res,alertTemp,flag);
                        }
                        */
                        if(alertTemp.alertWith.reqAssistance){

                            //console.log('alertTemp.utils = ',alertTemp.utils);
                            var arraySmecsAppToSent = [];
                            reqAsst.buildSmecsAppUsersArrToSendReqAss(result, alertTemp.utils, alertTemp.reqAssOn, alertTemp.reqAssOff, arraySmecsAppToSent, 'notify', 'dontUpdate',req,res);
                        }

                    }
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
        if (err || !alertTemp) {
            console.log('No alert found to updateAlert. err - ',err);
        }
        else {

            //REAL and DRILL alerts
            if (alertTemp.realDrillDemo !== 'demo'){
                alertSentInfo.update(req, res, alertTemp, function (result) {  //update AlertSentInfo

                    /*****  CALL HERE NOTIFICATION API  *****/
                    pushNotification.alert(result, 'updateAlert', 'email', function (result2,err2) {
                        if(err2 || !result2) console.log('sending updateAlert. err - ', err2);
                        else {
                            redirectTo.redirectTo(req, res, alertTemp, flag);
                        }
                    });

                });
            }

            //DEMO alert
            else {
                /*****  CALL HERE NOTIFICATION API  *****/
                redirectTo.redirectTo(req, res, alertTemp, flag);
            }
        }
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

                // for back/exit button
                if(alertTemp.roadIndex === alertTemp.roadIndexNumberToExit)
                    alertTemp.roadIndexExit = true;
                else
                    alertTemp.roadIndexExit = false;
                // end of for back/exit button

                redirectTo.redirectTo(req,res,alertTemp,flag);
            }
            else {
                --alertTemp.roadIndex;
                --alertTemp.roadIndex;

                // for back/exit button
                if(alertTemp.roadIndex === alertTemp.roadIndexNumberToExit)
                    alertTemp.roadIndexExit = true;
                else
                    alertTemp.roadIndexExit = false;
                // end of for back/exit button

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
    alertTemp1.alertWith.htmlTags.labelFloor = 'Student location';

}
function busMap(req, res, alertTemp1) {
    alertTemp1.mapBus = req.body.mapBus;
    alertTemp1.alertWith.mapBus = true;
}
function multiSchoolClosed(req, res, alertTemp1) {
    alertTemp1.daysClosed = req.body.daysClosed;
    alertTemp1.alertWith.multiSchoolClosed = true;
}
function multiMedical(req, res, alertTemp1) {
    alertTemp1.medicalInjuredParties = req.body.medicalInjuredParties;
    alertTemp1.alertWith.multiMedical = true;
}

function multiUtilities(req, res, alert, callBack) {

    models.Utilities.find({'utilityID': alert.multiSelectionIDs}, function (err, utils) {
        if(err){
            console.log('err finding Utilities = ', err);
        }else {

            alert.requestAssistance = [];
            utils.forEach(function (util) {
                var request = {
                    utilityID: util.utilityID,
                    utilityName: util.utilityName,
                    contactName: util.contactName,
                    phone: util.phone,
                    email: util.email,
                    smecsApp: util.smecsApp,
                    defaultContact: util.defaultContact
                };
                alert.requestAssistance.push(request);
            });

            if (alert.alertWith.reqAssistance) {


                /*
                                alert.requestAssistance.forEach(function (utility) {    //delete default contact. It memorizes user options on radio buttons to req assistance
                                    utility.defaultContact = 'ask';
                                });
                */

                let utilitiesON =  req.body.checkboxesIDs;
                let reqAssChecked =  req.body.reqAssChecked;

                if(typeof reqAssChecked !== "undefined") {  //for back button in ejs

                    let array = [];
                    let arrOn = [];
                    let arrOff = [];
                    reqAssChecked.forEach(function (utility) {
                        array = [];
                        let arr = [];
                        array = utility.split(',').map(String);
                        let arrayString = array[0];
                        arr = arrayString.split('_|_').map(String);
                        utilitiesON.forEach(function (utilityChecked) {
                            if (utilityChecked === arr[0])
                                arrOn.push(arrayString);
                            else
                                arrOff.push(arrayString);
                        });

                    });


                    let reqAssOn, reqAssOff;

                    if (req.decoded) {       // API user
                        reqAssOn = req.body.reqAssChecked.split(',').map(String);
                        reqAssOff = req.body.reqAssNotChecked.split(',').map(String);
                    } else {                 // EJS user
                        reqAssOn = arrOn;
                        reqAssOff = arrOff;
                    }

                    alert.reqAssOn = reqAssOn;
                    alert.reqAssOff = reqAssOff;
                    alert.utils = utils;

                }

            }

            alert.alertWith.multiUtilities = true;

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
    alertTemp1.alertWith.busAccidentNoInjuries = true;
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
    alertTemp1.alertWith.missingStudent = true;
}
function notesStudentWithGun(req, res, alertTemp1) {
    alertTemp1.studentWithGunSeated = req.body.seat;
    alertTemp1.studentWithGunBehaviour = req.body.studentBehaviour;
    alertTemp1.alertWith.notesStudentWithGun = true;
}
function busEarlyLate(req, res, alertTemp1) {
    alertTemp1.busMorningAfternoon = req.body.busMorningAfternoon;
    alertTemp1.busDelayedAhead = req.body.busDelayedAhead;
    alertTemp1.busTimeChanged = req.body.busTime;
    alertTemp1.busTimeChangedEmail = req.body.busSendEmailBusEarlyLate;
    alertTemp1.alertWith.busEarlyLate = true;
}
function earlyDismissal(req, res, alertTemp1) {
    //console.log(typeof req.body.earlyDismissalTime);
    console.log('busSendEmail = ',req.body.busSendEmailEarlyDismissal);
    alertTemp1.earlyDismissalDate = req.body.earlyDismissalDate;
    alertTemp1.earlyDismissalTime = req.body.earlyDismissalTime;
    alertTemp1.busTimeChangedEmail = req.body.busSendEmailEarlyDismissal;
    alertTemp1.alertWith.earlyDismissal = true;
}
function materialSpill(req, res, alertTemp1) {
    alertTemp1.materialSpill = req.body.materialSpill;
    alertTemp1.alertWith.materialSpill = true;
}
function evacuateTo(req, res, alertTemp1) {
    alertTemp1.alertWith.evacuateTo = true;
    alertTemp1.alertWith.htmlTags.showHideDiv = 'hideThis';
    alertTemp1.alertWith.htmlTags.labelFloor = 'Where to evacuate to?';
}
function reqAssistance(req, res, alertTemp1) {
    alertTemp1.alertWith.reqAssistance = true;
}

