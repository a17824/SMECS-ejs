//Dependencies
var models = require('./../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var functions = require('../functions');


/* SHOW ALL ROLES. */
module.exports.show = function(req, res, next) {
/*
    models.Privilege.find(function(err, privilege) {
        res.render('privilege/showPrivilege', { title: 'User Privilege', privilege: privilege });
    }).sort({"privilegeID":1});
*/
    async.parallel([
        function(callback){
            models.Privilege.find().sort({"privilegeID":1}).exec(callback);
        },
        function(callback){models.Icons.findById('5afcab36dcba311ccc719b0a').exec(callback);},
        function(callback){aclPermissions.addPrivilege(req, res, callback);},      //aclPermissions addPrivilege
        function(callback){aclPermissions.modifyPrivilege(req, res, callback);},   //aclPermissions modifyPrivilege
        function(callback){aclPermissions.deletePrivilege(req, res, callback);},    //aclPermissions deletePrivilege
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTabUsers(req, res, 'showUsers');
        functions.redirectTabBuildings(req, res, 'showBuilding');

        res.render('privilege/showPrivilege',{
            title:'Privilege Privilege',
            privilege: results[0],
            useIcons: results[1].usePrivilegeIcons,
            aclAddPrivilege: results[2],       //aclPermissions addPrivilege
            aclModifyPrivilege: results[3],    //aclPermissions modifyPrivilege
            aclDeletePrivilege: results[4],     //aclPermissions deletePrivilege
            aclSideMenu: results[5],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};

/* ADD PRIVILEGE ROLE. -------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.Privilege.find(function(error, privilege) {}).exec(callback);
        },
        function(callback){aclPermissions.addPrivilege(req, res, callback);},  //aclPermissions addPrivilege
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var array = [];
        var stream = models.Privilege.find().sort({"privilegeID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.privilegeID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('privilege/addPrivilege',{
                title:'Add Privilege Privilege',
                array: array,
                privilege: results[0],
                aclAddPrivilege: results[1],      //aclPermissions addPrivilege
                aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};

module.exports.addPost = function(req, res) {
    //console.log(req.body.privilegeID);
    var privilege1 = new models.Privilege({
        privilegeID: req.body.privilegeID,
        privilegeName: req.body.privilegeName,
        icon: req.body.icon
    });
    privilege1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            console.log("err - ",err);
            return res.status(409).send('showAlert')
        }else{
            return res.send({redirect:'/privilege/showPrivilege'})
        }
    });

    //add ACL PERMISSIONS--------
    models.AclPermissions.find({}, function(err, groups) {
        if( err || !groups) console.log("No ACL PERMISSIONS found");
        else groups.forEach( function(group) {
            var aclPermission1 = new models.AclPermissions({
                privilegeGroupID: req.body.privilegeID,
                privilegeGroupName: req.body.privilegeName,
                permissionsID: group.permissionsID,
                permissionsName: group.permissionsName,
                checkBoxID: req.body.privilegeID+group.permissionsID,
                checkBoxName: req.body.privilegeName+group.permissionsName
            });
            aclPermission1.save();
        });
    });
    //--------end adding ACL PERMISSIONS (default: all checkboxes are enable)

};
/*-------------------------end of adding privilege*/

/* UPDATE PRIVILEGES ROLES. -------------------------------*/
module.exports.update = function(req, res) {
    async.parallel([
        function(callback){
            models.Privilege.findById(req.params.id,function(error, privilege) {}).exec(callback);
        },
        function(callback){aclPermissions.modifyPrivilege(req, res, callback);},  //aclPermissions modifyPrivilege
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var array = [];
        var stream = models.Privilege.find().sort({"privilegeID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.privilegeID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('privilege/updatePrivilege',{
                title:'Update Privilege Privilege',
                array: array,
                privilege: results[0],
                aclModifyPrivilege: results[1],      //aclPermissions modifyPrivilege
                aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};
module.exports.updatePost = function(req, res) {
    var privilegeToUpdate1 = req.body.privilegeToUpdate;
    var aclPermissionToUpdate1 = req.body.oldPrivilegeID;

    models.Privilege.findById({'_id': privilegeToUpdate1}, function(err, privilege){
        privilege.privilegeID = req.body.privilegeID;
        privilege.privilegeName = req.body.privilegeName;
        privilege.icon = req.body.icon;
        privilege.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                console.log(err);
                return res.status(409).send('showAlert')
            }else{
                //UPDATE USER privilege name ---------
                models.Users.update({userPrivilegeID: req.body.oldPrivilegeID}, {userPrivilegeID: req.body.privilegeID}, {multi: true},
                    function(err, num) {
                        console.log("updated "+num);
                    }
                );
                models.Users.update({userPrivilegeName: req.body.oldPrivilegeName}, {userPrivilegeName: req.body.privilegeName}, {multi: true},
                    function(err, num) {
                        console.log("updated "+num);
                    }
                );
                //end of UPDATE USER privilege name ---------

                //UPDATE ACL PERMISSIONS--------
                models.AclPermissions.find({}, function(err, groups) {
                    if( err || !groups) console.log("No Privilege groups found");
                    else groups.forEach( function(group) {
                        //console.log(group.privilegeName);
                        if (group.privilegeGroupID == aclPermissionToUpdate1){
                            group.privilegeGroupID = req.body.privilegeID;
                            group.privilegeGroupName = req.body.privilegeName;
                            group.checkBoxID = req.body.privilegeID+group.permissionsID;
                            group.checkBoxName = req.body.privilegeName+group.permissionsName;
                            group.save();
                        }
                    });
                });
                //--------end UPDATE ACL PERMISSIONS (default: all checkboxes are enable)

                return res.send({redirect:'/privilege/showPrivilege'})
            }
        });
    });


};
/*-------------------------end of update PRIVILEGES ROLES*/

/* DELETE PRIVILEGE ROLE. */
module.exports.delete = function(req, res) {
    var privilegeToDelete = req.params.id;
    models.Privilege.findOne({'_id': privilegeToDelete}, function(err, privilege) {
        models.Users.findOne({ userPrivilegeID: privilege.privilegeID }, function (err, result) {
            if (err) { console.log(err) };

            if (result) {
                console.log(privilege.privilegeID);
                console.log(result);
                console.log("Privilege NOT deleted");
                return res.status(409).send(' ALERT! ' + privilege.privilegeName + ' Privilege not deleted because there are Users using this privilege. Please change Users under this privilege to other privilege and then delete this privilege.')
            }
            else {
                //delete ACL Permission-----
                function deleteAclPermission(callback) {
                    models.Privilege.findById({'_id': privilegeToDelete}, function(err, privilege){
                        var aclPermissionToDelete = privilege.privilegeID;
                        models.AclPermissions.find({'privilegeGroupID': aclPermissionToDelete}).remove().exec();
                        callback(null);
                    });
                }//----end delete ACL Permission

                function deletePrivilege(callback) {
                    models.Privilege.remove({'_id': privilegeToDelete}, function(err) {
                        //res.send((err === null) ? { msg: 'Permission not deleted' } : { msg:'error: ' + err });
                        return res.redirect('/privilege/showPrivilege');

                    });
                }

                async.waterfall([
                    deleteAclPermission,
                    deletePrivilege
                ], function (error) {
                    if (error) {
                        //handle readFile error or processFile error here
                    }
                });

            }
        });
    });
};
/* ------------ end of DELETE PRIVILEGE ROLE. */