//Dependencies
var models = require('./../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var functions = require('./../functions');

/* SHOW ALL PermissionsGroup. */
module.exports.show = function(req, res, next) {
    async.parallel([
        function(callback){
            models.PermissionsGroup.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){aclPermissions.addPermissions(req, res, callback);},   //aclPermissions addPermissions
        function(callback){aclPermissions.modifyPermissions(req, res, callback);}, //aclPermissions modifyPermissions
        function(callback){aclPermissions.deletePermissions(req, res, callback);}, //aclPermissions deletePermissions
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTabUsers(req, res, 'showUsers');
        res.render('permissionGroups/showPermissionsGroup',{
            title:'Permissions Groups',
            permissionsGroup: results[0],
            aclAddPermissions: results[1], //aclPermissions addPermissions
            aclModifyPermissions: results[2],  //aclPermissions modifyPermissions
            aclDeletePermissions: results[3],  //aclPermissions deletePermissions
            aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo

        });
    })
};

/* ADD PermissionsGroup. -------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.PermissionsGroup.find(function(error, permissionsGroup) {
            }).exec(callback);
        },
        function(callback){aclPermissions.addPermissions(req, res, callback);},  //aclPermissions addPermissions
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var arraySort = [];
        var array = [];

        var streamSort = models.PermissionsGroup.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(arraySort);
        });

        var stream = models.PermissionsGroup.find().sort({"sortID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.permissionsGroupID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('permissionGroups/addPermissionsGroup',{
                title:'Add Permissions Groups',
                arraySort: arraySort,
                array: array,
                permissionsGroup: results[0],
                aclAddPermissions: results[1],      //aclPermissions addPermissions
                aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};

module.exports.addPost = function(req, res) {
    var permissionsGroup1 = new models.PermissionsGroup({
        permissionsGroupID: req.body.permissionsGroupID,
        permissionsGroupName: req.body.permissionsGroupName,
        sortID: req.body.sortID
    });
    permissionsGroup1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            return res.status(409).send('showAlert')
        }else{
            return res.send({redirect:'/permissionGroups/showPermissionsGroup'})
        }
    });
};
/*-------------------------end of adding PermissionsGroup*/

/* UPDATE PermissionsGroup. -------------------------------*/
module.exports.update = function(req, res) {
    async.parallel([
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var arraySort = [];
        var array = [];
        models.PermissionsGroup.findById(req.params.id,function(error, permissionsGroup) {
            var streamSort = models.PermissionsGroup.find().sort({"sortID":1}).cursor();
            streamSort.on('data', function (doc) {
                arraySort.push(doc.sortID);
            }).on('error', function (err) {
                // handle the error
            }).on('close', function () {
                // the stream is closed
                //console.log(arraySort);
            });

            var stream = models.PermissionsGroup.find().sort({"sortID":1}).cursor();
            stream.on('data', function (doc) {
                array.push(doc.permissionsGroupID);
            }).on('error', function (err) {
                // handle the error
            }).on('close', function () {
                // the stream is closed
                //console.log(array);
                res.render('permissionGroups/updatePermissionsGroup', {
                    title: 'UPDATE PERMISSION GROUPS',
                    arraySort: arraySort,
                    array: array,
                    permissionsGroup: permissionsGroup,
                    aclSideMenu: results[0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            });
        });
    });
};
module.exports.updatePost = function(req, res) {
    var permissionsGroupToUpdate1 = req.body.permissionsGroupToUpdate;
    models.PermissionsGroup.findById({'_id': permissionsGroupToUpdate1}, function(err, permissionGroup){
        permissionGroup.permissionsGroupID = req.body.permissionsGroupID;
        permissionGroup.permissionsGroupName = req.body.permissionsGroupName;
        permissionGroup.sortID = req.body.sortID;
        permissionGroup.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                console.log(err);
                return res.status(409).send('showAlert')
            }else{

                //UPDATE PERMISSIONS Group_name & Group_id DATABASE--------
                var permissionToUpdate1 = req.body.oldPermissionsGroupID;
                models.Permissions.find({}, function(err, groups) {
                    if( err || !groups) console.log("No Permission groups found");
                    else groups.forEach( function(group) {
                        if (group.permissionsGroupID == permissionToUpdate1){
                            group.permissionsGroupID = req.body.permissionsGroupID;
                            group.permissionsGroupName = req.body.permissionsGroupName;
                            group.save();
                            console.log("saved");
                        }
                    });
                });
                //--------end UPDATE PERMISSIONS Group_name & Group_id Database

                return res.send({redirect:'/permissionGroups/showPermissionsGroup'})
            }
        });
    });



};
/*-------------------------end of update PermissionsGroup*/

/* DELETE PermissionsGroup. */
module.exports.delete = function(req, res) {
    var permissionsGroupToDelete = req.params.id;
    models.PermissionsGroup.findOne({'_id': permissionsGroupToDelete}, function(err, permissionsGroup) {
        models.Permissions.findOne({ permissionsGroupID: permissionsGroup.permissionsGroupID }, function (err, result) {
            if (err) { console.log(err) };

            if (result) {
                console.log(permissionsGroup.permissionsGroupID);
                console.log(result);
                console.log("Permissions Group NOT deleted");
                return res.status(409).send(' ALERT! ' + permissionsGroup.permissionsGroupName + ' Permission Group not deleted because there are Permissions using this Permission Group. Please change Permissions under this Permission Group to other Permission Group and then delete this Permission Group.')
            }
            else {
                models.PermissionsGroup.remove({'_id': permissionsGroupToDelete}, function(err) {
                    //res.send((err === null) ? { msg: 'Role not deleted' } : { msg:'error: ' + err });
                    return res.redirect('/permissionGroups/showPermissionsGroup');
                });
            }
        });
    });
};
/* ----------- end of DELETE PermissionsGroup. */