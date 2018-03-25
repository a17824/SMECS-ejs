//Dependencies
var models = require('./models');
var async = require("async");
var aclPermissions = require('./acl/aclPermissions');

//REDIRECT TO PREVIOUS PAGE
module.exports.redirect = function(req, res, page) {
    models.Users.findOneAndUpdate({_id: req.user.id}, {$set:{redirect:page}}, {new: true}, function(err, doc){
        if(err){
            console.log("Something wrong when updating user.redirect!");
        }
        console.log('successfully updated user.redirect');
    });
};

//SIDE MENU PERMISSIONS
module.exports.aclSideMenu = function(req, res, callback) {
    async.parallel([
        function(callback){aclPermissions.showUsers(req, res, callback);},              //aclPermissions showUsers
        function(callback){aclPermissions.showStudents(req, res, callback);},           //aclPermissions showStudents
        function(callback){aclPermissions.showReports(req, res, callback);},            //aclPermissions showAlertsReports
        function(callback){aclPermissions.showAlertGroups(req, res, callback);},        //aclPermissions showAlertGroups
        function(callback){aclPermissions.showAlerts(req, res, callback);},             //aclPermissions showAlerts
        function(callback){aclPermissions.showAlertsTable(req, res, callback);},        //aclPermissions showAlertsTable
        function(callback){aclPermissions.showRoles2(req, res, callback);},             //aclPermissions showRoles2
        function(callback){aclPermissions.showPrivilege(req, res, callback);},          //aclPermissions showPrivilege
        function(callback){aclPermissions.showPermissions(req, res, callback);},        //aclPermissions showPermissions
        function(callback){aclPermissions.showPermissionsTable(req, res, callback);},   //aclPermissions showPermissionsTable
        function(callback){aclPermissions.showFloors(req, res, callback);},             //aclPermissions showFloors
        function(callback){aclPermissions.showRooms(req, res, callback);},             //aclPermissions showRooms
        function(callback){aclPermissions.showUtilities(req, res, callback);},          //aclPermissions showUtilities
        function(callback){aclPermissions.showMedical(req, res, callback);},            //aclPermissions showMedical
        function(callback){aclPermissions.showPAUsers(req, res, callback);},            //aclPermissions showPAUsers
        function(callback){aclPermissions.showPAPreRecorded(req, res, callback);}

    ],function(err, results){

        var show = {
            users: results[0],
            students: results[1],
            reports: results[2],
            alertGroups: results[3],
            alerts: results[4],
            alertsTable: results[5],
            roles2: results[6],
            privilege: results[7],
            permissions: results[8],
            permissionsTable: results[9],
            floors: results[10],
            rooms: results[11],
            utilities: results[12],
            medical: results[13],
            pAUsers: results[14],
            pAPreRecorded: results[15]
        };
        callback(show);
    })
};