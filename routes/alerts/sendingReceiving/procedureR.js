//Dependencies
var models = require('./../../models');
var async = require("async");
var functions = require('./../../functions');

/* PROCEDURE Alerts. -------------------------------*/
module.exports.procedure = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertSentInfo.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.Alerts.find().exec(callback);
        },
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        res.render('alerts/receiving/procedureR',{
            title:'Procedure',
            userAuthID: req.user.userPrivilegeID,
            info: results[0],
            alert: results[1],
            aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo

        });
    })

};
