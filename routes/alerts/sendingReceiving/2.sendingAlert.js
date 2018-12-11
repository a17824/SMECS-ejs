//Dependencies
var models = require('./../../models');
var async = require("async");
var functions = require('./../../functions');
var reqAsst = require('./saveAlertFunc/2_3_4.reqAssistance.js');
var student = require('./saveAlertFunc/3b.student.js');
var alertSentInfo = require('./saveAlertFunc/3c.alertSentInfo.js');
var pushNotification = require('./pushNotification.js');
var moment = require('moment');



//          FLOOR           \\
module.exports.showFloor = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertSentTemp.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.Floors.find().sort({"floorID":1}).exec(callback);
        },
        function(callback){
            models.EvacuateTo.find().sort({"utilityID":1}).exec(callback);
        },
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
            var modelToUse = results[1];   // to use Floor collection
            if (results[0].alertNameID == 7){   // to use EvacuateTo collection
                modelToUse = results[2];
            }

            if(req.decoded){ // run SMECS API
                res.json({
                    success: true,
                    userAuthGroupAlerts: results[3].appSettings.groupAlertsButtons, //for Back or Exit button
                    title: results[0].alertName,
                    alert: results[0],
                    floor: modelToUse
                });

            }else{  // run SMECS EJS
                res.render('alerts/sending/floor', {
                    title: results[0].alertName,
                    userAuthGroupAlerts: req.user.appSettings.groupAlertsButtons,   //for Back or Exit button
                    alert: results[0],
                    floor: modelToUse,
                    aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            }
        }
    });
};
module.exports.postFloor = function(req, res) {
    var redirectAPI; //API user
    var redirectEJS; //EJS user

    var alertToUpdate1 = req.body.alertToUpdate;
    var floorID = req.body.floorID;
    var floorName = req.body.floorName;
    var floorPhoto = req.body.floorPhoto;

    models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, alert) {
        if (!alert) {
            functions.alertTimeExpired(req,res);
        }
        else {
            //if user skip floor question or if floor photo don't exist on database or all/none/multiple/outside floor selected
            if ( floorID == null ||
                floorPhoto === '' ||
                floorID == 'allFloors' ||
                floorID == 'multipleLocations' ||
                floorID == 'outside' ||
                alert.alertNameID == 7 ) { // or if is Evacuate alert

                //checkFloorPhotoExists---------------------
                if (floorName == '' || !floorName){    //if user skip floor question
                    floorPhoto = 'skipped by user';
                    floorName = 'skipped by user';
                    //if user goes back in browser and removes floor floor--------------
                    alert.sniperCoordinateX = undefined;
                    alert.sniperCoordinateY = undefined;
                    //-------end of If user goes back in browser and removes floor floor
                }

                if (floorPhoto == ''){ //if floor photo don't exist on database
                    floorPhoto = 'FloorPhotoNotExist';
                    alert.sniperCoordinateX = undefined;
                    alert.sniperCoordinateY = undefined;
                }

                if (floorID == 'allFloors'){ //if ANY FLOOR/ALL EXIT FLOORS are selected (for 'evacuation exit' of EVACUATE Alert)
                    floorPhoto = 'Multiple floors';
                    alert.sniperCoordinateX = undefined;
                    alert.sniperCoordinateY = undefined;
                }
                if (floorID == 'multipleLocations'){ //if Multiple Locations are selected (Violence Alert)
                    floorPhoto = 'Multiple Locations';
                    alert.sniperCoordinateX = undefined;
                    alert.sniperCoordinateY = undefined;
                }
                if (floorID == 'outside'){ //if Multiple Locations are selected (Violence Alert)
                    floorPhoto = 'Outside Building';
                    alert.sniperCoordinateX = undefined;
                    alert.sniperCoordinateY = undefined;
                }
                if (alert.alertNameID == 7){ //or if is Evacuate alert
                    floorPhoto = 'Outside Building';
                    alert.sniperCoordinateX = undefined;
                    alert.sniperCoordinateY = undefined;
                }
                //---------------end of checkFloorPhotoExists
                alert.floorName = floorName;
                alert.floorPhoto = floorPhoto;
                //alert.roadIndex += 1;
                //alert.save();
/*
                if (alert.alertNameID == 2 ||
                    alert.alertNameID == 4 ||
                    alert.alertNameID == 5 ||
                    alert.alertNameID == 6 ||
                    alert.alertNameID == 7 ||
                    alert.alertNameID == 9 ||
                    alert.alertNameID == 10 ||
                    alert.alertNameID == 11 ||
                    alert.alertNameID == 14 ||
                    alert.alertNameID == 15 ||
                    alert.alertNameID == 16 ||
                    alert.alertNameID == 17 ||
                    alert.alertNameID == 18 ||
                    alert.alertNameID == 19 ||
                    alert.alertNameID == 23 ||
                    alert.alertNameID == 26 ) {

                    redirectAPI = 'notes';
                    redirectEJS = '/alerts/sending/notes/' + alertToUpdate1;
                }
                */

                //if user goes back in browser and removes floor floor

                /***      ALERT ROAD      ***/
                alert.alertRoad.forEach(function (road) {
                    console.log(road.step + ' = ' + alert.roadIndex);
                    if(road.step == alert.roadIndex) {
                        for (let i=0; i < road.callFunction.length; i++) {

                        }
                        redirectAPI = road.redirectAPI;
                        redirectEJS = road.redirectEJS + alertToUpdate1;
                    }
                });
                alert.roadIndex = ++alert.roadIndex;
                alert.save();
                /***     end of ALERT ROAD      ***/
            }
            //if user choose a floor and photo exists
            else {
                alert.floorID = floorID;
                alert.floorName = floorName;
                alert.floorPhoto = floorPhoto;
                alert.save();

                redirectAPI = 'floorMap';
                redirectEJS = '/alerts/sending/floorLocation/' + alertToUpdate1;
            }
            if(req.decoded){ // run SMECS API
                res.json({
                    success: true,
                    redirect: redirectAPI
                });
            }else{  // run SMECS EJS
                res.send({redirect: redirectEJS});
            }
        }
    });
};

//          FLOOR LOCATION          \\
module.exports.showFloorLocation = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertSentTemp.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.Floors.find().exec(callback);
        },
        function(callback) {
            if(req.decoded)   //API
                callback(null, 'API');
            else    //EJS
                functions.aclSideMenu(req, res, function (acl) {callback(null, acl);}); //aclPermissions sideMenu
        }

    ],function(err, results){
        if (!results[0]) {
            functions.alertTimeExpired(req,res);
        }
        else {
            if(req.decoded){ //API user
                res.json({
                    success: true,
                    alert: results[0],
                    title: results[0].alertName,
                    floorID: results[1].floorID,
                    floorName: results[1].floorName,
                    floorPhoto: results[1].floorPhoto
                });

            }else{  //EJS user
                res.render('alerts/sending/floorLocation', {
                    alert: results[0],
                    floor: results[1],
                    aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            }
        }
    });
};

module.exports.postFloorLocation = function(req, res) {
    let redirectAPI; //API user
    let redirectEJS; //EJS user
    var alertToUpdate1 = req.body.alertToUpdate;
    models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, alert) {
        if (!alert) {
            functions.alertTimeExpired(req,res);
        }
        else {
            if(alert.floorName !== 'skipped by user'){
                alert.sniperCoordinateX = req.body.coordinateX;
                alert.sniperCoordinateY = req.body.coordinateY;
            }
            console.log('saved temp Alert ' + alert.alertName + ' info from FLOOR LOCATION POST');

            /*
            if (alert.alertNameID == 2 ||
                alert.alertNameID == 4 ||
                alert.alertNameID == 5 ||
                alert.alertNameID == 6 ||
                alert.alertNameID == 7 ||
                alert.alertNameID == 9 ||
                alert.alertNameID == 10 ||
                alert.alertNameID == 11 ||
                alert.alertNameID == 14 ||
                alert.alertNameID == 15 ||
                alert.alertNameID == 16 ||
                alert.alertNameID == 17 ||
                alert.alertNameID == 18 ||
                alert.alertNameID == 19 ||
                alert.alertNameID == 23 ||
                alert.alertNameID == 26  ) { */

            /***      ALERT ROAD      ***/
            alert.alertRoad.forEach(function (road) {
                if(road.step == alert.roadIndex) {
                    for (var i=0; i < road.callFunction.length; i++) {

                    }
                    redirectAPI = road.redirectAPI;
                    redirectEJS = road.redirectEJS + alertToUpdate1;
                }
            });
            alert.roadIndex = ++alert.roadIndex;
            alert.save();
            /***     end of ALERT ROAD      ***/

            if(req.decoded){ // run SMECS API
                res.json({
                    success: true,
                    redirect: redirectAPI
                });
            }else{  // run SMECS EJS
                res.send({redirect: redirectEJS});
            }
            //}



        }
    });
};

//          NOTES          \\
module.exports.showNotes = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertSentTemp.findById(req.params.id).exec(callback);
        },
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
            if(req.decoded){ //API user
                res.json({
                    success: true,
                    userAuthGroupAlerts: results[1].appSettings.groupAlertsButtons, //for Back or Exit button
                    alert: results[0]
                });

            }else{  //EJS user
                res.render('alerts/sending/notes', {
                    title: results[0].alertName,
                    userAuthID: req.user.userPrivilegeID,
                    userAuthGroupAlerts: req.user.appSettings.groupAlertsButtons,   //for Back or Exit button
                    alert: results[0],
                    aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            }
        }
    });
};
module.exports.postNotes = function(req, res) {

    var redirectAPI; //API user
    var redirectEJS; //EJS user
    var allFloorsButtonHidden;  //API user


    var alertToUpdate1 = req.body.alertToUpdate;
    models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, alert) {
        if (!alert) {
            functions.alertTimeExpired(req,res);
        }
        else {
            var wrapped = moment(new Date());
            var htmlName = '<div class="lineSpaceP"><strong><span style="color:#800000">';
            var htmlTime = '</span></strong><span style="font-size:11px">';
            var htmlNote = '</span></div><span style="color:#333333">&nbsp;';
            var newNote = req.body.note;

            if(req.decoded){ // run SMECS API
                alert.note = htmlName + req.decoded.user.firstName + ' ' + req.decoded.user.lastName + ' ' +  htmlTime + wrapped.format('h:mm:ss a') + htmlNote + newNote;
            }else{  // run SMECS EJS
                alert.note = htmlName + req.user.firstName + ' ' + req.user.lastName + ' ' +  htmlTime + wrapped.format('h:mm:ss a') + htmlNote + newNote;
            }
            /*
            if (alert.alertNameID == 26 ) {
                alert.save();
                redirectAPI = 'summary';
                redirectEJS = '/alerts/sending/reviewAlert/' + alertToUpdate1;

            }else {
                if (alert.alertNameID == 2 ||
                    alert.alertNameID == 3 ||
                    alert.alertNameID == 6 ||
                    alert.alertNameID == 7 ||
                    alert.alertNameID == 8 ||
                    alert.alertNameID == 9 ||
                    alert.alertNameID == 10 ||
                    alert.alertNameID == 11 ||
                    alert.alertNameID == 13 ||
                    alert.alertNameID == 14 ||
                    alert.alertNameID == 15 ||
                    alert.alertNameID == 16 ||
                    alert.alertNameID == 17 ||
                    alert.alertNameID == 18 ||
                    alert.alertNameID == 19 ||
                    alert.alertNameID == 20 ||
                    alert.alertNameID == 21 ||
                    alert.alertNameID == 22 ||
                    alert.alertNameID == 23 ||
                    alert.alertNameID == 26 ||
                    alert.alertNameID == 27 ||
                    alert.alertNameID == 29 ) {

                    alert.save();
                }
                if (alert.alertNameID == 4 ) {

                    alert.missingChildLastTimeSeen = req.body.lastTimeSeen;
                    alert.missingChildLastPlaceSeen = req.body.lastPlaceSeen;
                    alert.missingChildClothesWearing = req.body.clothesWearing;
                    alert.save();
                }
                if (alert.alertNameID == 5 ) {

                    alert.studentWithGunSeated = req.body.seat;
                    alert.studentWithGunBehaviour = req.body.studentBehaviour;
                    alert.save();
                }

                if (alert.alertNameID == 12 ) {

                    //alert.latitude = req.body.latitude;
                    //alert.longitude = req.body.longitude;
                    alert.busAccidentNoInjuries = req.body.busAccidentNoInjuries;
                    //alert.mapBus = req.body.mapBus;
                    alert.save();
                }
                if (alert.alertNameID == 27 ) {

                    alert.busMorningAfternoon = req.body.busMorningAfternoon;
                    alert.busDelayedAhead = req.body.busDelayedAhead;
                    alert.busTimeChanged = req.body.busTime;
                    alert.busTimeChangedEmail = req.body.busSendEmail;
                    alert.save();
                }

                redirectAPI = 'summary';
                redirectEJS = '/alerts/sending/reviewAlert/' + alertToUpdate1;
            }
            */

            /***      ALERT ROAD      ***/
            alert.alertRoad.forEach(function (road) {
                if(road.step == alert.roadIndex) {
                    for (var i=0; i < road.callFunction.length; i++) {

                    }
                    redirectAPI = road.redirectAPI;
                    redirectEJS = road.redirectEJS + alertToUpdate1;
                }
            });
            alert.roadIndex = ++alert.roadIndex;
            alert.save();
            /***     end of ALERT ROAD      ***/

            if(req.decoded){ // run SMECS API
                res.json({
                    success: true,
                    redirect: redirectAPI,
                    allFloorsButtonHidden: allFloorsButtonHidden
                });
            }else{  // run SMECS EJS
                res.send({redirect: redirectEJS});
            }


        }
    });
};

//          STUDENT           \\
module.exports.showStudent = function(req, res) {

    async.parallel([
        function(callback){
            models.AlertSentTemp.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.Students.find().exec(callback);
        },
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

            if(req.decoded){ //API user
                res.json({
                    success: true,
                    title: results[0].alertName,
                    alert: results[0],
                    userAuthGroupAlerts: results[2].appSettings.groupAlertsButtons, //for Back or Exit button
                    student: results[1]
                });

            }else{  //EJS user
                res.render('alerts/sending/student', {
                    title: results[0].alertName,
                    userAuthID: req.user.userPrivilegeID,
                    userAuthGroupAlerts: req.user.appSettings.groupAlertsButtons,   //for Back or Exit button
                    alert: results[0],
                    student: results[1],
                    aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            }
        }
    });
};

module.exports.postStudent = function(req, res) {
    let redirectAPI; //API user
    let redirectEJS; //EJS user
    var alertToUpdate1 = req.body.alertToUpdate;
    var studentName = req.body.student;
    var studentPhoto = req.body.photo;

    //checkStudentPhotoExists------------------
    if (studentPhoto == ''){  //if student photo don't exist on database
        studentPhoto = 'photoNotAvailable.bmp';
    }
    //---------- end of checkStudentPhotoExists

    models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, alert) {
        if (!alert) {
            functions.alertTimeExpired(req,res);
        }
        else {
            //ALERT Missing Child,Student with a Gun, Suspected Drug/Alcohol use, Suicide Threat
            /*if (alert.alertNameID == 4 ||
                alert.alertNameID == 5 ||
                alert.alertNameID == 16 ||
                alert.alertNameID == 17 ||
                alert.alertNameID == 19 ) {

                alert.studentName = studentName;
                alert.studentPhoto = studentPhoto;
                alert.save();

                if (alert.alertNameID == 4) {
                    student.saveStudentFile(req, res, alert);
                    alertSentInfo.create(req, res, alert,function (result,err) {  //create AlertSentInfo
                        /*****  CALL HERE NOTIFICATION API  *****/
                        //pushNotification.alert(result, 'newAlert');
                   // });
               // }*/

            /***      ALERT ROAD      ***/
            alert.alertRoad.forEach(function (road) {
                if(road.step == alert.roadIndex) {
                    for (var i=0; i < road.callFunction.length; i++) {
                        if(road.callFunction[i] == 'student2')
                            student2(req, res, alert, studentName, studentPhoto);
                        if(road.callFunction[i] == 'studentSaveFile')
                            studentSaveFile(req, res, alert);
                        if(road.callFunction[i] == 'createAlert')
                            createAlert(req, res, alert);
                    }
                    redirectAPI = road.redirectAPI;
                    redirectEJS = road.redirectEJS + alertToUpdate1;
                }
            });
            alert.roadIndex += 1;
            alert.save();
            /***     end of ALERT ROAD      ***/

            if(req.decoded){ // run SMECS API
                res.json({
                    success: true,
                    redirect: redirectAPI
                });
            }else{  // run SMECS EJS
                res.send({redirect: redirectEJS});
            }
            //}
        }
    });
};

//          MULTI SELECTION          \\
module.exports.showMultiSelection = function(req, res) {

    async.parallel([
        function(callback){
            models.AlertSentTemp.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.Utilities.find().sort({"utilityID":1}).exec(callback);
        },
        function(callback){
            models.Medical.find().sort({"medicalName":1}).exec(callback);
        },
        function(callback){
            models.SchoolClosed.find().sort({"causeName":1}).exec(callback);
        },
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
            if(req.decoded){ //API user
                res.json({
                    success: true,
                    title: results[0].alertName,
                    userAuthGroupAlerts: results[4].appSettings.groupAlertsButtons, //for Back or Exit button
                    alert: results[0],
                    utilities: results[1],
                    medical: results[2],
                    schoolClosed: results[3]
                });

            }else{  //EJS user
                res.render('alerts/sending/multiSelection', {
                    title: results[0].alertName,
                    userAuthGroupAlerts: req.user.appSettings.groupAlertsButtons, //for Back or Exit button
                    alert: results[0],
                    utilities: results[1],
                    medical: results[2],
                    schoolClosed: results[3],
                    aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            }
        }
    });
};

module.exports.postMultiSelection = function(req, res) {

    var alertToUpdate1 = req.body.alertToUpdate;
    models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, alert) {
        if (!alert) {
            functions.alertTimeExpired(req,res);
        }
        else {
            alert.multiSelectionNames = req.body.checkboxesNames;
            alert.multiSelectionIDs = req.body.checkboxesIDs;

            if (req.decoded && typeof req.body.checkboxesIDs !== 'undefined' && req.body.checkboxesIDs) {       // API user
                alert.multiSelectionNames = req.body.checkboxesNames.split(',').map(String);
                alert.multiSelectionIDs = req.body.checkboxesIDs.split(',').map(String);
            }


            //ALERT Utilities Failures,
            if (alert.alertNameID == 14 ||
                alert.alertNameID == 26 ) {
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
                            reqAsst.buildSmecsAppUsersArrToSendReqAss(alert, utils, reqAssOn, reqAssOff, arraySmecsAppToSent, 'dontNotify', 'update');
                        }
                        if (alert.alertNameID !== 26) {
                            alert.save();
                        }
                        if (req.decoded) { // run SMECS API
                            res.json({
                                success: true,
                                redirect: 'floor'
                            });
                        } else {  // run SMECS EJS
                            res.send({redirect: '/alerts/sending/floor/' + alertToUpdate1});
                        }
                    }
                });

            }
            //ALERT Medical Emergencies
            if (alert.alertNameID == 18 ) {
                alert.medicalInjuredParties = req.body.medicalInjuredParties;
                alert.save();

                if(req.decoded){ // run SMECS API
                    res.json({
                        success: true,
                        redirect: 'floor'
                    });
                }else{  // run SMECS EJS
                    res.send({redirect:'/alerts/sending/floor/' + alertToUpdate1});
                }
            }
            //ALERT SchoolClosed
            if (alert.alertNameID == 29 ) {
                alert.dayClosed = req.body.medicalInjuredParties;
                alert.save();

                if(req.decoded){ // run SMECS API
                    res.json({
                        success: true,
                        redirect: 'notes'
                    });
                }else{  // run SMECS EJS
                    res.send({redirect:'/alerts/sending/notes/' + alertToUpdate1});
                }
            }
        }
    });
};

function notesSaveOnly(req, res, alertTemp1) {
    alertTemp1.save();
}
function notesMissingStudent(req, res, alertTemp1) {
    alertTemp1.mapBus = req.body.mapBus;
    alertTemp1.save();
}
function notesStundentWithGun(req, res, alertTemp1) {
    alertTemp1.mapBus = req.body.mapBus;
    alertTemp1.save();
}
function notesReqAssisntance(req, res, alertTemp1) {
    alertTemp1.mapBus = req.body.mapBus;
    alertTemp1.save();
}
function multiMedical(req, res, alertTemp1) {
    alertTemp1.mapBus = req.body.mapBus;
    alertTemp1.save();
}
function multiSchoolClosed(req, res, alertTemp1) {
    alertTemp1.mapBus = req.body.mapBus;
    alertTemp1.save();
}
function multiUltilitiesFailures(req, res, alertTemp1) {
    alertTemp1.mapBus = req.body.mapBus;
    alertTemp1.save();
}
function student2(req, res, alertTemp1, studentName, studentPhoto) {
    alertTemp1.studentName = studentName;
    alertTemp1.studentPhoto = studentPhoto;
}
function studentSaveFile(req, res, alertTemp1) {
    student.saveStudentFile(req, res, alertTemp1);
}
function studentMissingStudent(req, res, alertTemp1) {
    alertTemp1.mapBus = req.body.mapBus;
    alertTemp1.save();
}
function createAlert(req, res, alertTemp1) {
    if(!alertTemp1.demoModeON) {
        alertTemp1.latitude = req.body.latitude;
        alertTemp1.longitude = req.body.longitude;
        alertSentInfo.create(req, res, alertTemp1,function (result,err) {  //create AlertSentInfo
            /*****  CALL HERE NOTIFICATION API  *****/
            pushNotification.alert(result, 'newAlert');
        });
    }
}