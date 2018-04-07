//Dependencies
var models = require('./../../models');
var async = require("async");
var moment = require('moment');

//          FLOOR           \\
module.exports.showFloor = function(req, res) {
    console.log('FLOOR GET ----------------------------------------------------');
    async.parallel([
        function(callback){
            models.AlertSentTemp.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.Floors.find().sort({"floorID":1}).exec(callback);
        }
    ],function(err, results){
        if (!results[0]) {
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
            res.redirect('/alerts/sending/chooseAlert');
        }
        else {
            res.render('alerts/sending/floor', {
                title: results[0].alertName,
                userAuthID: req.user.userPrivilegeID,
                alert: results[0],
                floor: results[1]
            });
        }
    });
};
module.exports.postFloor = function(req, res) {
    console.log('FLOOR POST ---------------------------------------------------------');
    var alertToUpdate1 = req.body.alertToUpdate;
    var floorID = req.body.floorID;
    var floorName = req.body.floorName;
    var floorPhoto = req.body.floorPhoto;

    models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, alert) {
        if (!alert) {
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Alert expired. After choosing alert, you have 10min to fill info and send alert');
            res.send({redirect: '/alerts/sending/chooseAlert/'});
        }
        else {
            //if user skip floor question or if floor photo don't exist on database or all/none/multiple/outside floor selected
            if ( floorID == null ||
                floorPhoto === '' ||
                floorID == 'allFloors' ||
                floorID == 'multipleLocations' ||
                floorID == 'outside' ) {

                //checkFloorPhotoExists---------------------
                if (floorName == '' || !floorName){    //if user skip floor question
                    floorPhoto = 'user skipped floor';
                    floorName = 'user skipped floor';
                }

                if (floorPhoto == ''){ //if floor photo don't exist on database
                    floorPhoto = 'FloorPhotoNotExist';
                }

                if (floorID == 'allFloors'){ //if ANY FLOOR/ALL EXIT FLOORS are selected (for 'evacuation exit' of EVACUATE Alert)
                    floorPhoto = 'Multiple floors';
                }
                if (floorID == 'multipleLocations'){ //if Multiple Locations are selected (Violence Alert)
                    floorPhoto = 'Multiple Locations';
                }
                if (floorID == 'outside'){ //if Multiple Locations are selected (Violence Alert)
                    floorPhoto = 'Outside Building';
                }
                //---------------end of checkFloorPhotoExists
                alert.floorName = floorName;
                alert.floorPhoto = floorPhoto;
                alert.save();

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

                    res.send({redirect:'/alerts/sending/notes/' + alertToUpdate1});
                }
            }
            //if user choose a floor and photo exists
            else {
                alert.floorID = floorID;
                alert.floorName = floorName;
                alert.floorPhoto = floorPhoto;
                alert.save();

                res.send({redirect:'/alerts/sending/floorLocation/' + alertToUpdate1});
            }
        }
    });
};

//          FLOOR LOCATION          \\
module.exports.showFloorLocation = function(req, res) {
    console.log('FLOOR GET ----------------------------------------------------');
    async.parallel([
        function(callback){
            models.AlertSentTemp.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.Floors.find().exec(callback);
        }
    ],function(err, results){
        if (!results[0]) {
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
            res.redirect('/alerts/sending/chooseAlert');
        }
        else {
            res.render('alerts/sending/floorLocation', {

                alert: results[0],
                floor: results[1],
                userAuthID: req.user.userPrivilegeID

            });
        }
    });
};

module.exports.postFloorLocation = function(req, res) {
    console.log('FLOOR LOCATION POST ---------------------------------------------------------');
    var alertToUpdate1 = req.body.alertToUpdate;
    models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, alert) {
        if (!alert) {
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
            res.send({redirect: '/alerts/sending/chooseAlert/'});
        }
        else {
            alert.sniperCoordinateX = req.body.coordinateX;
            alert.sniperCoordinateY = req.body.coordinateY;
            alert.save();
            console.log('saved temp Alert ' + alert.alertName + ' info from FLOOR LOCATION POST');

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

                res.send({redirect:'/alerts/sending/notes/' + alertToUpdate1});
            }
        }
    });
};

//          NOTES          \\
module.exports.showNotes = function(req, res) {
    console.log('NOTES GET ----------------------------------------------------');
    async.parallel([
        function(callback){
            models.AlertSentTemp.findById(req.params.id).exec(callback);
        }
    ],function(err, results){
        if (!results[0]) {
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
            res.redirect('/alerts/sending/chooseAlert');
        }
        else {
            res.render('alerts/sending/notes', {
                title: results[0].alertName,
                userAuthID: req.user.userPrivilegeID,
                alert: results[0]
            });
        }
    });
};
module.exports.postNotes = function(req, res) {
    console.log('NOTES POST ---------------------------------------------------------');
    var alertToUpdate1 = req.body.alertToUpdate;
    models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, alert) {
        if (!alert) {
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
            res.send({redirect: '/alerts/sending/chooseAlert/'});
        }
        else {
            alert.note = req.body.note;

            if (alert.alertNameID == 26 ) {
                alert.save();
                //res.send({redirect:'/alerts/sending/multiSelection/' + alertToUpdate1});
                res.send({redirect:'/alerts/sending/reviewAlert/' + alertToUpdate1});
            }else {
                if (alert.alertNameID == 2 ||
                    alert.alertNameID == 3 ||
                    alert.alertNameID == 6 ||
                    alert.alertNameID == 8 ||
                    alert.alertNameID == 9 ||
                    alert.alertNameID == 10 ||
                    alert.alertNameID == 11 ||
                    alert.alertNameID == 12 ||
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
                    alert.alertNameID == 23 ) {

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
                if (alert.alertNameID == 7 ) {

                    alert.evacuateWhereTo = req.body.whereToEvacuate;
                    alert.save();
                }
                res.send({redirect:'/alerts/sending/reviewAlert/' + alertToUpdate1});
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
        }
    ],function(err, results){
        if (!results[0]) {
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
            res.redirect('/alerts/sending/chooseAlert');
        }
        else {
            res.render('alerts/sending/student', {
                title: results[0].alertName,
                userAuthID: req.user.userPrivilegeID,
                alert: results[0],
                student: results[1]
            });
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
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
            res.send({redirect: '/alerts/sending/chooseAlert/'});
        }
        else {
            //ALERT Missing Child,Student with a Gun, Suspected Drug/Alcohol use, Suicide Threat
            if (alert.alertNameID == 4 ||
                alert.alertNameID == 5 ||
                alert.alertNameID == 16 ||
                alert.alertNameID == 17 ||
                alert.alertNameID == 19 ) {

                alert.studentName = studentName;
                alert.studentPhoto = studentPhoto;
                alert.save();

                res.send({redirect:'/alerts/sending/floor/' + alertToUpdate1});
            }

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
        }
    ],function(err, results){
        if (!results[0]) {
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
            res.redirect('/alerts/sending/chooseAlert');
        }
        else {
            res.render('alerts/sending/multiSelection', {
                title: results[0].alertName,
                userAuthID: req.user.userPrivilegeID,
                alert: results[0],
                utilities: results[1],
                medical: results[2]
            });
        }
    });
};

module.exports.postMultiSelection = function(req, res) {
    var alertToUpdate1 = req.body.alertToUpdate;
    models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, alert) {
        if (!alert) {
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
            res.send({redirect: '/alerts/sending/chooseAlert/'});
        }
        else {
            alert.multiSelectionNames = req.body.checkboxesNames;
            alert.multiSelectionIDs = req.body.checkboxesIDs;


            //ALERT Utilities Failures,

            if (alert.alertNameID == 14 ||
                alert.alertNameID == 26 ) {
                models.Utilities.find({'utilityID': alert.multiSelectionIDs}, function (err, utils) {
                    alert.requestAssistance = [];
                    utils.forEach(function (util) {
                        var req = {
                            utilityID: util.utilityID,
                            utilityName:  util.utilityName,
                            contactName: util.contactName,
                            phone: util.phone,
                            email: util.email,
                            smecsApp: util.smecsApp

                        };
                        alert.requestAssistance.push(req);

                    });
                    if (alert.alertNameID == 26 ) {
                        var boolTrue = true;
                        var boolFalse = false;
                        var reqAssOn = req.body.reqAssChecked;
                        var reqAssOff = req.body.reqAssNotChecked;
                        saveRequestAssistance(alert, reqAssOn, boolTrue);
                        saveRequestAssistance(alert, reqAssOff, boolFalse);
                    }

                    alert.save();
                    res.send({redirect:'/alerts/sending/floor/' + alertToUpdate1});
                });


            }
            //ALERT Medical Emergencies
            if (alert.alertNameID == 18 ) {
                alert.medicalInjuredParties = req.body.medicalInjuredParties;
                alert.save();
                res.send({redirect:'/alerts/sending/floor/' + alertToUpdate1});
            }
/*            //ALERT Request Assistance,
            if (alert.alertNameID == 26 ) {
                res.send({redirect:'/alerts/sending/reviewAlert/' + alertToUpdate1});
            }
*/
        }
    });
};

//          REQUEST ASSISTANCE          \\
module.exports.showRequestAssistance = function(req, res) {
    async.parallel([
        function(callback){models.AlertSentTemp.findById(req.params.id).exec(callback);},
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
            res.render('alerts/sending/requestAssistance', {
                title: results[0].alertName,
                userAuthID: req.user.userRoleID,
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

module.exports.postRequestAssistance = function(req, res, next) {
    console.log(' ALERT 26 REQUEST ASSISTANCE POST ---------------------------------------------------------');
    var alertToUpdate1 = req.body.alertToUpdate;
    models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, tempAlert) {
        if (!tempAlert) {
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
            res.send({redirect: '/alerts/sending/chooseAlert/'});
        }
        else {
            console.log('tempAlert. = ' + tempAlert.multiSelectionNames );

            /*******
             *
             *  I delete the file that contains code for this alert.
             *  deleted file is:
             *  C:\Users\Banshee\Desktop\to delete\4.toDelete.js
             *
             * *********/

            //saveAlert.saveAlertInfo(req, res, tempAlert);



        }
    });
};

//this is to put in a new js file
function saveRequestAssistance(alert, reqAss, boolTrueFalse) {
    var arr;
    var arrOn = [];
    var wrapped = moment(new Date());

    if(typeof reqAss !== 'undefined' && reqAss){
        reqAss.forEach(function (utility) {
            arr = utility.split("_|_").map(function (val) {
                return val
            });
            arrOn.push(arr);
        });
        arrOn.forEach(function (util) {
            for (var x = 0; x < alert.requestAssistance.length; x++) {
                if (util[1] == alert.requestAssistance[x].utilityName) {
                    if (util[2] == 'smecsApp') {
                        alert.requestAssistance[x].reqSmecsApp.sentReqSmecsApp = boolTrueFalse;
                        if (boolTrueFalse) {
                            alert.requestAssistance[x].reqSmecsApp.stat = 'open';
                            alert.requestAssistance[x].reqSmecsApp.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                            /*************************
                             * NOTIFICATION API HERE *
                             *************************/
                        }
                    }
                    if (util[2] == 'email') {
                        alert.requestAssistance[x].reqEmail.sentReqEmail = boolTrueFalse;
                        if (boolTrueFalse) {
                            alert.requestAssistance[x].reqEmail.stat = 'open';
                            alert.requestAssistance[x].reqEmail.sentTime = wrapped.format('YYYY-MM-DD, h:mm:ss a');
                            /*******************
                             * EMAIL  API HERE *
                             *******************/
                        }
                    }
                    if (util[2] == 'call') {
                        alert.requestAssistance[x].reqCall.sentReqCall = boolTrueFalse;
                        if (boolTrueFalse) {
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
}