//Dependencies
var models = require('./../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var functions = require('./../functions');

/* SHOW ALL AlertGroups. */
module.exports.show = function(req, res, next) {
    async.parallel([
        function(callback){
            models.Lights.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){
            models.PanicButtons.find().sort({"sortID":1}).sort({"sortID":1}).exec(callback);
        },
        function(callback){aclPermissions.modifyAlert(req, res, callback);},   //aclPermissions modifyAlert
        function(callback){aclPermissions.deleteAlert(req, res, callback);},   //aclPermissions deleteAlert
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectPage(req, res, 'showLightPanicButtons');
        functions.redirectTabUsers(req, res, 'showUsers');

        res.render('lightsAndPanicButtons/showLightsAndPanicButtons',{
            title:'Lights & PanicButtons',
            lights: results[0],
            panicButtons: results[1],
            aclModifyAlert: results[2], //aclPermissions modifyAlert
            aclDeleteAlert: results[3], //aclPermissions deleteAlert
            aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthID: req.user.userPrivilegeID,
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo,
            redirectTab: req.user.redirectTabAlertGroups

        });
    })
};
