//Dependencies
var models = require('./../models');


/**
 * STATIC values that can't be change:
 *
 * ('permissionName' in Permissions COLLECTION)
 *                 'Add Alert' --> is being used in "showPermissionsTable.ejs"
 *                 'Show Permissions'  --> is being used in "showPermissionsTable.ejs"
 *                 'Add Permission'  --> is being used in "showPermissionsTable.ejs"
 *                 'Modify Permission'  --> is being used in "showPermissionsTable.ejs"
 *                 'Delete Permission'  --> is being used in "showPermissionsTable.ejs"
 *                 'Show Privileges'  --> is being used in "showPermissionsTable.ejs"
 *                 'Add Privileges'  --> is being used in "showPermissionsTable.ejs"
 *                 'Modify Privileges'  --> is being used in "showPermissionsTable.ejs"
 *                 'Delete Privileges'  --> is being used in "showPermissionsTable.ejs"
 *  ('privilegeID' in Privilege COLLECTION)
 *                 all 'privilegeID'  --> are being used in "showPermissionsTable.ejs" (as 'userAuthID' < 'privilege.privilegeID')
 *
 *
 *
 *
 */





//showUsers ID = 1
module.exports.showUsers = function(req, res, callback) {
    var id = 1;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//showDeletedUsers ID = 2
module.exports.showDeletedUsers = function(req, res, callback) {
    var id = 2;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//addUsers ID = 3
module.exports.addUsers = function(req, res, callback) {
    var id = 3;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//modifyUsers ID = 4
module.exports.modifyUsers = function(req, res, callback) {
    var id = 4;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//deleteUsers ID = 5
module.exports.deleteUsers = function(req, res, callback) {
    var id = 5;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//eraseUsers ID = 6
module.exports.eraseUsers = function(req, res, callback) {
    var id = 6;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//showStudents ID = 7
module.exports.showStudents = function(req, res, callback) {
    var id = 7;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//addStudent ID = 8
module.exports.addStudent = function(req, res, callback) {
    var id = 8;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//addMultiStudent ID = 9
module.exports.addMultiStudent = function(req, res, callback) {
    var id = 9;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//modifyStudent ID = 10
module.exports.modifyStudent = function(req, res, callback) {
    var id = 10;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//deleteStudent ID = 11
module.exports.deleteStudent = function(req, res, callback) {
    var id = 11;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//showAlertGroups ID = 12
module.exports.showAlertGroups = function(req, res, callback) {
    var id = 12;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//addAlertGroup ID = 13
module.exports.addAlertGroup = function(req, res, callback) {
    var id = 13;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//modifyAlertGroup ID = 14
module.exports.modifyAlertGroup = function(req, res, callback) {
    var id = 14;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//deleteAlertGroup ID = 15
module.exports.deleteAlertGroup = function(req, res, callback) {
    var id = 15;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//showAlerts ID = 16
module.exports.showAlerts = function(req, res, callback) {
    var id = 16;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//addAlerts ID = 17
module.exports.addAlerts = function(req, res, callback) {
    var id = 17;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//modifyAlert ID = 18
module.exports.modifyAlert = function(req, res, callback) {
    var id = 18;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//deleteAlert ID = 19
module.exports.deleteAlert = function(req, res, callback) {
    var id = 19;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//showProcedures ID = 20
module.exports.showProcedure = function(req, res, callback) {
    var id = 20;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//ModifyAlertProcedure ID = 21
module.exports.modifyProcedure = function(req, res, callback) {
    var id = 21;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//showAlertsTable ID = 22
module.exports.showAlertsTable = function(req, res, callback) {
    var id = 22;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//modifyAlertsTable ID = 23
module.exports.modifyAlertsTable = function(req, res, callback) {
    var id = 23;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//showReports ID = 24
module.exports.showReports = function(req, res, callback) {
    var id = 24;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//clearReports ID = 25
module.exports.clearReports = function(req, res, callback) {
    var id = 25;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//deleteReports ID = 26
module.exports.deleteReports = function(req, res, callback) {
    var id = 26;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//showPrivilege ID = 27
module.exports.showPrivilege = function(req, res, callback) {
    var id = 27;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//addPrivilege ID = 28
module.exports.addPrivilege = function(req, res, callback) {
    var id = 28;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//modifyPrivilege ID = 29
module.exports.modifyPrivilege = function(req, res, callback) {
    var id = 29;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//deletePrivilege ID = 30
module.exports.deletePrivilege = function(req, res, callback) {
    var id = 30;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
}

//showRoles2 ID = 31
module.exports.showRoles2 = function(req, res, callback) {
    var id = 31;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//addRoles2 ID = 32
module.exports.addRoles2 = function(req, res, callback) {
    var id = 32;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//modifyRoles2 ID = 33
module.exports.modifyRoles2 = function(req, res, callback) {
    var id = 33;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//deleteRoles2 ID = 34
module.exports.deleteRoles2 = function(req, res, callback) {
    var id = 34;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

;

//showPermissions ID = 35
module.exports.showPermissions = function(req, res, callback) {
    var id = 35;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//addPermissions ID = 36
module.exports.addPermissions = function(req, res, callback) {
    var id = 36;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//modifyPermissions ID = 37
module.exports.modifyPermissions = function(req, res, callback) {
    var id = 37;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//deletePermissions ID = 38
module.exports.deletePermissions = function(req, res, callback) {
    var id = 38;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//showPermissionsTable ID = 39
module.exports.showPermissionsTable = function(req, res, callback) {
    var id = 39;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//modifyPermissionsTable ID = 40
module.exports.modifyPermissionsTable = function(req, res, callback) {
    var id = 40
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//showFloors ID = 41
module.exports.showFloors = function(req, res, callback) {
    var id = 41;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//addFloor ID = 42
module.exports.addFloor = function(req, res, callback) {
    var id = 42;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//modifyFloor ID = 43
module.exports.modifyFloor = function(req, res, callback) {
    var id = 43;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//deleteFloor ID = 44
module.exports.deleteFloor = function(req, res, callback) {
    var id = 44
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//showUtilities ID = 45
module.exports.showUtilities = function(req, res, callback) {
    var id = 45;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//addUtilities ID = 46
module.exports.addUtilities = function(req, res, callback) {
    var id = 46;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//modifyUtilities ID = 47
module.exports.modifyUtilities = function(req, res, callback) {
    var id = 47;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//deleteUtilities ID = 48
module.exports.deleteUtilities = function(req, res, callback) {
    var id = 48;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//showMedical ID = 49
module.exports.showMedical = function(req, res, callback) {
    var id = 49;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//addMedical ID = 50
module.exports.addMedical = function(req, res, callback) {
    var id = 50;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//modifyMedical ID = 51
module.exports.modifyMedical = function(req, res, callback) {
    var id = 51;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//deleteMedical ID = 52
module.exports.deleteMedical = function(req, res, callback) {
    var id = 52;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};


//showRooms ID = 56
module.exports.showRooms = function(req, res, callback) {
    var id = 56;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//addRooms ID = 57
module.exports.addRooms = function(req, res, callback) {
    var id = 57;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//modifyRoom ID = 18
module.exports.modifyRoom = function(req, res, callback) {
    var id = 58;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//deleteRoom ID = 59
module.exports.deleteRoom = function(req, res, callback) {
    var id = 59;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};


//Show PA Users ID = 53
module.exports.showPAUsers = function(req, res, callback) {
    var id = 53;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//Modify(Add/Delete) PA User ID = 54
module.exports.modifyPAUser = function(req, res, callback) {
    var id = 54;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//show PA Pre Recorded ID = 55
module.exports.showPAPreRecorded = function(req, res, callback) {
    var id = 55;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//add PA Pre Recorded ID = 60
module.exports.addPAPreRecorded = function(req, res, callback) {
    var id = 60;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//modify PA Pre Recorded ID = 61
module.exports.modifyPAPreRecorded = function(req, res, callback) {
    var id = 61;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};

//delete PA Pre Recorded ID = 62
module.exports.deletePAPreRecorded = function(req, res, callback) {
    var id = 62;
    models.AclPermissions.findOne({"checkBoxID": req.user.userPrivilegeID+''+id}).exec(callback);
};



                        /* LAST ID IS:  */