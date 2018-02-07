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

/* SHOW Active USERS. */
module.exports.show = function(req, res, next) {
    /*
    models.Users.find(function(err, users) {
        //res.json(users);
        res.render('users/showUsers', { title: 'USERS', users: users });
    }).sort({"firstName":1});
*/
    async.parallel([
        function(callback){
            models.Users.find().sort({"firstName":1}).exec(callback);
        },
        function(callback){aclPermissions.showDeletedUsers(req, res, callback);},   //aclPermissions showDeletedUsers
        function(callback){aclPermissions.showUsers(req, res, callback);},          //aclPermissions showUsers
        function(callback){aclPermissions.addUsers(req, res, callback);},           //aclPermissions addUsers
        function(callback){aclPermissions.modifyUsers(req, res, callback);},        //aclPermissions modifyUsers
        function(callback){aclPermissions.deleteUsers(req, res, callback);}         //aclPermissions deleteUsers


    ],function(err, results){

        res.render('users/showUsers',{
            title:'USERS',
            users: results[0],
            userAuthID: req.user.userPrivilegeID,
            aclShowDeletedUsers: results[1], //aclPermissions showDeletedUsers
            aclShowUsers: results[2], //aclPermissions showUsers
            aclAddUsers: results[3], //aclPermissions addUsers
            aclModifyUsers: results[4],  //aclPermissions modifyUsers
            aclDeleteUsers: results[5]  //aclPermissions deleteUsers

        });
    })
};
module.exports.showPost = function(req, res) {
    var usersAddUpdateTemp = new models.UsersAddTemp({});
    usersAddUpdateTemp.save(function (err) {
        if (err) {
            console.log('Err - NOT SAVED ON DATABASE' + err);
            return res.status(409).send('showAlert')
        }else{
            return res.send({redirect:'/users/addUser/step1/' + usersAddUpdateTemp._id})
        }
    });
};
/*-------------------------end of USERS POST*/



/* SHOW SoftDeleted USERS. */
module.exports.showSoftDeleted = function(req, res, next) {
    /*
    models.Users.find(function(err, users) {
        res.render('users/deletedUsers', { title: 'Deleted Users', users: users });
    }).sort({"firstName":1});
    */
    async.parallel([
        function(callback){
            models.Users.find().sort({"firstName":1}).exec(callback);
        },
        function(callback){aclPermissions.addUsers(req, res, callback);},   //aclPermissions addUsers
        function(callback){aclPermissions.eraseUsers(req, res, callback);} //aclPermissions eraseUsers

    ],function(err, results){
        res.render('users/deletedUsers',{
            title:'Deleted Users',
            userAuthID: req.user.userPrivilegeID,
            users: results[0],
            aclAddUsers: results[1], //aclPermissions addUsers
            aclEraseUsers: results[2]  //aclPermissions eraseUsers
        });
    })

};
/* ------------ end of SHOW SoftDeleted USERS. */


/* ADD USERS STEP1. ---------------------------------------------------*/
module.exports.addStep1 = function(req, res) {
    async.parallel([
        function(callback){
            models.UsersAddTemp.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.Roles2.find().sort({"roleID":1}).exec(callback);
        },
        function(callback){aclPermissions.addUsers(req, res, callback);} //aclPermissions addUsers

    ],function(err, results){
        if (!results[0]) {
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
            res.redirect('/users/showUsers/');
            //res.send({redirect: '/users/showUsers/'});
        }
        else {
            res.render('users/addUserStep1', {
                title: 'ADD USER: Step 1',
                userAuthID: req.user.userPrivilegeID,
                user: results[0],
                roles2: results[1],
                aclAddUsers: results[2] //aclPermissions addUsers
            });
        }
    })
};
module.exports.addStep1Post = function(req, res) {
    var userToAddUpdate_ID = req.body.userToAddUpdate_ID;
    models.UsersAddTemp.findById({'_id': userToAddUpdate_ID}, function (err, user) {
        if (!user) {
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
            res.send({redirect: '/users/showUsers/'});
        }
        else {
            user.userRoleID = req.body.userRoleID;
            user.userRoleName = req.body.userRoleName;
            user.save();
            return res.send({redirect: '/users/addUser/step2/' + userToAddUpdate_ID})}
    });
};
/*-------------------------------------------end of adding Step1 user*/

/* ADD USERS STEP2. ---------------------------------------------------*/
module.exports.addStep2 = function(req, res) {
    async.parallel([
        function(callback){
            models.UsersAddTemp.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.Students.find().sort({"firstName":1}).exec(callback);
        },
        function(callback){aclPermissions.addUsers(req, res, callback);} //aclPermissions addUsers

    ],function(err, results){
        if (!results[0]) {
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
            res.redirect('/users/showUsers/');
            //res.send({redirect: '/users/showUsers/'});
        }
        else {
            var ifUserHasParentRole = 0;
            var ifUserHasUtilityUserRole = 0;
            var ifUserHasAnyOtherRole = 0;
            for (var i=0; i < results[0].userRoleID.length; i++) {

                if (results[0].userRoleID[i] == 98 ) { //if user has Parent Role
                    ifUserHasParentRole = 1;
                }
                if (results[0].userRoleID[i] == 99 ) { //if user has UtilityUser Role
                    ifUserHasUtilityUserRole = 1;
                }
                if (results[0].userRoleID[i] != 98 && results[0].userRoleID[i] != 99 ) { //if user as a role different from Parent or UtilityUser Role
                    ifUserHasAnyOtherRole = 1;
                }
            }
            res.render('users/addUserStep2', {
                title: 'ADD USER: Step 2',
                userAuthID: req.user.userPrivilegeID,
                parentRole: ifUserHasParentRole,
                utilityUserRole: ifUserHasUtilityUserRole,
                anyOtherRole: ifUserHasAnyOtherRole,
                user: results[0],
                students: results[1],
                aclAddUsers: results[2] //aclPermissions addUsers
            });
        }
    })
};
module.exports.addStep2Post = function(req, res) {
    async.waterfall([
        function (callback) {
            var userToAddUpdate_ID = req.body.userToAddUpdate_ID;
            var parentOf = req.body.parentOf;
            models.UsersAddTemp.findById({'_id': userToAddUpdate_ID}, function (err, user) {
                if (!user) {
                    console.log(err);
                    console.log('TTL EXPIRED');
                    req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
                    res.send({redirect: '/users/showUsers/'});
                }
                else {
                    if (req.body.pin != "oldPin") {
                        var hash = bcrypt.hashSync(req.body.pin, bcrypt.genSaltSync(10));
                    } else{
                        var hash = user.pin;
                    }
                    user.firstName = req.body.firstName;
                    user.lastName = req.body.lastName;
                    user.email = req.body.email.toLowerCase();
                    user.pin = hash;
                    user.photo = req.body.photo;
                    user.companyName = req.body.companyName;
                    user.parentOfOld = parentOf;
                    if (req.body.anyOtherRole == 1 && req.body.utilityUserRole == 1 ||
                        req.body.utilityUserRole == 1 && req.body.parentRole == 1
                    ) {
                        user.contactName = req.body.firstName + ' ' + req.body.lastName;
                    } else {
                        user.contactName = req.body.contactName;
                    }
                    if (req.body.parentRole == 1) {
                        user.parentOf = [];
                        user.studentsWithParents = [];
                        models.Students.find({'studentID': parentOf}, function (err, students) {
                            for (var i=0; i < students.length; i++) {
                                var student = {
                                    _id: students[i]._id,
                                    studentID: students[i].studentID,
                                    studentFirstName: students[i].firstName,
                                    studentLastName: students[i].lastName
                                };
                                user.parentOf.push(student);
                                user.studentsWithParents.push(students[i]._id);
                            }
                            console.log('"parentOf" added successfully');
                            callback(null, user);
                        });
                    }else{
                        callback(null, user);
                    }
                }
            });
        }
    ], function (err, user) {
        models.Users.find({'email': user.email}, function (err, result) {
            if(result.length < 1){
                console.log('user updated = ',user.studentsWithParents);
                user.save();
                return res.send({redirect: '/users/addUser/step3/' + user._id})
            }else{
                console.log('user email already in use');
                return res.status(409).send('showAlert');
            }
        });
    });



};
/*-------------------------------------------end of adding Step2 user*/

/* ADD USERS STEP3. ---------------------------------------------------*/
module.exports.addStep3 = function(req, res) {
    async.parallel([
        function(callback){
            models.UsersAddTemp.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.Privilege.find().sort({"privilegeID":1}).exec(callback);
        },
        function(callback){aclPermissions.addUsers(req, res, callback);}, //aclPermissions addUsers
        function(callback){aclPermissions.showPermissionsTable(req, res, callback);},   //aclPermissions showPermissionsTable


    ],function(err, results){
        if (!results[0]) {
            console.log(err);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
            res.redirect('/users/showUsers/');
            //res.send({redirect: '/users/showUsers/'});
        }
        else {
            var ifUserHasPrincipalRole = 0;
            var ifUserHasParentRole = 0;
            var ifUserHasUtilityUserRole = 0;
            var ifUserHasAnyOtherRole = 0;
            for (var i=0; i < results[0].userRoleID.length; i++) {
                if (results[0].userRoleID[i] == 1 && ifUserHasPrincipalRole == 0) { //if user has Principal Role
                    ifUserHasPrincipalRole = 1;
                }
                if (results[0].userRoleID[i] == 98 && ifUserHasParentRole == 0) { //if user has Parent Role
                    ifUserHasParentRole = 1;
                }
                if (results[0].userRoleID[i] == 99 && ifUserHasUtilityUserRole == 0) { //if user has UtilityUser Role
                    ifUserHasUtilityUserRole = 1;
                }
                if (results[0].userRoleID[i] != 98 && results[0].userRoleID[i] != 99 && ifUserHasAnyOtherRole == 0) { //if user as a role different from Parent or UtilityUser Role
                    ifUserHasAnyOtherRole = 1;
                }
            }
            res.render('users/addUserStep3', {
                title: 'ADD USER: Step 3',
                userAuthID: req.user.userPrivilegeID,
                principalRole: ifUserHasPrincipalRole,
                parentRole: ifUserHasParentRole,
                utilityUserRole: ifUserHasUtilityUserRole,
                anyOtherRole: ifUserHasAnyOtherRole,
                user: results[0],
                privilege: results[1],
                aclAddUsers: results[2], //aclPermissions addUsers
                aclShowPermissionsTable: results[3]    //aclPermissions showPermissionsTable
            });
        }
    })
};
module.exports.addStep3Post = function(req, res) {
    var userToAddUpdate_ID = req.body.userToAddUpdate_ID;
    async.waterfall([
        function (callback) {
            models.UsersAddTemp.findById({'_id': userToAddUpdate_ID}, function (err, user) {
                var hash = bcrypt.hashSync(user.pin, bcrypt.genSaltSync(10));
                if (!user) {
                    console.log(err);
                    console.log('TTL EXPIRED');
                    req.flash('error_messages', 'Time expired. After clicking "Add User" button, you have 10min to fill info and save new User');
                    res.send({redirect: '/users/showUsers/'});
                }
                else {
                    user.userPrivilegeID = req.body.userPrivilegeID;
                    user.userPrivilegeName = req.body.userPrivilegeName;
                    user.save();
                    callback(null, user, hash);
                }
            });
        },
        function (user, hash, callback) {
            var user1 = new models.Users({
                _id: user._id,
                userRoleID: user.userRoleID,
                userRoleName: user.userRoleName,
                userPrivilegeID: user.userPrivilegeID,
                userPrivilegeName: user.userPrivilegeName,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                pin: hash,
                parentOf: user.parentOf,
                companyName: user.companyName,
                contactName: user.contactName,
                photo: user.photo
            });
            if(user1.parentOf.length < 1){
                user1.parentOf = undefined;
            }
            callback(null, user, user1);
        }
    ], function (err, user, user1) {
        user1.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                return res.status(409).send('showAlert')
            }else{
                saveParentInStudentDocument(user, user.parentOf);
                return res.send({redirect:'/users/showUsers'})
            }
        });



    });
};
/*-------------------------------------------end of adding Step3 user*/

/* UPDATE USERS. ---------------------------------------------------*/
module.exports.update = function(req, res) {
    async.waterfall([
        function(callback){
            models.Users.findById(req.params.id, function (err, user) {
                callback(null, user);
            });
        },
        function(user, callback){
            models.Students.find(function (err, students) {
                callback(null, user, students);
            }).sort({"studentID":1})
        },
        function(user, students, callback){
            models.Roles2.find(function (err, roles) {
                callback(null, user, students, roles);
            }).sort({"roleID":1})
        },
        function(user, students, roles, callback){
            models.Privilege.find(function (err, privileges) {
                callback(null, user, students, roles, privileges);
            }).sort({"privilegeID":1})
        },
        //aclPermissions showPermissionsTable
        function(user, students, roles, privileges, callback){
            aclPermissions.showPermissionsTable(req, res, function (err, aclShowPermissionsTable) {
                callback(null, user, students, roles, privileges, aclShowPermissionsTable);
            });
        },
        //aclPermissions modifyUsers
        function(user, students, roles, privileges, aclShowPermissionsTable, callback){
            aclPermissions.modifyUsers(req, res, function (err, aclModifyUsers) {
                callback(null, user, students, roles, privileges, aclShowPermissionsTable, aclModifyUsers);
            });
        },
        function(user, students, roles, privileges, aclShowPermissionsTable, aclModifyUsers, callback){
            if (aclShowPermissionsTable.checkBoxValue == false) {
                console.log(err);
                console.log('No Permission');
                req.flash('error_messages', 'No permission to update User info ');
                res.redirect('/users/showUsers/');
            }
            else {
                var ifUserHasPrincipalRole = 0;
                var ifUserHasUtilityUserRole = 0;
                var ifUserHasAnyOtherRole = 0;
                for (var i = 0; i < user.userRoleID.length; i++) {
                    //if user has Principal Role
                    if (user.userRoleID[i] == 1) {
                        ifUserHasPrincipalRole = 1;
                    }
                    //if user has UtilityUser Role
                    if (user.userRoleID[i] == 99) {
                        ifUserHasUtilityUserRole = 1;
                    }
                    //if user as a role different from Parent or UtilityUser Role
                    if (user.userRoleID[i] != 98 && user.userRoleID[i] != 99) {
                        ifUserHasAnyOtherRole = 1;
                    }
                }
                callback(
                    null,
                    user,
                    students,
                    roles,
                    privileges,
                    aclShowPermissionsTable,
                    aclModifyUsers,
                    ifUserHasPrincipalRole,
                    ifUserHasUtilityUserRole,
                    ifUserHasAnyOtherRole);
            }
        },
        function(
            user,
            students,
            roles,
            privileges,
            aclShowPermissionsTable,
            aclModifyUsers,
            ifUserHasPrincipalRole,
            ifUserHasUtilityUserRole,
            ifUserHasAnyOtherRole,
            callback){

            var ifUserHasParentRole = 0;
            var studentsIdArray = [];
            for (var i = 0; i < user.userRoleID.length; i++) {
                if (user.userRoleID[i] == 98) { //if user has Parent Role
                    ifUserHasParentRole = 1;
                    user.parentOf.forEach(function (student) {
                        studentsIdArray.push(student.studentID);
                    });
                }else{

                }

            }
            callback(
                null,
                user,
                students,
                roles,
                privileges,
                aclShowPermissionsTable,
                aclModifyUsers,
                ifUserHasPrincipalRole,
                ifUserHasUtilityUserRole,
                ifUserHasAnyOtherRole,
                ifUserHasParentRole,
                studentsIdArray
            );
        }
    ],function(
        err,
        user,
        students,
        roles,
        privileges,
        aclShowPermissionsTable,
        aclModifyUsers,
        ifUserHasPrincipalRole,
        ifUserHasUtilityUserRole,
        ifUserHasAnyOtherRole,
        ifUserHasParentRole,
        studentsIdArray){

        res.render('users/updateUser', {
            title: 'UPDATE USER:',
            userAuthID: req.user.userPrivilegeID,
            users: user,
            students: students,
            roles2: roles,
            privileges: privileges,
            aclShowPermissionsTable: aclShowPermissionsTable,    //aclPermissions showPermissionsTable
            aclModifyUsers: aclModifyUsers,              //aclPermissions modifyUsers
            principalRole: ifUserHasPrincipalRole,
            parentRole: ifUserHasParentRole,
            utilityUserRole: ifUserHasUtilityUserRole,
            anyOtherRole: ifUserHasAnyOtherRole,
            studentsIdArray: studentsIdArray    //user that is a parent of these children
        });
    })
};
module.exports.updatePost = function(req, res) {
    var userToAddUpdate_ID = req.body.userToUpdate;
    var hash = bcrypt.hashSync(req.body.pin, bcrypt.genSaltSync(10));
    var userRoleArray = req.body.userRoleID;
    var parentOf = req.body.parentOf;
    var emailLowerCase = req.body.email.toLowerCase();

    var ifUserHasAnyOtherRole = 0;
    var ifUserHasParentRole = 0;
    var ifUserHasUtilityUserRole = 0;

    for (var i = 0; i < userRoleArray.length; i++) {

        //if user as a role different from UtilityUser Role
        if (userRoleArray[i] != 99 && ifUserHasAnyOtherRole == 0) {
            ifUserHasAnyOtherRole = 1;
        }
        //if user has Parent Role
        if (userRoleArray[i] == 98 && ifUserHasParentRole == 0) {
            ifUserHasParentRole = 1;
        }
        //if user has UtilityUser Role
        if (userRoleArray[i] == 99 && ifUserHasUtilityUserRole == 0) {
            ifUserHasUtilityUserRole = 1;
        }
    }

    async.waterfall([
        function (callback) {
            models.Users.findById({'_id': userToAddUpdate_ID}, function(err, user){
                user.userRoleID = req.body.userRoleID;
                user.userRoleName = req.body.userRoleName;
                user.userPrivilegeID = req.body.userPrivilegeID;
                user.userPrivilegeName = req.body.userPrivilegeName;
                if (req.body.pin != "oldPin"){
                    user.pin = hash; //req.body.pin;
                }
                user.photo = req.body.photo;
                callback(null, user);
            });
        },
        function (user, callback) {
            //iifUserHasAnyOtherRole: delete or saves "FirstName" and "LastName" field
            if (ifUserHasAnyOtherRole == 1) {
                user.firstName = req.body.firstName;
                user.lastName = req.body.lastName;
            }else{
                user.firstName = undefined;
                user.lastName = undefined;
            }
            callback(null, user);
        },
        function (user, callback) {
            //Parent User: update "ParentOf" field
            var oldParentArray = [];
            var studentsWithParents = [];
            if (ifUserHasParentRole == 1) {
                if (typeof user.parentOf !== 'undefined' && user.parentOf.length > 0) {
                    // the array is defined and has at least one element
                    for (var i=0; i < user.parentOf.length; i++) {
                        oldParentArray.push(user.parentOf[i]._id);
                    }
                }
                user.parentOf = [];
                models.Students.find({'studentID': parentOf}, function (err, students) {
                    for (var i=0; i < students.length; i++) {
                        var student = {
                            _id: students[i]._id,
                            studentID: students[i].studentID,
                            studentFirstName: students[i].firstName,
                            studentLastName: students[i].lastName
                        };
                        user.parentOf.push(student);
                        studentsWithParents.push(students[i]._id);
                    }
                    console.log('"parentOf" updated successfully');
                    callback(null, user, studentsWithParents, oldParentArray);
                });
            }else{
                user.parentOf = undefined;
                callback(null, user, studentsWithParents, oldParentArray);
            }
        },
        function (user, studentsWithParents, oldParentArray, callback) {
            //update Students database "StudentParents" field
            callback(null, user, studentsWithParents, oldParentArray);
        },
        function (user, studentsWithParents, oldParentArray, callback) {
            //Utility user: delete or save "Company Name" field
            if (ifUserHasUtilityUserRole == 1) {
                user.companyName = req.body.companyName;
                user.contactName = req.body.contactName;
            }else{
                user.companyName = undefined;
                user.contactName = undefined;
            }
            callback(null, user, studentsWithParents, oldParentArray);
        }
    ], function (err, user, studentsWithParents, oldParentArray) {
        if (err) {console.log('err on update user post = ' + err)}
        else {
            //check if email already exit in USERS database
            user.email = emailLowerCase;
            models.Users.find({'email': emailLowerCase}, function (err, result) {
                var userID;
                if(result.length < 1){
                    console.log('user updated');
                    user.save();
                    deleteParentInStudentDocument(user, studentsWithParents, oldParentArray);
                    saveParentInStudentDocument(user, studentsWithParents);
                    return res.send({redirect: '/users/showUsers'})
                }else{
                    result.forEach(function (userEmail) {
                        userID = userEmail._id;
                        if (userID == userToAddUpdate_ID) {
                            console.log('user updated');
                            user.save();
                            deleteParentInStudentDocument(user, studentsWithParents, oldParentArray);
                            saveParentInStudentDocument(user, studentsWithParents);
                            return res.send({redirect: '/users/showUsers'})
                        }else{
                            console.log('user email already in use');
                            return res.status(409).send('showAlert')
                        }
                    });
                }
            });
        }
    });
};
/*-------------------------------------------end of update user*/

/* SoftDeleted USERS. */
module.exports.softDelete = function(req, res) {
    var userToSoftDelete = req.params.id;
    models.Users.findById({'_id': userToSoftDelete}, function(err, user){
        var whoDeleted = req.session.user.firstName + " " + req.session.user.lastName;
        var wrapped = moment(new Date());
        user.softDeleted = wrapped.format('YYYY-MM-DD, h:mm:ss a') + "  by " + whoDeleted;
        user.save();

        //If user is parent, deletes user(parentOf) from Student document ------------------------------
        if(user.parentOf.length > 0) {
            models.Students.update({}, {$pull: {"parentOf": {"_id": user._id}}}, {
                safe: true,
                multi: true
            }, function (err) {
                if (err) {
                    console.log('err - finding students from arrayToDelete');
                } else {
                    console.log('success - parent(s) removed from Student document');
                }
            });
        }
        //----------end of If user is parent, deletes user(parentOf) from Student document --------------

        res.redirect('/users/showUsers');
    })
};
/* ------------ end of SoftDeleted USERS. */

/* Restore SoftDeleted USERS. */
module.exports.restoreUser = function(req, res) {
    var userToRestore = req.params.id;

    models.Users.findById({'_id': userToRestore}, function(err, user){
        user.softDeleted = null;
        user.save();

        //restore parent to Student document --------------
        if(user.parentOf.length > 0){
            saveParentInStudentDocument(user, user.parentOf);
        }
        //----------end of restore parent to Student document

        res.redirect('/users/deletedUsers');
    })
};
/* ------------ end of SoftDeleted USERS. */



/* ERASE USERS. */
module.exports.erase = function(req, res) {
    var userToDelete = req.params.id;
    // delete photo before delete user----------------
    models.Users.findById({'_id': userToDelete}, function(err, user) {
        var newUser = "";
        var photo = user.photo;
        if ((photo) && photo != newUser) { //delete old photo if exists
            fs.unlinkSync('./public/photosUsers/' + photo);
            console.log('successfully deleted ' + photo);
        }// ------------end delete photo before delete user

        models.Users.remove({'_id': userToDelete}, function(err) {
            //res.send((err === null) ? { msg: 'User not deleted' } : { msg:'error: ' + err });
            res.redirect('/users/deletedUsers');
        });
    })
};
/* ------------ end of DELETE USERS. */

module.exports.showPhoto = function(req, res) {

    models.Users.findById(req.params.id,function(error, user) {
        res.render('users/showPhoto', { title: 'User Photo', users: user });

    });
};

//--ADD or UPDATE user photo -------------------------------------
module.exports.addUpdatePhoto = function (req, res){
// res.writeHead(200, {'Content-Type': 'text/html' });
// var form = '<form action="/users/addPhoto/:id" enctype="multipart/form-data" method="post">Add a title: <input name="title" type="text" /><br><br><input single="single" name="upload" type="file" /><br><br><input type="submit" value="Upload" /></form>';
// res.end(form);
    /*
        models.Users.findById(req.params.id,function(error, user) {
            res.render('users/addPhoto', { title: 'ADD PHOTO', user: user });
        });
    */

    async.parallel([
        function(callback){
            models.Users.findById(req.params.id).exec(callback);
        },
        function(callback){aclPermissions.modifyUsers(req, res, callback);}   //aclPermissions modifyUsers

    ],function(err, results){
        res.render('users/addPhoto',{
            title:'Add Photo',
            user: results[0],
            aclModifyUsers: results[1] //aclPermissions modifyUsers
        });
    })
};

module.exports.addUpdatePhotoPost = function (req, res){
    var fields =[];
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        //res.writeHead(200, {'content-type': 'text/plain'});
        //res.write('received upload:\n\n');
        console.log(util.inspect({fields: fields, files: files}));
    });

    //save user id from field value to "fields"
    form.on('field', function (field, value) {
        //console.log(field);
        //console.log(value);
        fields[field] = value;

        form.on('end', function(fields, files) {
            /* Temporary location of our uploaded file */
            var temp_path = this.openedFiles[0].path;
            /* The file name of the uploaded file */
            var file_name = this.openedFiles[0].name;
            /* Location where we want to copy the uploaded file */
            var new_location = 'public/photosUsers/';

            if (this.openedFiles[0].name){ // if a file is selected do this
                models.Users.findById({'_id': field}, function(err, user){
                    var oldPhoto = user.photo;
                    var newUser = "";
                    if ((file_name != oldPhoto) && (oldPhoto != newUser )) { //delete old photo if exists
                        fs.unlinkSync(new_location + oldPhoto);
                        console.log('successfully deleted ' + oldPhoto);
                    }
                    //if old photo doesn't exits or has been deleted, save new file
                    fs.copy(temp_path, new_location + file_name, function (err) { // save file
                        if (err) {
                            console.error(err);
                        } else {
                            user.photo = file_name; //save uploaded file name to user.photo
                            user.save();
                            console.log("success! saved " + file_name);
                        }
                        fs.unlink(temp_path, function (err) { //delete file from temp folder (unlink) -------
                            if (err) {
                                //return res.send(500, 'Something went wrong');
                            }
                        });//------------------------------#end - unlink
                        res.redirect('/users/showUsers');
                    })
                });//--------end of user.photo

            } else { // if no file is selected delete temp file
                console.log('no files added');
                //delete file from temp folder-------
                fs.unlink(temp_path, function (err) {
                    if (err) {
                        return res.send(500, 'Something went wrong');
                    }
                });
                //------------------#end - unlink
            }
        });
    });
};
//-----------------------------------------end ADD or CHANGE user photo

// delete user photo------------------
module.exports.deletePhoto = function(req, res) {
    var new_location = 'public/photosUsers/';
    models.Users.findById({'_id': req.params.id}, function(err, user){
        var photoToDelete = user.photo;
        if (fs.existsSync(new_location + photoToDelete)) { //delete old photo if exists
            fs.unlinkSync(new_location + photoToDelete);
            console.log('successfully deleted ' + photoToDelete);
        }
        user.photo = "";
        user.save();
        res.redirect('/users/showUsers');
    });
};
//----------------end delete user photo


//Function to delete parent in Student database --------------------
function deleteParentInStudentDocument(user, newParentsArray, oldParentArray) {
    async.waterfall([
        function (callback) {
            var arrayParentsToDelete = [];
            var flagExists = 0;
            for (var i=0; i < oldParentArray.length; i++) {
                flagExists = 0;
                for (var x=0; x < newParentsArray.length; x++) {
                    if (oldParentArray[i].toString() == newParentsArray[x].toString()){
                        flagExists = 1;
                        break;
                    }
                }
                if (flagExists == 0){
                    arrayParentsToDelete.push(oldParentArray[i]);
                }
            }
            callback(null, user, arrayParentsToDelete);
        }
    ], function (err, user, arrayParentsToDelete) {
        console.log('arrayParentsToDelete = ', arrayParentsToDelete);
        if (arrayParentsToDelete.length < 1 ){
            console.log('No parents from Students collection to delete');
        } else {
            models.Students.update({ _id: arrayParentsToDelete }, { $pull: { "parentOf": { "_id": user._id } }}, { safe: true, multi:true }, function(err) {
                if(err){
                    console.log('err - finding students from arrayToDelete');
                }else{
                    console.log('success - parent removed from Student document');
                }
            });
        }
    });
}
//-------------- end of Function to delete parent in Student database

function saveParentInStudentDocument(user, newParentsArray) {
    //save parent in Student database --------------------
    var parent = {
        _id: user._id,
        parentFirstName: user.firstName,
        parentLastName: user.lastName
    };
    for (var i=0; i < newParentsArray.length; i++) {
        //find student with id = to 'parents[i]' -> {'_id': parents[i]
        //if student already has that parent do not update -> 'parentOf._id': {$ne: parent._id}
        models.Students.findOneAndUpdate({'_id': newParentsArray[i], 'parentOf._id': {$ne: parent._id}},
            { "$push": { "parentOf": parent } },
            { "new": true},
            function (err) {
                if(err){
                    console.log('student not updated successfully');
                    throw err;
                }else {
                    console.log('"parentOf" added successfully on STUDENT database');
                }
            });
    }
    //-------------- end of save parent in Student database
}