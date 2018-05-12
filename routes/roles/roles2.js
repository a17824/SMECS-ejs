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
        function(callback){aclPermissions.addRoles2(req, res, callback);},   //aclPermissions addRoles2
        function(callback){aclPermissions.modifyRoles2(req, res, callback);}, //aclPermissions modifyRoles2
        function(callback){aclPermissions.deleteRoles2(req, res, callback);}, //aclPermissions deleteRoles2
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTabUsers(req, res, 'showUsers');
        res.render('roles2/showRoles2',{
            title:'Roles',
            userAuthID: req.user.userPrivilegeID,
            roles2: results[0],
            aclAddRoles2: results[1], //aclPermissions addRoles2
            aclModifyRoles2: results[2],  //aclPermissions modifyRoles2
            aclDeleteRoles2: results[3],  //aclPermissions deleteRoles2
            aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
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
        sortID: req.body.sortID
    });
    role1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            console.log("err - ",err);
            return res.status(409).send('showAlert')
        }else{
            var typeAclAlert = 'AclAlertsReal';
            addAclAlerts(req, res, typeAclAlert);

            typeAclAlert = 'AclAlertsTest';
            addAclAlerts(req, res, typeAclAlert);

            return res.send({redirect:'/roles2/showRoles2'})
        }
    });
};
/*-------------------------end of adding role2*/

function addAclAlerts(req, res, typeAclAlert){
    models.Alerts.find({}, function(err, groups) {
        for (var u=0; u < groups.length;u++){
            var aclAlertSend = new models[typeAclAlert]({
                roleGroupID: req.body.roleID,
                roleGroupName: req.body.roleName,
                alertID: groups[u].alertID,
                alertName: groups[u].alertName,
                checkBoxType: 'send',
                checkBoxID: 's'+req.body.roleID+groups[u].alertID,
                checkBoxName: 's'+req.body.roleName+groups[u].alertName
            });
            aclAlertSend.save();
            var aclAlertReceive = new models[typeAclAlert]({
                roleGroupID: req.body.roleID,
                roleGroupName: req.body.roleName,
                alertID: groups[u].alertID,
                alertName: groups[u].alertName,
                checkBoxType: 'receive',
                checkBoxID: 'r'+req.body.roleID+groups[u].alertID,
                checkBoxName: 'r'+req.body.roleName+groups[u].alertName
            });
            aclAlertReceive.save();
        }
        console.log('******************* END FUNCTION ADD ACL ALERTS = ' + typeAclAlert);
    });
}
//--------end adding ACL ALERTS


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
    console.log("iiiiiiiiiiiiiiii");
    models.Roles2.findById({'_id': roleToUpdate1}, function(err, role){
        role.roleID = req.body.roleID;
        role.roleName = req.body.roleName;
        role.sortID = req.body.sortID;
        role.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                console.log(err);
                return res.status(409).send('showAlert')
            }else {
                var oldRoleIdToUpdate = req.body.oldRoleID;
                var oldRoleNameToUpdate = req.body.oldRoleName;

                updateUsers(oldRoleIdToUpdate, oldRoleNameToUpdate);

                var typeAclAlert = 'AclAlertsReal';
                updateAclAlerts(oldRoleIdToUpdate, typeAclAlert);

                typeAclAlert = 'AclAlertsTest';
                updateAclAlerts(oldRoleIdToUpdate, typeAclAlert);

                return res.send({redirect:'/roles2/showRoles2'})
            }
            //UPDATE USERS old roleID/roleName to new roleID/Name
            function updateUsers(oldRoleIdToUpdate){
                models.Users.find({}, function(err, users) {
                    if( err || !users) console.log("No Users found in database");
                    else users.forEach( function(user) {
                        for (var i=0; i < user.userRoleID.length; i++) {
                            console.log(oldRoleIdToUpdate);
                            console.log(oldRoleNameToUpdate);
                            if (user.userRoleID[i] == oldRoleIdToUpdate){
                                user.userRoleID[i] = parseInt(req.body.roleID);
                                user.markModified("userRoleID");
                                user.save();
                            }
                            if (user.userRoleName[i] == oldRoleNameToUpdate){
                                user.userRoleName[i] = req.body.roleName;
                                user.markModified("userRoleName");
                                user.save();
                            }
                        }
                    });
                });
            }
            //--------end UPDATE USERS old roleID/roleName to new roleID/Name

            //UPDATE ACL ALERTS--------
            function updateAclAlerts(oldRoleIdToUpdate, typeAclAlert){
                models[typeAclAlert].find({}, function(err, groups) {
                    if( err || !groups) console.log("No Alerts groups found");
                    else groups.forEach( function(group) {
                        //console.log(group.roleName);
                        if (group.checkBoxID == 's'+oldRoleIdToUpdate+group.alertID){
                            group.roleGroupID = req.body.roleID;
                            group.roleGroupName = req.body.roleName;
                            group.checkBoxType = 'send';
                            group.checkBoxID = 's'+req.body.roleID+group.alertID;
                            group.checkBoxName = 's'+req.body.roleName+group.alertName;
                            group.save();
                        }
                        if (group.checkBoxID == 'r'+oldRoleIdToUpdate+group.alertID){
                            group.roleGroupID = req.body.roleID;
                            group.roleGroupName = req.body.roleName;
                            group.checkBoxType = 'receive';
                            group.checkBoxID = 'r'+req.body.roleID+group.alertID;
                            group.checkBoxName = 'r'+req.body.roleName+group.alertName;
                            group.save();
                        }
                    });
                });
            }
            //--------end UPDATE ACL ALERT (default: all checkboxes are enable)
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
                console.log(roles.roleID);
                console.log(result);
                console.log("Role NOT deleted");
                return res.status(409).send(' ALERT! ' + roles.roleName + ' Role not deleted because there are Users using this role. Please change Users under this role to other role and then delete this role.')
            }
            else {
                //delete ACL Permission-----
                function deleteAclAlert(callback) {
                    models.Roles2.findById({'_id': roleToDelete}, function(err, role){
                        var aclAlertToDelete = role.roleID;
                        models.AclAlertsReal.find({'roleGroupID': aclAlertToDelete}).remove().exec();
                        models.AclAlertsTest.find({'roleGroupID': aclAlertToDelete}).remove().exec();
                        console.log("AclAlerts deleted");
                        callback(null);
                    });
                }//----end delete ACL Alert

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
                    deleteAclAlert,
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
