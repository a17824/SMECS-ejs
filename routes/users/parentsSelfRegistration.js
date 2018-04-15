var util = require('util');
var fs   = require('fs-extra');
var path = require('path');
var bcrypt = require('bcryptjs');
var models = require('./../models');
var moment = require('moment');
var aclPermissions = require('./../acl/aclPermissions');

/* update parentsSelfRegistration. */
module.exports.update = function(req, res, next) {
    async.parallel([
        function(callback){
            models.ParentSelfRegistration.find().exec(callback);
        },
        function(callback){aclPermissions.showDeletedUsers(req, res, callback);},   //aclPermissions showDeletedUsers
        function(callback){aclPermissions.showUsers(req, res, callback);},          //aclPermissions showUsers
        function(callback){aclPermissions.addUsers(req, res, callback);},           //aclPermissions addUsers
        function(callback){aclPermissions.modifyUsers(req, res, callback);},        //aclPermissions modifyUsers
        function(callback){aclPermissions.deleteUsers(req, res, callback);}         //aclPermissions deleteUsers


    ],function(err, results){
        //console.log(results[2]);
        res.render('parentsSelfRegistration',{
            title:'Utilities Users',
            utilityUsers: results[0],
            userAuthID: req.user.userPrivilegeID,
            aclShowDeletedUsers: results[1], //aclPermissions showDeletedUsers
            aclShowUsers: results[2], //aclPermissions showUsers
            aclAddUsers: results[3], //aclPermissions addUsers
            aclModifyUsers: results[4],  //aclPermissions modifyUsers
            aclDeleteUsers: results[5]  //aclPermissions deleteUsers
        });
    })
};

module.exports.updatePost = function(req, res) {

    var userToUpdate = req.body.studentToUpdate;

    models.ParentSelfRegistration.findById({'_id': userToUpdate}, function(err, user){
        if (err) {
            console.log('POST - something wrong updating App Settings');
        }else{

        }
        return res.send({redirect: '/users/showUsers'})
    });
};