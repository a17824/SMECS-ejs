//Dependencies
var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var users = require('./users/users');
var students = require('./students/students');
var parentsSelfRegistration = require('./parentsSelfRegistration/parentsSelfRegistration');

var roles2 = require('./roles/roles2');
var privilege = require('./roles/privilege');
let emails = require('./emails/emails');
var permissions = require('./permissions/permissions');
var permissionsGroup = require('./permissions/permissionsGroup');
var permissionsTable = require('./permissions/permissionsTable');
var alertGroups = require('./alerts/alertGroups');
var alerts = require('./alerts/alerts');
var alertRoad = require('./alerts/alertsRoad');
var statistics = require('./statistics/statistics');
var reports = require('./alerts/reports/reports');
var photos = require('./photos/addUpdatePhoto');
var backup = require('./backupRestore/backupRestore');

var alertsPermissionsTable = require('./alerts/alertsPermissionsTable');

var auth = require('./authentication/auth');
var email = require('./authentication/email');
var reset = require('./authentication/reset');
var login = require('./authentication/login');

var building = require('./alerts/options/building');
var floors = require('./alerts/options/floors');
var rooms = require('./alerts/options/rooms');
var utilities = require('./alerts/options/utilities');
var medical = require('./alerts/options/medical');

var pa = require('./alerts/options/pa');
var chooseAlert = require('./alerts/sendingReceiving/1.chooseAlert');
var sendingAlert = require('./alerts/sendingReceiving/2.sendingAlert.js');
var reviewAlert = require('./alerts/sendingReceiving/3.reviewAlert.js');
let createAlert = require('./alerts/sendingReceiving/createAlert');
var receiveAlert = require('./alerts/sendingReceiving/4.receivedAlert.js');
var procedureR = require('./alerts/sendingReceiving/procedureR');

var functions = require('./functions');
var showAlertsAndGroups = require('./alerts/showAlertsAndGroups');
let showLightsAndPanicButtons = require('./lightsPanicButtons/showLightsPanicButtons');


//clean.cleanOldUserPhotos(); //delete old Users photos
//clean.cleanOldStudentPhotos(); //delete old Users photos
//clean.cleanOldAlertSentInfoFloors(); //delete old AlertSentInfoFloors photos
//clean.cleanOldAlertSentInfoStudents(); //delete old AlertSentInfoStudents photos
//Run this function once a month to clean old Photos
/*
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
*/
//This runs every week on sunday at 7pm
schedule.scheduleJob("0 19 * * 7", function() {
    console.log('This runs every week on Sunday at 07:00PM');
    login.heartBeat();  //remove pushTokens in SMECS database that are not Registered in FCM

});

//This runs every day at 8pm
schedule.scheduleJob("0 20 * * *", function() {
    let spawn = require('child_process').spawn,
        ls    = spawn('cmd.exe', ["/c", `backup\\SMECS_auto_backup.bat`],{env: process.env});
    backup.backupRestore(ls, 'autoBackup', function (result,err) {   //auto backup
        if(err || result !== 0) console.log('autoBackup err + result = ', err + ' ' + result);
        else {
            console.log('autoBackup successful = ',result)
        }

    });
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'SMECS'  });
});

/* Test CKEditor. */
//router.get('/ckeditor/samples/index', function(req, res, next) {
//    res.render('ckeditor/samples/index');
//});


/* SHOW FORGOT PASSWORD. */
router.get('/forgot', email.show, function(req, res, next) {});
router.post('/forgot', email.post, function(req, res) {});

/* SHOW RESET PASSWORD. */
router.get('/reset/:token', reset.show, function(req, res, next) {
});
router.post('/reset/:token', reset.post, function(req, res) {
});




/* SHOW Global Statistics. */
router.get('/statistics/globalStats', auth.simpleAuth, auth.requireLogin, statistics.globalStats, function(req, res, next) {
});

/* SHOW User Statistics. */
router.get('/statistics/userStats', auth.simpleAuth, auth.requireLogin, statistics.userStats, function(req, res, next) {
});

/* SHOW active USERS. */
router.get('/users/showUsers', auth.simpleAuth, auth.requireLogin, users.show, function(req, res, next) {
});

/* ADD USERS STEP0. ---------------------------------------------------*/
router.post('/users/addUser/step0', auth.simpleAuth, auth.requireLogin, users.addStep0Post, function(req, res) {
});
router.post('/users/addUser/cancel', auth.simpleAuth, auth.requireLogin, users.addStep0CancelPost, function(req, res) {
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




//--ADD or UPDATE or BACK_button PHOTO -------------------------------------
router.get('/photos/choosePhoto/:id', auth.simpleAuth, auth.requireLogin, photos.addUpdatePhoto, function (req, res){
});
router.post('/photos/choosePhoto/:id', auth.simpleAuth, auth.requireLogin, photos.addUpdatePhotoPost, function (req, res){
});


// DELETE  PHOTO------------------
router.get('/users/deletePhoto/:id', auth.simpleAuth, auth.requireLogin, photos.deletePhoto, function(req, res) {
});


//--Crop Photo -------------------------------------
router.get('/photos/cropPhoto/:id', auth.simpleAuth, auth.requireLogin, photos.cropPhoto, function (req, res){
});
router.post('/photos/cropPhoto', auth.simpleAuth, auth.requireLogin, photos.cropPhotoPost, function (req, res){
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
//router.get('/utilities/showUtilitiesUsers', auth.simpleAuth, auth.requireLogin, utilityUsers.show, function(req, res, next) {
//});

/* ADD Utility Users. ---------------------------------------------------*/
//router.get('/utilities/addUtilitiesUsers', auth.simpleAuth, auth.requireLogin, utilityUsers.add, function(req, res) {
//});
//router.post('/utilities/addUtilitiesUsers', auth.simpleAuth, auth.requireLogin, utilityUsers.addPost, function(req, res) {
//});

/* UPDATE Utility Users. ----------------------------------------------------------------------*/
//router.get('/utilities/updateUtilityUser/:id', auth.simpleAuth, auth.requireLogin, utilityUsers.update, function(req, res) {
//});
//router.post('/utilities/updateUtilityUser', auth.simpleAuth, auth.requireLogin, utilityUsers.updatePost, function(req, res) {
//});

/* SHOW SoftDelete Utility Users. */
//router.get('/utilities/deletedUtilityUsers', auth.simpleAuth, auth.requireLogin, utilityUsers.showSoftDeleted, function(req, res, next) {
//});

/* SoftDelete Utility Users. */
//router.get('/utilities/softDelete/:id', auth.simpleAuth, auth.requireLogin, utilityUsers.softDelete, function(req, res) {
//});

/* Restore SoftDeleted USERS. */
//router.get('/utilities/restoreUtilityUser/:id', auth.simpleAuth, auth.requireLogin, utilityUsers.restoreUser, function(req, res) {
//});

/* ERASE USERS. */
//router.get('/utilities/eraseUtilityUser/:id', auth.simpleAuth, auth.requireLogin, utilityUsers.erase, function(req, res) {
//});





/* CRUD Utility Users. ----------------------------------------------------------------------*/
router.get('/utilities/users/:id', auth.simpleAuth, auth.requireLogin, utilities.showUtilityUsers, function(req, res) {
});
router.post('/utilities/users', auth.simpleAuth, auth.requireLogin, utilities.updateUtilityUsersPost, function(req, res) {
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




/* SHOW ALL EMAILS. */
router.get('/emails/showEmails', auth.simpleAuth, auth.requireLogin, emails.show, function(req, res, next) {
});

/* ADD EMAIL. -------------------------------*/
router.get('/emails/addEmail', auth.simpleAuth, auth.requireLogin, auth.requireLogin, emails.add, function(req, res) {
});
router.post('/emails/addEmail', auth.simpleAuth, auth.requireLogin, auth.requireLogin, emails.addPost, function(req, res) {
});

/* UPDATE EMAIL. -------------------------------*/
router.get('/emails/updateEmail/:id', auth.simpleAuth, auth.requireLogin, auth.requireLogin, emails.update, function(req, res) {
});
router.post('/emails/updateEmail', auth.simpleAuth, auth.requireLogin, auth.requireLogin, emails.updatePost, function(req, res) {
});

/* DELETE EMAIL. */
router.get('/emails/showEmails/:id', auth.simpleAuth, auth.requireLogin, auth.requireLogin, emails.delete, function(req, res) {
});





/* SHOW ALL AlertGroups and Alerts. */
router.get('/alertGroups/showAlertGroups', auth.simpleAuth, auth.requireLogin, showAlertsAndGroups.show, function(req, res, next) {
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
//router.get('/alerts/showAlerts', auth.simpleAuth, auth.requireLogin, alerts.show, function(req, res, next) {
//});

/* CREATE Alert. -------------------------------*/
router.get('/alerts/createAlert', auth.simpleAuth, auth.requireLogin, alerts.create, function(req, res) {
});
router.post('/alerts/createAlert', auth.simpleAuth, auth.requireLogin, alerts.createPost, function(req, res) {
});


/* UPDATE Alerts. -------------------------------*/
router.get('/alerts/updateAlerts/:id', auth.simpleAuth, auth.requireLogin, alerts.update, function(req, res) {
});
router.post('/alerts/updateAlerts', auth.simpleAuth, auth.requireLogin, alerts.updatePost, function(req, res) {
});



/* GENERAL PROCEDURE Alerts. -------------------------------*/
router.get('/alerts/procedure/:id', auth.simpleAuth, auth.requireLogin, alerts.procedure, function(req, res) {
});
router.post('/alerts/procedure', auth.simpleAuth, auth.requireLogin, alerts.procedurePost, function(req, res) {
});
/* SPECIFIC PROCEDURE Alerts. -------------------------------*/
router.get('/alerts/specificProcedure/:id/:roomID', auth.simpleAuth, auth.requireLogin, alerts.specificProcedure, function(req, res) {
});
router.post('/alerts/specificProcedure', auth.simpleAuth, auth.requireLogin, alerts.specificProcedurePost, function(req, res) {
});


/* SHOW SoftDelete ALERTS. (ADD Alerts)*/
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



/* SHOW Alert Road. */
router.get('/alerts/showRoad/:id', auth.simpleAuth, auth.requireLogin, alertRoad.show, function(req, res, next) {
});

/* CREATE AlertRoadStep. -------------------------------*/
router.get('/AlertRoadStep/:id', auth.simpleAuth, auth.requireLogin, alertRoad.createStep, function(req, res) {
});
router.post('/AlertRoadStep', auth.simpleAuth, auth.requireLogin, alertRoad.createStepPost, function(req, res) {
});
/* UPDATE AlertRoadStep. -------------------------------*/
router.get('/AlertRoadStep/update/:alert_id/:step_id', auth.simpleAuth, auth.requireLogin, alertRoad.updateStep, function(req, res) {
});
router.post('/AlertRoadStep/update', auth.simpleAuth, auth.requireLogin, alertRoad.updateStepPost, function(req, res) {
});
/* DELETE AlertRoadStep. */
router.get('/AlertRoadStep/delete/:alert_id/:step_id', auth.simpleAuth, auth.requireLogin, alertRoad.deleteStep, function(req, res) {
});



/* CREATE AlertRoadFunctions. -------------------------------*/
router.get('/AlertRoadFunctions/:id', auth.simpleAuth, auth.requireLogin, alertRoad.createFunctions, function(req, res) {
});
router.post('/AlertRoadFunctions', auth.simpleAuth, auth.requireLogin, alertRoad.createFunctionsPost, function(req, res) {
});
/* UPDATE AlertRoadFunctions. -------------------------------*/
router.get('/AlertRoadFunctions/update/:alert_id/:function_id', auth.simpleAuth, auth.requireLogin, alertRoad.updateFunctions, function(req, res) {
});
router.post('/AlertRoadFunctions/update', auth.simpleAuth, auth.requireLogin, alertRoad.updateFunctionsPost, function(req, res) {
});
/* DELETE AlertRoadFunctions. */
router.get('/AlertRoadFunctions/delete/:alert_id/:function_id', auth.simpleAuth, auth.requireLogin, alertRoad.deleteFunction, function(req, res) {
});


/* CREATE AlertRoadRedirection. -------------------------------*/
router.get('/AlertRoadRedirection/:id', auth.simpleAuth, auth.requireLogin, alertRoad.createRedirection, function(req, res) {
});
router.post('/AlertRoadRedirection', auth.simpleAuth, auth.requireLogin, alertRoad.createRedirectionPost, function(req, res) {
});
/* UPDATE AlertRoadRedirection. -------------------------------*/
router.get('/AlertRoadRedirection/update/:alert_id/:function_id', auth.simpleAuth, auth.requireLogin, alertRoad.updateRedirection, function(req, res) {
});
router.post('/AlertRoadRedirection/update', auth.simpleAuth, auth.requireLogin, alertRoad.updateRedirectionPost, function(req, res) {
});
/* DELETE AlertRoadRedirection. */
router.get('/AlertRoadRedirection/delete/:alert_id/:function_id', auth.simpleAuth, auth.requireLogin, alertRoad.deleteRedirection, function(req, res) {
});



/* SHOW ALERT PERMISSIONS TABLE. WHO CAN SEND/RECEIVE ALERTS---------------------------------------------------*/

router.get('/alerts/showAlertPermissionsTableRealDrill', auth.simpleAuth, auth.requireLogin, alertsPermissionsTable.showRealDrill, function(req, res) {
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



/* TOP NAVIGATION BUTTONS. */
/* backup. */
router.get('/inProgressBackup/:type', auth.simpleAuth, auth.requireLogin, backup.inProgressBackup, function(req, res, next) {
});
router.post('/manualBackupPost', auth.simpleAuth, auth.requireLogin, backup.manualBackupPost, function(req, res, next) {
});
router.get('/backupResp/:message', auth.simpleAuth, auth.requireLogin, backup.backupResp, function(req, res, next) {
});

/* restore*/
router.get('/restore/showBackups', auth.simpleAuth, auth.requireLogin, backup.showBackups, function(req, res, next) {
});
router.post('/restore/restoreBackup', auth.simpleAuth, auth.requireLogin, backup.restoreBackupPost, function(req, res, next) {
});

/* SHOW REPORTS. */
router.get('/reports/homeReports', auth.simpleAuth, auth.requireLogin, reports.homeReports, function(req, res, next) {
});
/* SHOW REPORTS Archived. */
router.get('/reports/showArchived', auth.simpleAuth, auth.requireLogin, reports.reportsArchived, function(req, res, next) {
});
/* SHOW REPORTS TrashReports. */
router.get('/reports/showTrashReports', auth.simpleAuth, auth.requireLogin, reports.reportsTrash, function(req, res, next) {
});
// show Reports DETAILS-------------------------------
router.get('/reports/showReportsDetails/:id/:fromWhere', auth.simpleAuth, auth.requireLogin, reports.reportsDetails, function(req, res) {
});


// helpers -------------------------------
router.post('/iWillHelp', auth.simpleAuth, auth.requireLogin, receiveAlert.helpers, function(req, res) {
});



/* UPDATE Report STATUS  ---------------------------------------------------*/
router.post('/reportStatus', auth.simpleAuth, auth.requireLogin, reports.updateStatus, function(req, res) {
});
router.post('/reportStatusReopen', auth.simpleAuth, auth.requireLogin, reports.updateStatusReopen, function(req, res) {
});
/*  Move Alerts to Archive.  ---------------------------------------------------*/
router.post('/moveToArchiveInboxTrash', auth.simpleAuth, auth.requireLogin, reports.moveToArchiveInboxTrash, function(req, res) {
});

/* SHOW ALERT REPORTS Received. */ /* to delete /*
router.get('/reports/showReportsReceived/:id', auth.simpleAuth, auth.requireLogin, reports.reportsUsers,function(req, res) {
});
*/

/* PARENTS SELF REGISTRATION. */
router.get('/parentsSelfRegistration/defaultForm', auth.simpleAuth, auth.requireLogin, parentsSelfRegistration.defaultForm, function(req, res, next) {
});
router.post('/parentsSelfRegistration/defaultForm', auth.simpleAuth, auth.requireLogin, parentsSelfRegistration.defaultFormPost, function(req, res) {
});

router.get('/parentsSelfRegistration/registerParentStep1', auth.simpleAuth, auth.requireLogin, parentsSelfRegistration.registerParentStep1, function(req, res, next) {
});
router.post('/parentsSelfRegistration/registerParentStep1', auth.simpleAuth, auth.requireLogin, parentsSelfRegistration.registerParentStep1Post, function(req, res) {
});

//router.get('/parentsSelfRegistration/addPhoto/:id', auth.simpleAuth, auth.requireLogin, parentsSelfRegistration.addUpdatePhoto, function (req, res){
//});


/* SHOW BUILDING FLOORS ROOM. */
router.get('/buildingFloorRoom/show', auth.simpleAuth, auth.requireLogin, building.show, function(req, res, next) {
});

/* ADD Building. -------------------------------*/
router.get('/building/add', auth.simpleAuth, auth.requireLogin, building.add, function(req, res) {
});
router.post('/building/add', auth.simpleAuth, auth.requireLogin, building.addPost, function(req, res) {
});

/* UPDATE Building. -------------------------------*/
router.get('/building/update/:id', auth.simpleAuth, auth.requireLogin, building.update, function(req, res) {
});
router.post('/building/update/', auth.simpleAuth, auth.requireLogin, building.updatePost, function(req, res) {
});

/* DELETE Building. */
router.get('/building/delete/:id', auth.simpleAuth, auth.requireLogin, building.delete, function(req, res) {
});

/* ADD Floor. -------------------------------*/
router.get('/floor/add', auth.simpleAuth, auth.requireLogin, floors.add, function(req, res) {
});
router.post('/floor/add', auth.simpleAuth, auth.requireLogin, floors.addPost, function(req, res) {
});
/* UPDATE Floor. -------------------------------*/
router.get('/floor/update/:id', auth.simpleAuth, auth.requireLogin, floors.update, function(req, res) {
});
router.post('/floor/update/', auth.simpleAuth, auth.requireLogin, floors.updatePost, function(req, res) {
});

/* DELETE Floor. */
router.get('/floor/delete/:id', auth.simpleAuth, auth.requireLogin, floors.delete, function(req, res) {
});



//--ADD or CHANGE FLOOR PLAN -------------------------------------
router.get('/floor/addFloorPlan/:id', auth.simpleAuth, auth.requireLogin, floors.addUpdateFloorPlan, function (req, res){
});
router.post('/floor/addFloorPlan/:id', auth.simpleAuth, auth.requireLogin, floors.addUpdateFloorPlanPost, function (req, res){
});

// delete FLOOR PLAN------------------
router.get('/floor/deleteFloorPlan/:id', auth.simpleAuth, auth.requireLogin, floors.deleteFloorPlan, function(req, res) {
});


/* ADD Room. -------------------------------*/
router.get('/room/add', auth.simpleAuth, auth.requireLogin, rooms.add, function(req, res) {
});
router.post('/room/add', auth.simpleAuth, auth.requireLogin, rooms.addPost, function(req, res) {
});
/* UPDATE Room. -------------------------------*/
router.get('/room/update/:id', auth.simpleAuth, auth.requireLogin, rooms.update, function(req, res) {
});
router.post('/room/update/', auth.simpleAuth, auth.requireLogin, rooms.updatePost, function(req, res) {
});

/* DELETE Room. */
router.get('/room/delete/:id', auth.simpleAuth, auth.requireLogin, rooms.delete, function(req, res) {
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
router.get('/medical/showMedical/:modelType', auth.simpleAuth, auth.requireLogin, medical.show, function(req, res, next) {
});

/* ADD MEDICAL. -------------------------------*/
router.get('/medical/addMedical/:modelType/:alertID', auth.simpleAuth, auth.requireLogin, medical.add, function(req, res) {
});
router.post('/medical/addMedical', auth.simpleAuth, auth.requireLogin, medical.addPost, function(req, res) {
});

/* UPDATE MEDICAL. -------------------------------*/
router.get('/medical/updateMedical/:id/:modelType/:alertID', auth.simpleAuth, auth.requireLogin, medical.update, function(req, res) {
});
router.post('/medical/updateMedical', auth.simpleAuth, auth.requireLogin, medical.updatePost, function(req, res) {
});

/* DELETE MEDICAL. */
router.get('/medical/deleteMedical/:id/:modelType/:alertID', auth.simpleAuth, auth.requireLogin, medical.delete, function(req, res) {
});

/* PA show Reception Users. -------------------------------*/
router.get('/pa/showPa', auth.simpleAuth, auth.requireLogin, pa.showReceptionUsers, function(req, res) {
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
router.get('/alerts/sending/chooseGroup', auth.simpleAuth, auth.requireLogin, chooseAlert.showGroups, function(req, res) {});
router.post('/alerts/sending/chooseGroup', auth.simpleAuth, auth.requireLogin, chooseAlert.showGroupsPost, function(req, res) {});

/* Send Alert - Alerts ChooseGroup buttons ON. -------------------------------*/
router.get('/alerts/sending/chooseGroupAlert/:id', auth.simpleAuth, auth.requireLogin, chooseAlert.showAlerts, function(req, res) {});
/* Send Alert - Alerts ChooseGroup buttons OFF. -------------------------------*/

router.get('/alerts/sending/chooseAlert', auth.simpleAuth, auth.requireLogin, chooseAlert.showAlerts, function(req, res) {});

router.post('/alerts/sending/chooseAlert', auth.simpleAuth, auth.requireLogin, chooseAlert.showAlertsPost, function(req, res) {});
/*-------------------------------*/

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
router.post('/alerts/sending/panic/:id', auth.simpleAuth, auth.requireLogin, reviewAlert.postReviewAlert, function(req, res) {});


/* Verify Pin. -------------------------------*/
router.get('/verifyPin/:id', auth.simpleAuth, auth.requireLogin, createAlert.verifyPinGet, function(req, res) {});
router.post('/verifyPin', auth.simpleAuth, auth.requireLogin, createAlert.verifyPinPost, function(req, res) {});
/* Create Alert. -------------------------------*/
router.get('/createAlert/:id', auth.simpleAuth, auth.requireLogin, createAlert.createAlert, function(req, res) {});
/* Update Alert. -------------------------------*/
router.get('/updateAlert/:id', auth.simpleAuth, auth.requireLogin, createAlert.updateAlert, function(req, res) {});

/* Sending Alert BACK BUTTON pressed. -------------------------------*/
router.post('/sendAlertBackButton', auth.simpleAuth, auth.requireLogin, createAlert.updateRoadIndex, function(req, res) {});

/*RECEIVING ALERTS*/

/* All Alerts -------------------------------*/
router.get('/alerts/received/receiveAlert/:id', auth.simpleAuth, auth.requireLogin, receiveAlert.receivedAlert, function(req, res, next) {});
router.post('/alerts/received/procSafeHelp', auth.simpleAuth, auth.requireLogin, receiveAlert.procSafeHelp, function(req, res) {});
router.post('/alerts/received/receivedAlert', auth.simpleAuth, auth.requireLogin, receiveAlert.postReceivedAlert, function(req, res) {});



/* All Procedures -------------------------------*/
router.get('/alerts/receiving/procedureR/:id', auth.simpleAuth, auth.requireLogin, procedureR.procedure, function(req, res) {});


/* Tab Redirect ------------------*/
router.post('/redirectTabUsers', auth.simpleAuth, auth.requireLogin, functions.redirectTabUsers, function(req, res) {});
router.post('/redirectTabAlertGroups', auth.simpleAuth, auth.requireLogin, functions.redirectTabAlertGroups, function(req, res) {});
router.post('/redirectTabBuildings', auth.simpleAuth, auth.requireLogin, functions.redirectTabBuildings, function(req, res) {});
router.post('/redirectTabProcedure', auth.simpleAuth, auth.requireLogin, functions.redirectTabProcedure, function(req, res) {});


router.post('/icons', auth.simpleAuth, auth.requireLogin, functions.useIcons, function(req, res) {});


/* SHOW Lights and PanicButtons. */
router.get('/showLightsPanicButtons', auth.simpleAuth, auth.requireLogin, showLightsAndPanicButtons.show, function(req, res, next) {
});




module.exports = router;
