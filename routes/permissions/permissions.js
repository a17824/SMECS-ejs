//Dependencies
var models = require('./../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var functions = require('./../functions');

/* SHOW Permissions. */
module.exports.show = function(req, res, next) {
    async.parallel([
        function(callback){
            models.Permissions.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){
            models.PermissionsGroup.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){aclPermissions.addPermissions(req, res, callback);},   //aclPermissions addPermissions
        function(callback){aclPermissions.modifyPermissions(req, res, callback);}, //aclPermissions modifyPermissions
        function(callback){aclPermissions.deletePermissions(req, res, callback);}, //aclPermissions deletePermissions
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTabUsers(req, res, 'showUsers');
        res.render('permissions/showPermissions',{
            title:'Permissions',
            permissions: results[0],
            permissionsGroup: results[1],
            aclAddPermissions: results[2], //aclPermissions addPermissions
            aclModifyPermissions: results[3],  //aclPermissions modifyPermissions
            aclDeletePermissions: results[4],  //aclPermissions deletePermissions
            aclSideMenu: results[5][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};

/* ADD Permissions. -------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.PermissionsGroup.find(function(error, permissionsGroup) {

            }).sort({"sortID":1}).exec(callback);
        },
        function(callback){
            models.Permissions.find(function(error, permissions) {

            }).exec(callback);},
        function(callback){aclPermissions.addPermissions(req, res, callback);},  //aclPermissions addPermissions
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        var arraySort = [];
        var array = [];

        var streamSort = models.Permissions.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(arraySort);
        });

        var stream = models.Permissions.find().sort({"sortID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.permissionsID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('permissions/addPermissions',{
                title:'Add Permissions',
                arraySort: arraySort,
                array: array,
                permissionsGroup: results[0],
                permissions: results[1],
                aclAddPermissions: results[2],      //aclPermissions addPermissions
                aclSideMenu: results[3][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};

module.exports.addPost = function(req, res) {
    var permissions1 = new models.Permissions({
        permissionsGroupID: req.body.permissionsGroupID,
        permissionsGroupName: req.body.permissionsGroupName,
        permissionsID: req.body.permissionsID,
        permissionsName: req.body.permissionsName,
        sortID: req.body.sortID
    });
    permissions1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            console.log("err - ",err);
            return res.status(409).send('showAlert')
        }else{
            return res.send({redirect:'/permissions/showPermissions'})
        }
    });
    //add ACL PERMISSIONS--------
    models.Privilege.find({}, function(err, groups) {
        if( err || !groups) console.log("No Privilege groups found");
        else groups.forEach( function(group) {
            console.log(group.privilegeName);
            var aclPermission1 = new models.AclPermissions({
                privilegeGroupID: group.privilegeID,
                privilegeGroupName: group.privilegeName,
                permissionsID: req.body.permissionsID,
                permissionsName: req.body.permissionsName,
                checkBoxID: group.privilegeID+req.body.permissionsID,
                checkBoxName: group.privilegeName+req.body.permissionsName
            });
            aclPermission1.save();
        });
    });
    //--------end adding ACL PERMISSIONS (default: all checkboxes are disable)
};
/*-------------------------end of adding Permissions*/

/* UPDATE Permissions. -------------------------------*/
module.exports.update = function(req, res) {
    var arraySort = [];
    var arrayPermissions = [];
    async.parallel([
        function(callback){
            models.Permissions.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.PermissionsGroup.find().sort({"sortID":1}).exec(callback);
        },
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        models.Permissions.find(function(error) {
            var streamSort = models.Permissions.find().sort({"sortID":1}).cursor();
            streamSort.on('data', function (doc) {
                arraySort.push(doc.sortID);
            }).on('error', function (err) {
                // handle the error
            }).on('close', function () {
                // the stream is closed
                //console.log(arraySort);
            });

            var stream2 = models.Permissions.find().sort({"sortID":1}).cursor();
            stream2.on('data', function (doc) {
                arrayPermissions.push(doc.permissionsID);

            }).on('error', function (err) {
                // handle the error
            }).on('close', function () {
                // the stream2 is closed
                //console.log(arrayPermissions);
                res.render('permissions/updatePermissions', {
                    title: 'Update Permission',
                    arraySort: arraySort,
                    arrayPermissions: arrayPermissions,
                    permission: results[0],
                    permissionGroup: results[1],
                    aclSideMenu: results[2][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            });
        });
    })
};
module.exports.updatePost = function(req, res) {
    var permissionToUpdate1 = req.body.permissionToUpdate;
    var aclPermissionToUpdate1 = req.body.oldPermissionID;
    models.Permissions.findById({'_id': permissionToUpdate1}, function(err, permission){
        permission.permissionsGroupSortID = req.body.permissionsGroupSortID;
        permission.permissionsGroupID = req.body.permissionsGroupID;
        permission.permissionsGroupName = req.body.permissionsGroupName;
        permission.permissionsName = req.body.permissionsName;
        permission.sortID = req.body.sortID;
        permission.permissionsID = req.body.permissionsID;
        permission.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                console.log(err);
                return res.status(409).send('showAlert')
            }
            //UPDATE ACL PERMISSIONS--------
            models.AclPermissions.find({}, function(err, groups) {
                if( err || !groups) console.log("No Privilege groups found");
                else groups.forEach( function(group) {
                    //console.log(group.privilegeName);
                    if (group.permissionsID == aclPermissionToUpdate1){
                        group.permissionsID = req.body.permissionsID;
                        group.permissionsName = req.body.permissionsName;
                        group.checkBoxID = group.privilegeGroupID+req.body.permissionsID;
                        group.checkBoxName = group.privilegeGroupName+req.body.permissionsName;
                        group.save();
                    }
                });
            });
            //--------end UPDATE ACL PERMISSIONS (default: all checkboxes are disable)

            res.send({redirect:'/permissions/showPermissions'});
        });
    });

};
/*-------------------------end of update Permissions*/

/* DELETE Permissions. */
module.exports.delete = function(req, res) {
    var permissionsToDelete = req.params.id;
    //delete ACL Permission-----
    function deleteAclPermission(callback) {
        models.Permissions.findById({'_id': permissionsToDelete}, function(err, permission){
            var aclPermissionToDelete = permission.permissionsID;
            models.AclPermissions.find({'permissionsID': aclPermissionToDelete}).remove().exec();
            callback(null);
        });
    } //----end delete ACL Permission

    function deletePermission(callback) {
        models.Permissions.remove({'_id': permissionsToDelete}, function(err) {
            //res.send((err === null) ? { msg: 'Permission not deleted' } : { msg:'error: ' + err });
            return res.redirect('/permissions/showPermissions');

        });
    }

    async.waterfall([
        deleteAclPermission,
        deletePermission
    ], function (error) {
        if (error) {
            //handle readFile error or processFile error here
        }
    });
};
/* ----- end of DELETE Permissions. */