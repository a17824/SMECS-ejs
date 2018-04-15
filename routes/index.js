//Dependencies
var express = require('express');
var router = express.Router();
var async = require("async");
var path = require('path');
var models = require('./models');

var users = require('./users/users');
var students = require('./students/students');
var utilityUsers = require('./users/utilityUsers');
var roles2 = require('./roles/roles2');
var privilege = require('./roles/privilege');
var permissions = require('./permissions/permissions');
var permissionsGroup = require('./permissions/permissionsGroup');
var permissionsTable = require('./permissions/permissionsTable');
var alertGroups = require('./alerts/alertGroups');
var alerts = require('./alerts/alerts');
var dashboard = require('./dashboard');
var reports = require('./alerts/reports/reports');
var reportsReqAss = require('./alerts/reports/requestAssistance');
var alertsPermissionsTable = require('./alerts/alertsPermissionsTable');

var auth = require('./authentication/auth');
var email = require('./authentication/email');
var reset = require('./authentication/reset');

var floors = require('./alerts/options/floors');
var rooms = require('./alerts/options/rooms');
var utilities = require('./alerts/options/utilities');
var medical = require('./alerts/options/medical');
var pa = require('./alerts/options/pa');

var chooseAlert = require('./alerts/sendingReceiving/1.chooseAlert');
var sendingAlert = require('./alerts/sendingReceiving/2.sendingAlert.js');
var reviewAlert = require('./alerts/sendingReceiving/3.reviewAlert.js');
var receiveAlert = require('./alerts/sendingReceiving/4.receivedAlert.js');

var procedureR = require('./alerts/sendingReceiving/procedureR');



/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'SMECS'  });
});



/* Test CKEditor. */
router.get('/ckeditor/samples/index', function(req, res, next) {
    res.render('ckeditor/samples/index');
});


/* SHOW FORGOT PASSWORD. */
router.get('/forgot', email.show, function(req, res, next) {});
router.post('/forgot', email.post, function(req, res) {});

/* SHOW RESET PASSWORD. */
router.get('/reset/:token', reset.show, function(req, res, next) {
});
router.post('/reset/:token', reset.post, function(req, res) {
});




/* SHOW DASHBOARD. */
router.get('/dashboard', auth.simpleAuth, auth.requireLogin, dashboard.show, function(req, res, next) {
});

/* SHOW active USERS. */
router.get('/users/showUsers', auth.simpleAuth, auth.requireLogin, users.show, function(req, res, next) {
});
router.post('/users/showUser', auth.simpleAuth, auth.requireLogin, users.showPost, function(req, res) {
});

/* ADD USERS STEP1. ---------------------------------------------------*/
router.get('/users/addUser/step1/:id', auth.simpleAuth, auth.requireLogin, users.addStep1, function(req, res) {
});
router.post('/users/addUser/step1', auth.simpleAuth, auth.requireLogin, users.addStep1Post, function(req, res) {
});
/* ADD USERS STEP2. ---------------------------------------------------*/
router.get('/users/addUser/step2/:id', auth.simpleAuth, auth.requireLogin, users.addStep2, function(req, res) {
});
router.post('/users/addUser/step2', auth.simpleAuth, auth.requireLogin, users.addStep2Post, function(req, res) {
});
/* ADD USERS STEP3. ---------------------------------------------------*/
router.get('/users/addUser/step3/:id', auth.simpleAuth, auth.requireLogin, users.addStep3, function(req, res) {
});
router.post('/users/addUser/step3', auth.simpleAuth, auth.requireLogin, users.addStep3Post, function(req, res) {
});
/*
/* UPDATE USERS  ---------------------------------------------------*/
router.get('/users/updateUser/:id', auth.simpleAuth, auth.requireLogin, users.update, function(req, res) {
});
router.post('/users/updateUser', auth.simpleAuth, auth.requireLogin, users.updatePost, function(req, res) {
});
/*

* UPDATE USERS APP SETTINGS ---------------------------------------------------*/
router.get('/updateAppSettings/:id', auth.simpleAuth, auth.requireLogin, users.updateAppSettings, function(req, res) {
});
router.post('/updateAppSettings', auth.simpleAuth, auth.requireLogin, users.updateAppSettingsPost, function(req, res) {
});
/*


/* SHOW SoftDelete USERS. */
router.get('/users/deletedUsers', auth.simpleAuth, auth.requireLogin, users.showSoftDeleted, function(req, res, next) {
});

/* SoftDelete USERS. */
router.get('/users/delete/:id', auth.simpleAuth, auth.requireLogin, users.softDelete, function(req, res) {
});

/* Restore SoftDeleted USERS. */
router.get('/users/restoreUsers/:id', auth.simpleAuth, auth.requireLogin, users.restoreUser, function(req, res) {
});


/* ERASE USERS. */
router.get('/users/deletedUsers/:id', auth.simpleAuth, auth.requireLogin, users.erase, function(req, res) {
});


// show user photo-------------------------------
router.get('/users/showPhoto/:id', auth.simpleAuth, auth.requireLogin, users.showPhoto, function(req, res) {
});

//--ADD or UPDATE user photo -------------------------------------

router.get('/users/addPhoto/:id', auth.simpleAuth, auth.requireLogin, users.addUpdatePhoto, function (req, res){
});
router.post('/users/addPhoto/:id', auth.simpleAuth, auth.requireLogin, users.addUpdatePhotoPost, function (req, res){
});

// delete user photo------------------
router.get('/users/deletePhoto/:id', auth.simpleAuth, auth.requireLogin, users.deletePhoto, function(req, res) {
});




/* SHOW ALL STUDENTS. */
router.get('/students/showStudents', auth.simpleAuth, auth.requireLogin, students.show, function(req, res, next) {
});

/* ADD STUDENT. -------------------------------*/
router.get('/students/addStudent', auth.simpleAuth, auth.requireLogin, students.add, function(req, res) {
});
router.post('/students/addStudent', auth.simpleAuth, auth.requireLogin, students.addPost, function(req, res) {
});

//  ADD MULTIPLE STUDENTS--------------
router.get('/students/addMultiStudents', auth.simpleAuth, auth.requireLogin, students.addMultiple, function (req, res){
});
router.post('/students/addMultiStudents', auth.simpleAuth, auth.requireLogin, students.addMultiplePost, function (req, res){

});


/* UPDATE STUDENTS. -------------------------------*/
router.get('/students/updateStudent/:id', auth.simpleAuth, auth.requireLogin, students.update, function(req, res) {
});
router.post('/students/updateStudent', auth.simpleAuth, auth.requireLogin, students.updatePost, function(req, res) {
});

/* DELETE STUDENT. */
router.get('/students/deleteStudent/:id', auth.simpleAuth, auth.requireLogin, students.delete, function(req, res) {
});

// show STUDENT photo-------------------------------
router.get('/students/showPhoto/:id', auth.simpleAuth, auth.requireLogin, students.showPhoto, function(req, res) {
});

//--ADD or CHANGE STUDENT photo -------------------------------------
router.get('/students/addPhoto/:id', auth.simpleAuth, auth.requireLogin, students.addUpdatePhoto, function (req, res){
});
router.post('/students/addPhoto/:id', auth.simpleAuth, auth.requireLogin, students.addUpdatePhotoPost, function (req, res){
});

// ADD MULTIPLE PHOTOS AND DELETE ALL OLD PHOTOS IN STUDENTS PHOTOS FOLDER--------------
router.get('/students/addMultiImage', auth.simpleAuth, auth.requireLogin, students.addMultiplePhotos, function (req, res){

});
//var io = require('socket.io');
router.post('/students/addMultiImage', auth.simpleAuth, auth.requireLogin, students.addMultiplePhotosPost, function (req, res){
});

// delete STUDENT photo------------------
router.get('/students/deletePhoto/:id', auth.simpleAuth, auth.requireLogin, students.deletePhoto, function(req, res) {
});




/* SHOW active Utility Users. */
router.get('/utilities/showUtilitiesUsers', auth.simpleAuth, auth.requireLogin, utilityUsers.show, function(req, res, next) {
});

/* ADD Utility Users. ---------------------------------------------------*/
router.get('/utilities/addUtilitiesUsers', auth.simpleAuth, auth.requireLogin, utilityUsers.add, function(req, res) {
});
router.post('/utilities/addUtilitiesUsers', auth.simpleAuth, auth.requireLogin, utilityUsers.addPost, function(req, res) {
});

/* UPDATE Utility Users. ----------------------------------------------------------------------*/
router.get('/utilities/updateUtilityUser/:id', auth.simpleAuth, auth.requireLogin, utilityUsers.update, function(req, res) {
});
router.post('/utilities/updateUtilityUser', auth.simpleAuth, auth.requireLogin, utilityUsers.updatePost, function(req, res) {
});

/* SHOW SoftDelete Utility Users. */
router.get('/utilities/deletedUtilityUsers', auth.simpleAuth, auth.requireLogin, utilityUsers.showSoftDeleted, function(req, res, next) {
});

/* SoftDelete Utility Users. */
router.get('/utilities/softDelete/:id', auth.simpleAuth, auth.requireLogin, utilityUsers.softDelete, function(req, res) {
});

/* Restore SoftDeleted USERS. */
router.get('/utilities/restoreUtilityUser/:id', auth.simpleAuth, auth.requireLogin, utilityUsers.restoreUser, function(req, res) {
});

/* ERASE USERS. */
router.get('/utilities/eraseUtilityUser/:id', auth.simpleAuth, auth.requireLogin, utilityUsers.erase, function(req, res) {
});





/* CRUD Utility Users. ----------------------------------------------------------------------*/
router.get('/utilities/users/:id', auth.simpleAuth, auth.requireLogin, utilityUsers.showUtilityUsers, function(req, res) {
});
router.post('/utilities/users', auth.simpleAuth, auth.requireLogin, utilityUsers.updateUtilityUsersPost, function(req, res) {
});
/* CRUD 911 User Roles. ----------------------------------------------------------------------*/
router.get('/roles911/:id', auth.simpleAuth, auth.requireLogin, alerts.show911UserRoles, function(req, res) {
});
router.post('/roles911', auth.simpleAuth, auth.requireLogin, alerts.update911UserRolesPost, function(req, res) {
});



/* SHOW ALL ROLES2. */
router.get('/roles2/showRoles2', auth.simpleAuth, auth.requireLogin, roles2.show, function(req, res, next) {
});

/* ADD ROLES2. -------------------------------*/
router.get('/roles2/addRole2', auth.simpleAuth, auth.requireLogin, auth.requireLogin, roles2.add, function(req, res) {
});
router.post('/roles2/addRole2', auth.simpleAuth, auth.requireLogin, auth.requireLogin, roles2.addPost, function(req, res) {
});

/* UPDATE ROLES2. -------------------------------*/
router.get('/roles2/updateRole2/:id', auth.simpleAuth, auth.requireLogin, auth.requireLogin, roles2.update, function(req, res) {
});
router.post('/roles2/updateRole2', auth.simpleAuth, auth.requireLogin, auth.requireLogin, roles2.updatePost, function(req, res) {
});

/* DELETE ROLES2. */
router.get('/roles2/showRoles2/:id', auth.simpleAuth, auth.requireLogin, auth.requireLogin, roles2.delete, function(req, res) {
});




/* SHOW ALL Privilege. */
router.get('/privilege/showPrivilege', auth.simpleAuth, auth.requireLogin, privilege.show, function(req, res, next) {
});

/* ADD PRIVILEGE. -------------------------------*/
router.get('/privilege/addPrivilege', auth.simpleAuth, auth.requireLogin, privilege.add, function(req, res) {
});
router.post('/privilege/addPrivilege', auth.simpleAuth, auth.requireLogin, privilege.addPost, function(req, res) {
});

/* UPDATE PRIVILEGES. -------------------------------*/
router.get('/privilege/updatePrivilege/:id', auth.simpleAuth, auth.requireLogin, privilege.update, function(req, res) {
});
router.post('/privilege/updatePrivilege', auth.simpleAuth, auth.requireLogin, privilege.updatePost, function(req, res) {
});

/* DELETE PRIVILEGE. */
router.get('/privilege/showPrivilege/:id', auth.simpleAuth, auth.requireLogin, privilege.delete, function(req, res) {
});





/* SHOW ALL AlertGroups. */
router.get('/alertGroups/showAlertGroups', auth.simpleAuth, auth.requireLogin, alertGroups.show, function(req, res, next) {
});

/* ADD AlertGroups. -------------------------------*/
router.get('/alertGroups/addAlertGroups', auth.simpleAuth, auth.requireLogin, alertGroups.add, function(req, res) {
});
router.post('/alertGroups/addAlertGroups', auth.simpleAuth, auth.requireLogin, alertGroups.addPost, function(req, res) {
});

/* UPDATE AlertGroups. -------------------------------*/
router.get('/alertGroups/updateAlertGroups/:id', auth.simpleAuth, auth.requireLogin, alertGroups.update, function(req, res) {
});
router.post('/alertGroups/updateAlertGroups', auth.simpleAuth, auth.requireLogin, alertGroups.updatePost, function(req, res) {
});

/* DELETE AlertGroups. */
router.get('/alertGroups/showAlertGroups/:id', auth.simpleAuth, auth.requireLogin, alertGroups.delete, function(req, res) {
});





/* SHOW ALL Alerts. */
router.get('/alerts/showAlerts', auth.simpleAuth, auth.requireLogin, alerts.show, function(req, res, next) {
});

/* CREATE Alert. -------------------------------*/
router.get('/alerts/createAlert', auth.simpleAuth, auth.requireLogin, alerts.create, function(req, res) {
});
router.post('/alerts/createAlert', auth.simpleAuth, auth.requireLogin, alerts.createPost, function(req, res) {
});

/* ADD Alerts. -------------------------------*/
/*
 router.get('/alerts/addAlerts', auth.simpleAuth, auth.requireLogin, alerts.add, function(req, res) {
 });
 router.post('/alerts/addAlerts', auth.simpleAuth, auth.requireLogin, alerts.addPost, function(req, res) {
 });
 */
/* UPDATE Alerts. -------------------------------*/
router.get('/alerts/updateAlerts/:id', auth.simpleAuth, auth.requireLogin, alerts.update, function(req, res) {
});
router.post('/alerts/updateAlerts', auth.simpleAuth, auth.requireLogin, alerts.updatePost, function(req, res) {
});

/* PROCEDURE Alerts. -------------------------------*/
router.get('/alerts/procedure/:id', auth.simpleAuth, auth.requireLogin, alerts.procedure, function(req, res) {
});
router.post('/alerts/procedure', auth.simpleAuth, auth.requireLogin, alerts.procedurePost, function(req, res) {
});


/* SHOW SoftDelete ALERTS. */
router.get('/alerts/addAlerts', auth.simpleAuth, auth.requireLogin, alerts.showSoftDeleted, function(req, res, next) {
});

/* SoftDelete ALERTS. */
router.get('/alerts/delete/:id', auth.simpleAuth, auth.requireLogin, alerts.softDelete, function(req, res) {
});

/* Restore SoftDeleted Alerts. */
router.get('/alerts/restoreAlerts/:id', auth.simpleAuth, auth.requireLogin, alerts.restoreAlert, function(req, res) {
});

/* DELETE Alerts. */
router.get('/alerts/addAlerts/:id', auth.simpleAuth, auth.requireLogin, alerts.delete, function(req, res) {
});




/* SHOW ALERT PERMISSIONS TABLE. WHO CAN SEND/RECEIVE ALERTS---------------------------------------------------*/

router.get('/alerts/showAlertPermissionsTableReal', auth.simpleAuth, auth.requireLogin, alertsPermissionsTable.showReal, function(req, res) {
});
router.get('/alerts/showAlertPermissionsTableTest', auth.simpleAuth, auth.requireLogin, alertsPermissionsTable.showTest, function(req, res) {
});

//saving ALERT PERMISSION Table checkBox value to AclAlerts database------------------------
router.post('/alerts/showAlertPermissionsTable', auth.simpleAuth, auth.requireLogin, alertsPermissionsTable.savePost, function(req, res) {
});





/* SHOW ALL PermissionsGroup. */
router.get('/permissionGroups/showPermissionsGroup', auth.simpleAuth, auth.requireLogin, permissionsGroup.show, function(req, res, next) {
});

/* ADD PermissionsGroup. -------------------------------*/
router.get('/permissionGroups/addPermissionsGroup', auth.simpleAuth, auth.requireLogin, permissionsGroup.add, function(req, res) {
});
router.post('/permissionGroups/addPermissionsGroup', auth.simpleAuth, auth.requireLogin, permissionsGroup.addPost, function(req, res) {
});

/* UPDATE PermissionsGroup. -------------------------------*/
router.get('/permissionGroups/updatePermissionsGroup/:id', auth.simpleAuth, auth.requireLogin, permissionsGroup.update, function(req, res) {
});
router.post('/permissionGroups/updatePermissionsGroup', auth.simpleAuth, auth.requireLogin, permissionsGroup.updatePost, function(req, res) {
});

/* DELETE PermissionsGroup. */
router.get('/permissionGroups/showPermissionsGroup/:id', auth.simpleAuth, auth.requireLogin, permissionsGroup.delete, function(req, res) {
});




/* SHOW Permissions. */
router.get('/permissions/showPermissions', auth.simpleAuth, auth.requireLogin, permissions.show, function(req, res, next) {
});

/* ADD Permissions. -------------------------------*/
router.get('/permissions/addPermissions', auth.simpleAuth, auth.requireLogin, permissions.add, function(req, res) {
});
router.post('/permissions/addPermissions', auth.simpleAuth, auth.requireLogin, permissions.addPost, function(req, res) {
});

/* UPDATE Permissions. -------------------------------*/
router.get('/permissions/updatePermissions/:id', auth.simpleAuth, auth.requireLogin, permissions.update, function(req, res) {
});
router.post('/permissions/updatePermissions', auth.simpleAuth, auth.requireLogin, permissions.updatePost, function(req, res) {
});

/* DELETE Permissions. */
router.get('/permissions/showPermissions/:id', auth.simpleAuth, auth.requireLogin, permissions.delete, function(req, res) {
});




/* SHOW PERMISSIONS TABLE. ---------------------------------------------------*/
router.get('/permissions/showPermissionsTable', auth.simpleAuth, auth.requireLogin, permissionsTable.show, function(req, res) {
});

//saving PERMISSION Table checkBox value to AclPremissions database------------------------
router.post('/permissions/showPermissionsTable', auth.simpleAuth, auth.requireLogin, permissionsTable.savePost, function(req, res) {
});






/* SHOW REPORTS. */
router.get('/reports/showReports', auth.simpleAuth, auth.requireLogin, reports.show, function(req, res, next) {
});

// show Reports DETAILS-------------------------------
router.get('/reports/showReportsDetails/:id', auth.simpleAuth, auth.requireLogin, function(req, res) {

    models.ReportsSent.findById(req.params.id,function(error, details) {
        console.log(details);
        res.render('reports/showReportsDetails', { title: 'Alert Details', details: details });

    });
});

/* REPORTS REQUEST ASSISTANCE. */
router.get('/reports/requestAssistance', auth.simpleAuth, auth.requireLogin, reportsReqAss.show, function(req, res, next) {
});


/* SHOW ALERT REPORTS Received. */
router.get('/reports/showReportsReceived/:id', auth.simpleAuth, auth.requireLogin, function(req, res) {
    async.parallel([
        function(callback){
            models.ReportsSent.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.ReportsReceived.find().sort({"scope":1}).sort({"to":1}).exec(callback);
        }
    ],function(err, results){
        res.render('reports/showReportsReceived',{
            title:'REPORTS RECEIVED',
            reportSent: results[0],
            reportReceived: results[1]
        });
    })
});



/* SHOW FLOORS. */
router.get('/floors/showFloors', auth.simpleAuth, auth.requireLogin, floors.show, function(req, res, next) {
});

/* ADD FLOOR. -------------------------------*/
router.get('/floors/addFloor', auth.simpleAuth, auth.requireLogin, floors.add, function(req, res) {
});
router.post('/floors/addFloor', auth.simpleAuth, auth.requireLogin, floors.addPost, function(req, res) {
});

/* UPDATE FLOOR. -------------------------------*/
router.get('/floors/updateFloor/:id', auth.simpleAuth, auth.requireLogin, floors.update, function(req, res) {
});
router.post('/floors/updateFloor', auth.simpleAuth, auth.requireLogin, floors.updatePost, function(req, res) {
});

/* DELETE FLOOR. */
router.get('/floors/deleteFloor/:id', auth.simpleAuth, auth.requireLogin, floors.delete, function(req, res) {
});

// show FLOOR PLAN-------------------------------
router.get('/floors/showFloorPlan/:id', auth.simpleAuth, auth.requireLogin, floors.showFloorPlan, function(req, res) {
});

//--ADD or CHANGE FLOOR PLAN -------------------------------------
router.get('/floors/addFloorPlan/:id', auth.simpleAuth, auth.requireLogin, floors.addUpdateFloorPlan, function (req, res){
});
router.post('/floors/addFloorPlan/:id', auth.simpleAuth, auth.requireLogin, floors.addUpdateFloorPlanPost, function (req, res){
});

// delete FLOOR PLAN------------------
router.get('/floors/deleteFloorPlan/:id', auth.simpleAuth, auth.requireLogin, floors.deleteFloorPlan, function(req, res) {
});


/* SHOW ROOMS. */
router.get('/options/rooms', auth.simpleAuth, auth.requireLogin, rooms.show, function(req, res, next) {
});

/* CREATE ROOM. -------------------------------*/
router.get('/options/createRoom', auth.simpleAuth, auth.requireLogin, rooms.create, function(req, res) {
});
router.post('/options/createRoom', auth.simpleAuth, auth.requireLogin, rooms.createPost, function(req, res) {
});

/* UPDATE ROOM. -------------------------------*/
router.get('/options/updateRoom/:id', auth.simpleAuth, auth.requireLogin, rooms.update, function(req, res) {
});
router.post('/options/updateRoom', auth.simpleAuth, auth.requireLogin, rooms.updatePost, function(req, res) {
});

/* DELETE ROOMS. */
router.get('/options/deleteRoom/:id', auth.simpleAuth, auth.requireLogin, rooms.delete, function(req, res) {
});



/* SHOW UTILITIES. */
router.get('/utilities/showUtilities', auth.simpleAuth, auth.requireLogin, utilities.show, function(req, res, next) {
});

/* ADD UTILITIES. -------------------------------*/
router.get('/utilities/addUtilities', auth.simpleAuth, auth.requireLogin, utilities.add, function(req, res) {
});
router.post('/utilities/addUtilities', auth.simpleAuth, auth.requireLogin, utilities.addPost, function(req, res) {
});

/* UPDATE UTILITIES. -------------------------------*/
router.get('/utilities/updateUtilities/:id', auth.simpleAuth, auth.requireLogin, utilities.update, function(req, res) {
});
router.post('/utilities/updateUtilities', auth.simpleAuth, auth.requireLogin, utilities.updatePost, function(req, res) {
});

/* DELETE UTILITIES. */
router.get('/utilities/deleteUtilities/:id', auth.simpleAuth, auth.requireLogin, utilities.delete, function(req, res) {
});



/* SHOW MEDICAL. */
router.get('/medical/showMedical', auth.simpleAuth, auth.requireLogin, medical.show, function(req, res, next) {
});

/* ADD MEDICAL. -------------------------------*/
router.get('/medical/addMedical', auth.simpleAuth, auth.requireLogin, medical.add, function(req, res) {
});
router.post('/medical/addMedical', auth.simpleAuth, auth.requireLogin, medical.addPost, function(req, res) {
});

/* UPDATE MEDICAL. -------------------------------*/
router.get('/medical/updateMedical/:id', auth.simpleAuth, auth.requireLogin, medical.update, function(req, res) {
});
router.post('/medical/updateMedical', auth.simpleAuth, auth.requireLogin, medical.updatePost, function(req, res) {
});

/* DELETE MEDICAL. */
router.get('/medical/deleteMedical/:id', auth.simpleAuth, auth.requireLogin, medical.delete, function(req, res) {
});

/* PA show Reception Users. -------------------------------*/
router.get('/pa/showPa', auth.simpleAuth, auth.requireLogin, pa.showReceptionUsers, function(req, res) {
});
//saving Reception checkBox value to Users database------------------------
router.post('/pa/showPa', auth.simpleAuth, auth.requireLogin, pa.saveReceptionUsersPost, function(req, res) {
});

/* PA show Recorded Announcements. -------------------------------*/
router.get('/pa/showRecorded', auth.simpleAuth, auth.requireLogin, pa.showRecorded, function(req, res) {
});
//saving Active checkBox value to PA_Recorded database------------------------
router.post('/pa/showRecorded', auth.simpleAuth, auth.requireLogin, pa.saveRecordedPost, function(req, res) {
});

/* PA add Recorded Announcements. -------------------------------*/
router.get('/pa/newAnnouncement', auth.simpleAuth, auth.requireLogin, pa.add, function(req, res) {
});
//saving Active checkBox value to PA_Recorded database------------------------
router.post('/pa/newAnnouncement', auth.simpleAuth, auth.requireLogin, pa.addPost, function(req, res) {
});

/* DELETE PA. */
//router.get('/pa/deletePa/:id', auth.simpleAuth, auth.requireLogin, pa.delete, function(req, res) {
//});



/*SENDING ALERTS*/

/* CHOOSE ALERT. -------------------------------*/
router.get('/alerts/sending/chooseAlert', auth.simpleAuth, auth.requireLogin, chooseAlert.show, function(req, res) {});
router.post('/alerts/sending/chooseAlert', auth.simpleAuth, auth.requireLogin, chooseAlert.showPost, function(req, res) {});

/* Send Alert - Floor. -------------------------------*/
router.get('/alerts/sending/floor/:id', auth.simpleAuth, auth.requireLogin, sendingAlert.showFloor, function(req, res) {});
router.post('/alerts/sending/floor', auth.simpleAuth, auth.requireLogin, sendingAlert.postFloor, function(req, res) {});

/* Send Alert - FloorLocation. -------------------------------*/
router.get('/alerts/sending/floorLocation/:id', auth.simpleAuth, auth.requireLogin, sendingAlert.showFloorLocation, function(req, res) {});
router.post('/alerts/sending/floorLocation', auth.simpleAuth, auth.requireLogin, sendingAlert.postFloorLocation, function(req, res) {});

/* Send Alert - Notes. -------------------------------*/
router.get('/alerts/sending/notes/:id', auth.simpleAuth, auth.requireLogin, sendingAlert.showNotes, function(req, res) {});
router.post('/alerts/sending/notes', auth.simpleAuth, auth.requireLogin, sendingAlert.postNotes, function(req, res) {});

/* Send Alert - Student. -------------------------------*/
router.get('/alerts/sending/student/:id', auth.simpleAuth, auth.requireLogin, sendingAlert.showStudent, function(req, res) {});
router.post('/alerts/sending/student', auth.simpleAuth, auth.requireLogin, sendingAlert.postStudent, function(req, res) {});

/* Send Alert - MultiSelections. -------------------------------*/
router.get('/alerts/sending/multiSelection/:id', auth.simpleAuth, auth.requireLogin, sendingAlert.showMultiSelection, function(req, res) {});
router.post('/alerts/sending/multiSelection', auth.simpleAuth, auth.requireLogin, sendingAlert.postMultiSelection, function(req, res) {});

/* Send Alert - Request Assistance (ALERT 26). -------------------------------*/

router.get('/alerts/sending/reviewAlert/:id', auth.simpleAuth, auth.requireLogin, reviewAlert.reviewAlert, function(req, res, next) {});
router.post('/alerts/sending/reviewAlert', auth.simpleAuth, auth.requireLogin, reviewAlert.postReviewAlert, function(req, res) {});


/*RECEIVING ALERTS*/

/* All Alerts -------------------------------*/
router.get('/alerts/received/receiveAlert/:id', auth.simpleAuth, auth.requireLogin, receiveAlert.receivedAlert, function(req, res, next) {});
router.post('/alerts/received/receivedAlert', auth.simpleAuth, auth.requireLogin, receiveAlert.postReceivedAlert, function(req, res) {});


/* All Procedures -------------------------------*/
router.get('/alerts/receiving/procedureR/:id', auth.simpleAuth, auth.requireLogin, procedureR.procedure, function(req, res) {});



module.exports = router;
