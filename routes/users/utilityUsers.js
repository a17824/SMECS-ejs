//Dependencies
var async = require("async");
var formidable = require('formidable');
var util = require('util');
var fs   = require('fs-extra');
var path = require('path');
var bcrypt = require('bcryptjs');
var models = require('./../models');
var moment = require('moment');
var aclPermissions = require('./../acl/aclPermissions');

/* SHOW UTILITIES USERS. */
module.exports.show = function(req, res, next) {
    async.parallel([
        function(callback){
            models.Users.find({userRoleID: 99}).exec(callback);
        },
        function(callback){aclPermissions.showDeletedUsers(req, res, callback);},   //aclPermissions showDeletedUsers
        function(callback){aclPermissions.showUsers(req, res, callback);},          //aclPermissions showUsers
        function(callback){aclPermissions.addUsers(req, res, callback);},           //aclPermissions addUsers
        function(callback){aclPermissions.modifyUsers(req, res, callback);},        //aclPermissions modifyUsers
        function(callback){aclPermissions.deleteUsers(req, res, callback);}         //aclPermissions deleteUsers


    ],function(err, results){

        res.render('utilities/users/showUtilitiesUsers',{
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

/* SHOW SoftDeleted USERS. */
module.exports.showSoftDeleted = function(req, res, next) {
    /*
     models.UtilityUsers.find(function(err, users) {
     res.render('users/deletedUsers', { title: 'Deleted Users', users: users });
     }).sort({"firstName":1});
     */
    async.parallel([
        function(callback){
            models.UtilityUsers.find().exec(callback);
        },
        function(callback){aclPermissions.addUsers(req, res, callback);},   //aclPermissions addUsers
        function(callback){aclPermissions.eraseUsers(req, res, callback);} //aclPermissions eraseUsers

    ],function(err, results){
        //console.log(results[2]);
        res.render('utilities/users/deletedUtilitiesUsers',{
            title:'Deleted Utilities Users',
            userAuthID: req.user.userPrivilegeID,
            utilityUsers: results[0],
            aclAddUsers: results[1], //aclPermissions addUsers
            aclEraseUsers: results[2]  //aclPermissions eraseUsers
        });
    })

};
/* ------------ end of SHOW SoftDeleted USERS. */

/* ADD UTILITY USERS. ---------------------------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){aclPermissions.addUsers(req, res, callback);} //aclPermissions addUsers
    ],function(err, results){
        res.render('utilities/users/addUtilityUser',{
            title:'Add Utility User',
            userAuthID: req.user.userPrivilegeID,
            aclAddUsers: results[0] //aclPermissions addUsers
        });
    })
};

module.exports.addPost = function(req, res) {
    var hash = bcrypt.hashSync(req.body.pin, bcrypt.genSaltSync(10));
    var user1 = new models.UtilityUsers({

        email: req.body.email,
        pin: hash, //req.body.pin,
        note: req.body.note
    });
    user1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            console.log("rrrrrrrrrrrrrrrrrrrrrrrrrr");
            return res.status(409).send('showAlert')
        }else{
            console.log("11111111111111111111");
            return res.send({redirect:'/utilities/showUtilitiesUsers'})
        }
    });
};
/*-------------------------------------------end of adding utility users*/

/* UPDATE UTILITY USERS. ----------------------------------------------------------------------*/
module.exports.update = function(req, res) {
    async.parallel([
        function(callback){
            models.UtilityUsers.findById(req.params.id).exec(callback);
        },
        function(callback){aclPermissions.modifyUsers(req, res, callback);} //aclPermissions modifyUsers

    ],function(err, results){
        res.render('utilities/users/updateUtilityUser',{
            title:'Update Utility User',
            userAuthID: req.user.userPrivilegeID,
            utilityUsers: results[0],
            aclModifyUsers: results[1]  //aclPermissions modifyUsers
        });
    })
};

module.exports.updatePost = function(req, res) {
    var hash = bcrypt.hashSync(req.body.pin, bcrypt.genSaltSync(10));
    var userToUpdate1 = req.body.userToUpdate;
    models.UtilityUsers.findById({'_id': userToUpdate1}, function(err, user){
        user.email = req.body.email;
        if (req.body.pin !== "oldPin"){
            user.pin = hash; //req.body.pin;
        }
        user.note = req.body.note;
        user.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                return res.status(409).send('showAlert')
            }else{
                //UPDATE UTILITIES smecsUsers array
                var oldEmail = req.body.oldEmail;
                if (oldEmail !== req.body.email ){
                    models.Utilities.find({}, function(err, utilities) {
                        if( err || !utilities) console.log("No Utility found");
                        else utilities.forEach( function(utility) {
                            for (var i=0; i < utility.smecsUsers.length; i++ ){
                                var newArray = [];
                                if (utility.smecsUsers[i] == oldEmail){
                                    newArray = utility.smecsUsers;
                                    newArray.pull(utility.smecsUsers[i]);
                                    newArray.push(req.body.email);
                                    utility.smecsUsers = newArray;
                                    utility.save();
                                }
                            }
                        });

                    });
                }
                //--------end of UPDATE UTILITIES smecsUsers array

                return res.send({redirect:'/utilities/showUtilitiesUsers'})
            }
        });
    });



};
/*---------------------------------------------------------------end of update utility users*/

/* SoftDeleted USERS. */
module.exports.softDelete = function(req, res) {
    var userToSoftDelete = req.params.id;
//console.log(req.body.userRoleID);
    models.UtilityUsers.findById({'_id': userToSoftDelete}, function(err, user){
        var flag = 0; // flag = 0 user can be deleted; flag = 1 user can't be deleted
        models.Utilities.find({}, function(err, utilities) {
            if( err ) console.log("No Utility found");
            else utilities.forEach( function(utility) {
                for (var i=0; i < utility.smecsUsers.length; i++ ){
                    if (utility.smecsUsers[i] == user.email) {
                        console.log("User NOT deleted");
                        flag = 1;
                        return res.status(409).send(' ALERT! ' + user.email + ' not deleted because there are Utilities using this user contact to login in SMECS APP. Please, remove user from: "' + utility.utilityName + '" first.');
                    }
                }
            });
            if (flag == 0){
                console.log('deleted user: ' + user.email);
                var whoDeleted = req.session.user.firstName + " " + req.session.user.lastName;
                var wrapped = moment(new Date());
                console.log(wrapped.format('YYYY-MM-DD, h:mm:ss a"'));
                console.log('who deleted: ' + req.session.user.firstName + " " + req.session.user.lastName);
                user.softDeleted = wrapped.format('YYYY-MM-DD, h:mm:ss a') + "  by " + whoDeleted;
                user.save();
                res.redirect('/utilities/showUtilitiesUsers');
            }
        });
    })
};
/* ------------ end of SoftDeleted USERS. */

/* Restore SoftDeleted USERS. */
module.exports.restoreUser = function(req, res) {
    console.log(req.params.id);
    var userToRestore = req.params.id;

    models.UtilityUsers.findById({'_id': userToRestore}, function(err, user){
        user.softDeleted = null;
        user.save();
        res.redirect('/utilities/deletedUtilityUsers');
    })
};
/* ------------ end of SoftDeleted USERS. */



/* ERASE UTILITY USERS. */
module.exports.erase = function(req, res) {
    var userToDelete = req.params.id;
    models.UtilityUsers.remove({'_id': userToDelete}, function(err) {
        res.redirect('/utilities/deletedUtilityUsers');
    });
};
/* ------------ end of ERASE UTILITY USERS. */




/* SHOW/UPDATE/DELETE UTILITy USERS. */
module.exports.showUtilityUsers = function(req, res, next) {
    async.parallel([
        function(callback){
            models.Utilities.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.Users.find({userRoleID: 99}).exec(callback);
        },
        function(callback){aclPermissions.showDeletedUsers(req, res, callback);},   //aclPermissions showDeletedUsers
        function(callback){aclPermissions.showUsers(req, res, callback);},          //aclPermissions showUsers
        function(callback){aclPermissions.addUsers(req, res, callback);},           //aclPermissions addUsers
        function(callback){aclPermissions.modifyUsers(req, res, callback);},        //aclPermissions modifyUsers
        function(callback){aclPermissions.deleteUsers(req, res, callback);}         //aclPermissions deleteUsers


    ],function(err, results){
        //console.log(results[2]);
        res.render('utilities/users/crudUtilityUsers',{
            title: results[0].utilityName + ' Users',
            utility: results[0],
            allUtilUsers: results[1],
            userAuthID: req.user.userPrivilegeID,
            aclShowDeletedUsers: results[2], //aclPermissions showDeletedUsers
            aclShowUsers: results[3], //aclPermissions showUsers
            aclAddUsers: results[4], //aclPermissions addUsers
            aclModifyUsers: results[5],  //aclPermissions modifyUsers
            aclDeleteUsers: results[6]  //aclPermissions deleteUsers
        });
    })
};
module.exports.updateUtilityUsersPost = function(req, res) {
    var utilityToUpdate1 = req.body.utilityToUpdate;
    models.Utilities.findById({'_id': utilityToUpdate1}, function(err, utility){
        utility.smecsUsers = req.body.smecsUsers;
        if (utility.smecsUsers === undefined || utility.smecsUsers.length < 1){ //put radio button off if array is empty
            utility.smecsApp = 'false';
        }
        utility.save();
        return res.send({redirect:'/utilities/showUtilities'})
    });
};
/*-------------------------end of SHOW/UPDATE/DELETE UtilityUsers*/