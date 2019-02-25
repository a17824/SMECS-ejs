//Dependencies
var models = require('./../../models');
var async = require("async");
var functions = require('./../../functions');
var moment = require('moment');
let redirectTo = require('./createAlert');



//          FLOOR           \\
module.exports.showFloor = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertSentTemp.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.Building.find().exec(callback);
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
        let arrayFloors = [];


        if (!results[0]) {
            functions.alertTimeExpired(req,res);
        }
        else {
            results[2].forEach(function (floor, idx, array) {
                arrayFloors.push(floor.Building.buildingID + '_|');
                arrayFloors.push(floor.Building.name + '_|');
                arrayFloors.push(floor.floorID + '_|');
                arrayFloors.push(floor.floorName + '_|');
                if (idx === array.length - 1) //if last loop remove '_|'
                    arrayFloors.push(floor.floorPlan);
                else
                    arrayFloors.push(floor.floorPlan + '_|');

            });

            var modelToUse = results[2];   // to use Floor collection
            if (results[0].alertNameID == 7){   // to use EvacuateTo collection
                modelToUse = results[3];
            }

            if(req.decoded){ // run SMECS API
                res.json({
                    success: true,
                    userAuthGroupAlerts: results[4].appSettings.groupAlertsButtons, //for Back or Exit button
                    title: results[0].alertName,
                    alert: results[0],
                    buildings: results[1],
                    floor: modelToUse
                });

            }else{  // run SMECS EJS
                res.render('alerts/sending/floor', {
                    title: results[0].alertName,
                    userAuthGroupAlerts: req.user.appSettings.groupAlertsButtons,   //for Back or Exit button
                    alert: results[0],
                    buildings: results[1],
                    floor: modelToUse,
                    arrayFloors: arrayFloors,
                    aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
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
    let buildingID = '';
    let buildingName = '';
    let floorID = '';
    let floorName = req.body.floorName;
    let floorPhoto = req.body.floorPhoto;


    if ( typeof req.body.buildingID !== 'undefined' && req.body.buildingID )
    {
        buildingID = req.body.buildingID;
        buildingName = req.body.buildingName;
    }
    else
    {
        buildingID = 'skipped by user';
        buildingName = 'skipped by user';
    }

    if ( typeof req.body.floorID !== 'undefined' && req.body.floorID )
    {
        if(req.decoded) //API
            floorID = req.body.floorID;
        else {  //EJS
            let arraySplit = req.body.floorID.split("_|_");
            floorID = arraySplit[2];
        }

    }
    else
    {
        floorID = 'skipped by user';
    }

    models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, alert) {
        if (!alert) {
            functions.alertTimeExpired(req,res);
        }
        else {

            alert.buildingID = buildingID;
            alert.buildingName = buildingName;

            //if user skip floor question or if floor photo don't exist on database or all/none/multiple/outside floor selected
            if ( floorID == null ||
                floorID === 'skipped by user' ||
                floorPhoto === '' ||
                floorName === 'Other/Multiple Locations') { // or if is Evacuate alert

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

                if (alert.alertName === 'Other/Multiple Locations'){ //if ANY FLOOR/ALL EXIT FLOORS are selected (for 'evacuation exit' of EVACUATE Alert)
                    floorPhoto = 'Multiple floors';
                    alert.sniperCoordinateX = undefined;
                    alert.sniperCoordinateY = undefined;
                }
                //---------------end of checkFloorPhotoExists

                alert.floorID = floorID;
                alert.floorName = floorName;
                alert.floorPhoto = floorPhoto;
                alert.roadIndexExit = false; // for back/exit button

                //if user goes back in browser and removes floor floor

                /****************************      ALERT ROAD      ****************************/
                /** functions needed here are:                                               **/
                redirectTo.redirectTo(req,res,alert,'GETtoPOST');
            }

            else {  //if user choose a floor and photo exists
                alert.buildingID = buildingID;
                alert.buildingName = buildingName;
                alert.floorID = floorID;
                alert.floorName = floorName;
                alert.floorPhoto = floorPhoto;
                alert.roadIndexExit = false; // for back/exit button

                alert.save();

                redirectAPI = 'floorMap';
                redirectEJS = '/alerts/sending/floorLocation/' + alertToUpdate1;

                /****************************      ALERT ROAD      ****************************/
                /** functions needed here are:                                               **/
                redirectTo.redirectTo(req,res,alert,'floorMap',redirectAPI,redirectEJS);
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

            /****************************      ALERT ROAD      ****************************/
            /** functions needed here are:                                               **/
            redirectTo.redirectTo(req,res,alert,'GETtoPOST');

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

            if (typeof newNote == 'undefined' || newNote == '')
                newNote = '(skipped note)';

            if(req.decoded){ // run SMECS API
                alert.note = htmlName + req.decoded.user.firstName + ' ' + req.decoded.user.lastName + ' ' +  htmlTime + wrapped.format('h:mm:ss a') + htmlNote + newNote;
            }else{  // run SMECS EJS
                alert.note = htmlName + req.user.firstName + ' ' + req.user.lastName + ' ' +  htmlTime + wrapped.format('h:mm:ss a') + htmlNote + newNote;
            }

            alert.roadIndexExit = false; // for back/exit button

            /****************************          ALERT ROAD          ****************************/
            /** functions needed here are: studentMissingStudent, notesStudentWithGun, notesBus  **/
            redirectTo.redirectTo(req,res,alert,'GETtoPOST');

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
            console.log('alertTemp.previousStep = ',results[0].previousStep);
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
            alert.roadIndexExit = false; // for back/exit button

            /****************************      ALERT ROAD      ****************************/
            /** functions needed here are: student2, studentSaveFile                     **/
            redirectTo.redirectTo(req,res,alert,'GETtoPOST',studentName,studentPhoto);

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
            alert.roadIndexExit = false; // for back/exit button

            if (req.decoded && typeof req.body.checkboxesIDs !== 'undefined' && req.body.checkboxesIDs) {       // API user
                alert.multiSelectionNames = req.body.checkboxesNames.split(',').map(String);
                alert.multiSelectionIDs = req.body.checkboxesIDs.split(',').map(String);
            }

            /****************************       ALERT ROAD       ****************************/
            /** functions needed here are: multiUtilities, multiMedical, multiSchoolClosed **/
            redirectTo.redirectTo(req,res,alert,'GETtoPOST');
        }
    });
};
