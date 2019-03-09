//Dependencies
var models = require('./../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var functions = require('../functions');

/* SHOW ALL ROLES2. */
module.exports.show = function(req, res, next) {
    /*
        models.Roles2.find(function(err, roles) {
            res.render('roles2/showRoles2', { title: 'ROLES', roles: roles });
        }).sort({"roleID":1});
    */
    async.parallel([
        function(callback){
            models.Roles2.find().sort({"sortID": 1}).exec(callback);
        },
        function(callback){models.Icons.findById('5afcab36dcba311ccc719b0a').exec(callback);},
        function(callback){aclPermissions.addRoles2(req, res, callback);},   //aclPermissions addRoles2
        function(callback){aclPermissions.modifyRoles2(req, res, callback);}, //aclPermissions modifyRoles2
        function(callback){aclPermissions.deleteRoles2(req, res, callback);}, //aclPermissions deleteRoles2
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTabUsers(req, res, 'showUsers');
        functions.redirectTabBuildings(req, res, 'showBuilding');

        res.render('roles2/showRoles2',{
            title:'Roles',
            userAuthID: req.user.userPrivilegeID,
            roles2: results[0],
            useIcons: results[1].useRolesIcons,
            aclAddRoles2: results[2], //aclPermissions addRoles2
            aclModifyRoles2: results[3],  //aclPermissions modifyRoles2
            aclDeleteRoles2: results[4],  //aclPermissions deleteRoles2
            aclSideMenu: results[5],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo

        });
    })
};

/* ADD ROLES2. -------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.Roles2.find(function(error, role) {

            }).exec(callback);
        },
        function(callback){aclPermissions.addRoles2(req, res, callback);},  //aclPermissions addRoles2
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var arraySort = [];
        var array = [];

        var streamSort = models.Roles2.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(arraySort);
        });

        var stream = models.Roles2.find().sort({"roleID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.roleID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('roles2/addRole2',{
                title:'Add Role',
                arraySort: arraySort,
                array: array,
                userAuthID: req.user.userPrivilegeID,
                roles2: results[0],
                aclAddRoles2: results[1],      //aclPermissions addRoles2
                aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};
module.exports.addPost = function(req, res) {
    console.log('add post');
    var role1 = new models.Roles2({
        roleID: req.body.roleID,
        roleName: req.body.roleName,
        sortID: req.body.sortID,
        icon: req.body.icon
    });
    role1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            console.log("err - ",err);
            return res.status(409).send('showAlert')
        }else{
            //Alerts Collection - add new role to all documents
            var newRole = {
                roleID: req.body.roleID,
                roleName: req.body.roleName,
                checkbox: false
            };
            models.Alerts.updateMany({}, { $push: {
                    "whoCanSendReceive.sendReal": newRole,
                    "whoCanSendReceive.receiveReal": newRole,
                    "whoCanSendReceive.sendDrill": newRole,
                    "whoCanSendReceive.receiveDrill": newRole
                }}, function(err, alerts) {
                console.log('alerts with new role = ',alerts);
            });
            //end of Alerts Collection - add new role to all documents

            return res.send({redirect:'/roles2/showRoles2'})
        }
    });
};
/*-------------------------end of adding role2*/




/* UPDATE ROLES2. -------------------------------*/
module.exports.update = function(req, res) {
    var arraySort = [];
    var array = [];
    async.parallel([
        function(callback){
            models.Roles2.findById(req.params.id,function(error, role) {}).exec(callback);
        },
        function(callback){aclPermissions.modifyRoles2(req, res, callback);},  //aclPermissions modifyRoles2
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){

        var streamSort = models.Roles2.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(arraySort);
        });

        var stream = models.Roles2.find().sort({"roleID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.roleID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('roles2/updateRole2',{
                title:'Update Role',
                userAuthID: req.user.userPrivilegeID,
                arraySort: arraySort,
                array: array,
                roles2: results[0],
                aclModifyRoles2: results[1],      //aclPermissions modifyRoles2
                aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};
module.exports.updatePost = function(req, res) {
    var roleToUpdate1 = req.body.roleToUpdate;
    models.Roles2.findById({'_id': roleToUpdate1}, function(err, role){
        role.roleID = req.body.roleID;
        role.roleName = req.body.roleName;
        role.sortID = req.body.sortID;
        role.icon = req.body.icon;
        role.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                console.log(err);
                return res.status(409).send('showAlert')
            }else {
                var oldRoleIdToUpdate = req.body.oldRoleID;
                var oldRoleNameToUpdate = req.body.oldRoleName;

                updateUsers();
                updateWCSRAlerts();
                updateWhoCanCall911();
                updateLightRoles();

                return res.send({redirect:'/roles2/showRoles2'})
            }
            //UPDATE USERS old roleID/roleName to new roleID/Name
            function updateUsers(){
                //Alerts Collection - add new role to all documents
                models.Users.update({
                    "userRoleID": oldRoleIdToUpdate

                }, { "$set": {
                        "userRoleID.$": req.body.roleID,
                        "userRoleName.$": req.body.roleName
                    }
                }, {"multi": true} , function (err, result) {
                    console.log(result);
                });
            }
            //--------end UPDATE USERS old roleID/roleName to new roleID/Name

            //UPDATE WhoCanSendReceive ALERTS --------
            function updateWCSRAlerts(){
                //Alerts Collection - add new role to all documents
                models.Alerts.update({
                    "whoCanSendReceive.sendReal.roleID": oldRoleIdToUpdate

                }, { "$set": {
                        "whoCanSendReceive.sendReal.$.roleID": req.body.roleID,
                        "whoCanSendReceive.sendReal.$.roleName": req.body.roleName,
                        "whoCanSendReceive.sendDrill.$.roleID": req.body.roleID,
                        "whoCanSendReceive.sendDrill.$.roleName": req.body.roleName,

                        "whoCanSendReceive.receiveReal.$.roleID": req.body.roleID,
                        "whoCanSendReceive.receiveReal.$.roleName": req.body.roleName,
                        "whoCanSendReceive.receiveDrill.$.roleID": req.body.roleID,
                        "whoCanSendReceive.receiveDrill.$.roleName": req.body.roleName
                    }
                }, {"multi": true} , function (err, result) {
                    console.log(result);
                });
            }
            //--------end UPDATE ACL ALERT (default: all checkboxes are enable)

            //UPDATE whoCanCall911 ALERTS --------
            function updateWhoCanCall911(){
                //Alerts Collection - add new role to all documents
                models.Alerts.update({
                    "whoCanCall911": oldRoleNameToUpdate

                }, { "$set": {
                        "whoCanCall911.$": req.body.roleName
                    }
                }, {"multi": true} , function (err, result) {
                    console.log(result);
                });
            }
            //--------end UPDATE whoCanCall911 ALERT

            //UPDATE whoCanCall911 ALERTS --------
            function updateLightRoles(){
                //Alerts Collection - add new role to all documents
                models.Room.update({
                    "roomRoleName": oldRoleNameToUpdate

                }, { "$set": {
                        "roomRoleName.$": req.body.roleName
                    }
                }, {"multi": true} , function (err, result) {
                    console.log(result);
                });
            }
            //--------end UPDATE whoCanCall911 ALERT
        });

    });


};
/*-------------------------end of update roles2*/

/* DELETE ROLES2. */
module.exports.delete = function(req, res) {
    var roleToDelete = req.params.id;
    models.Roles2.findOne({'_id': roleToDelete}, function(err, roles) {
        models.Users.findOne({ userRoleID: roles.roleID }, function (err, result) {
            if (err) { console.log(err) };

            if (result) {
                console.log("Role NOT deleted");
                //return res.status(409).send(' ALERT! ' + roles.roleName + ' Role not deleted because there are Users using this role. Please change Users under this role to other role and then delete this role.')
                req.flash('error_messages', ' Attention! ' + roles.roleName + ' Role not deleted because there are Users using this role.. <br> Please change Users under this role to other role and then delete this role.');
                res.redirect('/roles2/showRoles2');
            }
            else {
                //delete WhoCanSenReceive Alerts-----
                function deleteWCSRAlert(callback) {
                    var deleteRole = {
                        roleID: roles.roleID,
                        roleName: roles.roleName
                    };
                    models.Alerts.updateMany({}, { $pull: {
                            "whoCanSendReceive.sendReal": deleteRole,
                            "whoCanSendReceive.receiveReal": deleteRole,
                            "whoCanSendReceive.sendDrill": deleteRole,
                            "whoCanSendReceive.receiveDrill": deleteRole
                        }}, function(err, alerts) {
                        console.log('alerts with delete role = ',alerts);
                    });
                }//----end delete WhoCanSenReceive Alerts

                //delete role from "whoCanCall911" Array (Alerts.whoCanCall911)-----
                function deleteWhoCanCall911(callback) {
                    models.Alerts.find({}, function(err, alert){
                        for (var i = 0; i < alert.length; i++) {
                            if (alert[i].alertRequest911Call) {
                                for (var a = 0; a < alert[i].whoCanCall911.length; a++) {
                                    if (alert[i].whoCanCall911[a] == roles.roleName) {
                                        var array = alert[i].whoCanCall911;
                                        array.splice( a, 1 );
                                        alert[i].whoCanCall911 = array;
                                        console.log("user role deleted from Alert whoCanCall911 array");
                                        if (alert[i].whoCanCall911.length < 1 ){ //put radio button off if array is empty
                                            alert[i].alertRequest911Call = 'false';
                                        }
                                        alert[i].save();
                                    }
                                }
                            }
                        }
                        callback(null);
                    });
                }//----end role from "whoCanCall911" Array (Alerts.whoCanCall911)

                function deleteUserRole(callback) {
                    models.Roles2.remove({'_id': roleToDelete}, function(err) {
                        console.log("role deleted");
                        return res.redirect('/roles2/showRoles2');

                    });
                }

                async.waterfall([
                    deleteWCSRAlert,
                    deleteWhoCanCall911,
                    deleteUserRole
                ], function (error) {
                    if (error) {
                        //handle readFile error or processFile error here
                    }
                });

            }
        });
    });
};
/* ------------ end of DELETE ROLE2. */
