//Dependencies
var async = require("async");
var models = require('./../models');
var aclPermissions = require('./../acl/aclPermissions');
var functions = require('./../functions');


/* SHOW PERMISSIONS TABLE. ---------------------------------------------------*/
module.exports.show = function(req, res) {

    async.parallel([
        function(callback){models.Privilege.count(function(err, count){}).exec(callback);
        },
        function(callback){
            models.Privilege.find().sort({"privilegeID":1}).exec(callback);
        },
        function(callback){
            models.PermissionsGroup.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){
            models.Permissions.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){                                                             //pass all checkbox database to ejs
            models.AclPermissions.find().exec(callback);
        },
        function(callback){aclPermissions.showPermissionsTable(req, res, callback);},   //aclPermissions showPermissionsTable
        function(callback){aclPermissions.modifyPermissionsTable(req, res, callback);},  //aclPermissions modifyPermissionsTable
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        if (results[5].checkBoxValue == false) {
            console.log(err);
            console.log('No Permission');
            req.flash('error_messages', 'No permission to show "Permissions Table page" ');
            res.redirect('/dashboard');
        }
        else {
            functions.redirectTabUsers(req, res, 'showUsers');
            res.render('permissions/showPermissionsTable', {
                title: 'Permissions Table',
                userAuthID: req.user.userPrivilegeID,
                privilegeCount: results[0],
                privilege: results[1],
                permissionsGroup: results[2],
                permissions: results[3],
                aclPermissions: results[4],             //pass all checkbox database to ejs
                aclShowPermissionsTable: results[5],    //aclPermissions showPermissionsTable
                aclModifyPermissionsTable: results[6],        //aclPermissions modifyPermissionsTable
                aclSideMenu: results[7],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        }
    })
};

//saving PERMISSION Table checkBox value to AclPremissions database------------------------
module.exports.savePost = function(req, res) {

    var searchIDsChecked = req.body.searchIDsChecked;
    var searchIDsNotChecked = req.body.searchIDsNotChecked;

    if (searchIDsChecked != null ){
        for (var i=0; i<searchIDsChecked.length; i++) {
            models.AclPermissions.findOne({"checkBoxID": {"$in": searchIDsChecked[i]}}).exec(function (err, check) {
                check.checkBoxValue = true;
                check.save();
            });
        }
    }
    if (searchIDsNotChecked != null){
        for (var i=0; i<searchIDsNotChecked.length; i++) {
            models.AclPermissions.findOne({"checkBoxID": {"$in": searchIDsNotChecked[i]}}).exec(function (err, check) {
                check.checkBoxValue = false;
                check.save();
            });
        }
    }
};

//-------------------------------------------end of saving PERMISSION Table checkBox value to AclPremissions database