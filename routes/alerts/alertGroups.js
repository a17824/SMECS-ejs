//Dependencies
var models = require('./../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var functions = require('./../functions');
var buildIconsColorSound = require('./../../public/icons/js/icons');


/* ADD AlertGroups. -------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertsGroup.find(function(error, alertGroup) {

            }).exec(callback);
        },
        function(callback){aclPermissions.showAlertGroups(req, res, callback);}, //aclPermissions showAlertGroups
        function(callback){aclPermissions.addAlertGroup(req, res, callback);},  //aclPermissions addAlertGroup
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var arraySort = [];
        var array = [];

        var streamSort = models.AlertsGroup.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(arraySort);
        });

        var stream = models.AlertsGroup.find().sort({"sortID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.alertTypeID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            console.log('arraySort = ',arraySort);
            res.render('alertsAndGroups/alertGroups/addAlertGroups',{
                title:'Add Alert Group',
                arraySort: arraySort,
                array: array,
                userAuthID: req.user.userPrivilegeID,
                alertGroup: results[0],
                aclShowAlertGroups: results[1],     //aclPermissions showAddAlertGroup
                aclAddAlertGroup: results[2],      //aclPermissions addAddAlertGroup
                aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};
module.exports.addPost = function(req, res) {

    var alertGroup1 = new models.AlertsGroup({
        alertTypeID: req.body.alertGroupID,
        alertTypeName: req.body.alertGroupName,
        sortID: req.body.sortID,
        colorName: req.body.colorName,
        colorValue: req.body.colorValue,
        icon: req.body.icon,
        sound: req.body.sound

    });
    alertGroup1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            return res.status(409).send('showAlert')
        }else{
            return res.send({redirect:'/alertGroups/showAlertGroups'})
        }
    });
};
/*-------------------------end of adding AlertGroups*/

/* UPDATE AlertGroups. -------------------------------*/
module.exports.update = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertsGroup.findById(req.params.id,function(error, alertGroup) {

            }).exec(callback);
        },
        function(callback){buildIconsColorSound.soundBuild(function(sound){callback(null, sound);});},  //sounds
        function(callback){aclPermissions.modifyAlertGroup(req, res, callback);},  //aclPermissions modifyAlertGroup
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu


    ],function(err, results){
        var arraySort = [];
        var array = [];

        console.log('SOUNDS = ',results[1][0]);

        var streamSort = models.AlertsGroup.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(arraySort);
        });

        var stream = models.AlertsGroup.find().sort({"sortID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.alertTypeID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            res.render('alertsAndGroups/alertGroups/updateGroups',{
                title:'Update Alert Group',
                userAuthID: req.user.userPrivilegeID,
                arraySort: arraySort,
                array: array,
                alertGroup: results[0],
                sounds: results[1], //ex: sounds[0][1] -> Sirens | ex: sounds[1].Animals[1].name -> Ambulance
                aclModifyAlertGroup: results[2],      //aclPermissions modifyAlertGroup
                aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};
module.exports.updatePost = function(req, res) {
    var alertGroupToUpdate1 = req.body.alertGroupToUpdate;
    models.AlertsGroup.findById({'_id': alertGroupToUpdate1}, function(err, alertGroup){
        alertGroup.alertTypeID = req.body.alertGroupID;
        alertGroup.alertTypeName = req.body.alertGroupName;
        alertGroup.sortID = req.body.sortID;
        alertGroup.colorName = req.body.colorName;
        alertGroup.colorValue = req.body.colorValue;
        alertGroup.icon = req.body.icon;
        alertGroup.sound = req.body.sound;

        alertGroup.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                console.log(err);
                return res.status(409).send('showAlert')
            }else{
                //UPDATE Alerts Group_name & Group_id DATABASE--------
                var alertToUpdate1 = req.body.oldAlertGroupID;
                models.Alerts.find({}, function(err, groups) {
                    if( err || !groups) console.log("No Permission groups found");
                    else groups.forEach( function(group) {
                        if (group.alertTypeID == alertToUpdate1){
                            group.alertTypeID = req.body.alertGroupID;
                            group.alertTypeSortID = req.body.sortID;
                            group.alertTypeName = req.body.alertGroupName;
                            group.alertTypeColorName = req.body.colorName;
                            group.alertTypeColorValue = req.body.colorValue;
                            group.save(function (err) {
                                if (err && (err.code === 11000 || err.code === 11001)) {
                                    console.log(err);
                                    return res.status(409).send('showAlert')
                                }else {
                                    var typeAclAlert = 'AclAlertsReal';
                                    updateAclAlerts(typeAclAlert);

                                    typeAclAlert = 'AclAlertsTest';
                                    updateAclAlerts(typeAclAlert);

                                }
                                //UPDATE ACL ALERTS--------
                                function updateAclAlerts(typeAclAlert){
                                    models[typeAclAlert].find({}, function(err, aclGroups) {
                                        if( err || !aclGroups) console.log("No Alerts groups found");
                                        else aclGroups.forEach( function(aclGroup) {
                                            if (aclGroup.checkBoxID == 's'+aclGroup.roleGroupID+aclGroup.alertID && req.body.oldAlertGroupID == aclGroup.alertTypeID ){
                                                aclGroup.alertTypeID = group.alertTypeID;
                                                aclGroup.alertTypeSortID = group.alertTypeSortID;
                                                aclGroup.alertTypeName = req.body.alertGroupName;
                                                aclGroup.alertTypeValue = req.body.colorValue;
                                                aclGroup.save();
                                            }
                                            if (aclGroup.checkBoxID == 'r'+aclGroup.roleGroupID+aclGroup.alertID && req.body.oldAlertGroupID == aclGroup.alertTypeID){
                                                aclGroup.alertTypeID = group.alertTypeID;
                                                aclGroup.alertTypeSortID = group.alertTypeSortID;
                                                aclGroup.alertTypeName = req.body.alertGroupName;
                                                aclGroup.alertTypeValue = req.body.colorValue;
                                                aclGroup.save();
                                            }
                                        });
                                    });
                                }
                                //--------end UPDATE ACL ALERT (default: all checkboxes are enable)
                            });
                        }
                    });
                });
                //--------end UPDATE Alerts Group_name & Group_id Database
                return res.send({redirect:'/alertGroups/showAlertGroups'})
            }
        });
    });

};
/*-------------------------end of update AlertGroups*/

/* DELETE AlertGroups. */
module.exports.delete = function(req, res) {
    var alertGroupToDelete = req.params.id;
    models.AlertsGroup.findOne({'_id': alertGroupToDelete}, function(err, alertGroup) {
        models.Alerts.findOne({ alertTypeID: alertGroup.alertTypeID }, function (err, result) {
            if (err) { console.log(err) };

            if (result) {
                console.log("Alert Group NOT deleted");
                //return res.status(409).send(' ALERT! ' + alertGroup.alertTypeName + ' Group not deleted because there are Alerts using this Alert Group. Please change the Alerts under this Alert Group to other Group and then delete this Alert Group.');
                req.flash('error_messages', ' Attention! ' + alertGroup.alertTypeName + ' Group not deleted because there are Alerts using this Alert Group. <br> Please change the Alerts under this Alert Group to other Group and then delete this Alert Group.');
                res.redirect('/alertGroups/showAlertGroups');
            } else {
                models.AlertsGroup.remove({'_id': alertGroupToDelete}, function(err) {
                    //res.send((err === null) ? { msg: 'Role not deleted' } : { msg:'error: ' + err });
                    return res.redirect('/alertGroups/showAlertGroups');
                });
            }
        });
    });
};
/* ---- end of DELETE AlertGroups. */
