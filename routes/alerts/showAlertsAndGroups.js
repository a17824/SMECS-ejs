//Dependencies
var models = require('./../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var functions = require('./../functions');

/* SHOW ALL AlertGroups. */
module.exports.show = function(req, res, next) {
    async.parallel([
        function(callback){
            models.AlertsGroup.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){
            models.Alerts.find().sort({"sortID":1}).sort({"sortID":1}).exec(callback);
        },
        function(callback){models.Icons.findById('5afcab36dcba311ccc719b0a').exec(callback);},
        function(callback){aclPermissions.addAlertGroup(req, res, callback);},   //aclPermissions addAlertGroup
        function(callback){aclPermissions.modifyAlertGroup(req, res, callback);},   //aclPermissions modifyAlertGroup
        function(callback){aclPermissions.deleteAlertGroup(req, res, callback);},   //aclPermissions deleteAlertGroup
        function(callback){aclPermissions.addAlerts(req, res, callback);},   //aclPermissions addAlerts
        function(callback){aclPermissions.modifyAlert(req, res, callback);},   //aclPermissions modifyAlert
        function(callback){aclPermissions.deleteAlert(req, res, callback);},   //aclPermissions deleteAlert
        function(callback){aclPermissions.showProcedure(req, res, callback);},   //aclPermissions showProcedure
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectPage(req, res, 'showAlertsAndGroups');
        functions.redirectTabUsers(req, res, 'showUsers');

        res.render('alertsAndGroups/showAlertsAndGroups',{
            title:'Alert & Groups',
            userAuthID: req.user.userPrivilegeID,
            alertGroup: results[0],
            alert: results[1],
            useGroupIcons: results[2].useAlertGroupIcons,
            useAlertsIcons: results[2].useAlertsIcons,
            aclAddAlertGroup: results[3], //aclPermissions addAlertGroup
            aclModifyAlertGroup: results[4], //aclPermissions modifyAlertGroup
            aclDeleteAlertGroup: results[5], //aclPermissions deleteAlertGroup
            aclAddAlert: results[6], //aclPermissions addAlerts
            aclModifyAlert: results[7], //aclPermissions modifyAlert
            aclDeleteAlert: results[8], //aclPermissions deleteAlert
            aclShowProcedure: results[9], //aclPermissions showProcedure
            aclSideMenu: results[10][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo,
            redirectTab: req.user.redirectTabAlertGroups

        });
    })
};
