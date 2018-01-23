//Dependencies
var models = require('./models');
var async = require("async");
var aclPermissions = require('./acl/aclPermissions');



/* SHOW DASHBOARD. */
module.exports.show = function(req, res, next) {
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
            function(callback){aclPermissions.showPAPreRecorded(req, res, callback);},        //aclPermissions showPAPreRecorded
            function(callback){
                models.UtilityUsers.find().exec(callback);
            }

        ],function(err, results){

            //res.status('dashboard').json({
            res.render('dashboard',{
                userAuthName: req.user.firstName,
                aclShowUsers: results[0],               //aclPermissions showUsers
                aclShowStudents: results[1],            //aclPermissions showStudents
                aclShowReports: results[2],             //aclPermissions showAlertsReports
                aclShowAlertGroups: results[3],         //aclPermissions showAlertGroups
                aclShowAlerts: results[4],              //aclPermissions showAlerts
                aclShowAlertsTable: results[5],         //aclPermissions showAlertsTable
                aclShowRoles2: results[6],              //aclPermissions showRoles2
                aclShowPrivilege: results[7],           //aclPermissions showPrivilege
                aclShowPermissions: results[8],         //aclPermissions showPermissions
                aclShowPermissionsTable: results[9],    //aclPermissions showPermissionsTable
                aclShowFloors: results[10],             //aclPermissions showFloors
                aclShowRooms: results[11],              //aclPermissions showFloors
                aclShowUtilities: results[12],          //aclPermissions showUtilities
                aclShowMedical: results[13],            //aclPermissions showMedical
                showPAUsers: results[14],               //aclPermissions showPAUsers
                aclShowPAPreRecorded: results[15],      //aclPermissions showPAPreRecorded
                utilityUsers: results[16],
                userAuthEmail: req.user.email
            });

        })

};
