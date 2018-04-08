//Dependencies
var models = require('./../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var slug = require('slug');


/* SHOW Active Alerts. */
module.exports.show = function(req, res, next) {
/*
    models.Alerts.find(function(err, alert) {
        res.render('alerts/showAlerts', { title: 'Alerts', alert: alert });
    }).sort({"alertTypeID":1}).sort({"alertID":1});
*/
    async.parallel([
        function(callback){
            models.Alerts.find().sort({"alertTypeID":1}).sort({"alertID":1}).exec(callback);
        },
        function(callback){
            models.AlertsGroup.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){aclPermissions.addAlerts(req, res, callback);},   //aclPermissions addAlerts
        function(callback){aclPermissions.modifyAlert(req, res, callback);},   //aclPermissions modifyAlert
        function(callback){aclPermissions.deleteAlert(req, res, callback);},   //aclPermissions deleteAlert
        function(callback){aclPermissions.showProcedure(req, res, callback);}   //aclPermissions showProcedure

    ],function(err, results){
        //console.log(results[2]);
        res.render('alerts/showAlerts',{
            title:'Alerts',
            userAuthID: req.user.userPrivilegeID,
            alert: results[0],
            alertsGroup: results[1],
            aclAddAlert: results[2], //aclPermissions addAlerts
            aclModifyAlert: results[3], //aclPermissions modifyAlert
            aclDeleteAlert: results[4], //aclPermissions deleteAlert
            aclShowProcedure: results[5] //aclPermissions showProcedure
        });
    })
};
/* end of SHOW active Alerts. */

/* SHOW SoftDeleted ALERTS. */
module.exports.showSoftDeleted = function(req, res, next) {
    async.parallel([
        function(callback){
            models.Alerts.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){aclPermissions.addAlerts(req, res, callback);},   //aclPermissions addAlerts
        function(callback){aclPermissions.modifyAlert(req, res, callback);},   //aclPermissions modifyAlert
        function(callback){aclPermissions.showProcedure(req, res, callback);}   //aclPermissions showProcedure

    ],function(err, results){
        res.render('alerts/addAlerts',{
            title:'Add Alerts',
            userAuthID: req.user.userPrivilegeID,
            alert: results[0],
            aclAddAlert: results[1], //aclPermissions addAlerts
            aclModifyAlert: results[2], //aclPermissions modifyAlert
            aclShowProcedure: results[3] //aclPermissions showProcedure
        });
    })

};
/* ------------ end of SHOW SoftDeleted USERS. */

/* CREATE Alert. -------------------------------*/
module.exports.create = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertsGroup.find(function(error, alertsGroup) {

            }).sort({"alertsTypeID":1}).exec(callback);
        },
        function(callback){
            models.Alerts.find(function(error, alerts) {

            }).exec(callback);
        },
        function(callback){
            models.Roles2.find().sort({"roleID":1}).exec(callback);
        },
        function(callback){aclPermissions.addAlerts(req, res, callback);}  //aclPermissions addAlerts

    ],function(err, results){
        var arraySort = [];
        var array = [];

        var streamSort = models.Alerts.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(arraySort);
        });

        var stream = models.Alerts.find().sort({"sortID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.alertID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('alerts/createAlert',{
                title:'Create Alert',
                arraySort: arraySort,
                array: array,
                userAuthID: req.user.userPrivilegeID,
                alertGroup: results[0],
                alert: results[1],
                roles: results[2],
                aclAddAlerts: results[3]      //aclPermissions addAlerts
            });
        })
    })
};

module.exports.createPost = function(req, res) {
console.log('req.body.alertGroupID = ',req.body.alertGroupID);
    models.AlertsGroup.find({'alertTypeID': req.body.alertGroupID}, function(err, alertGroup){
        console.log('alertGroup = ',alertGroup);
        console.log('alertGroup.colorName = ',alertGroup[0].colorName);

        var alert1 = new models.Alerts({
            alertTypeID: req.body.alertGroupID,
            alertTypeName: req.body.alertGroupName,
            alertTypeColorName: alertGroup[0].colorName,
            alertTypeColorValue: alertGroup[0].colorValue,
            alertRequest911Call: req.body.request911Call,
            whoCanCall911: req.body.whoCanCall911,
            alertID: req.body.alertID,
            alertName: req.body.alertName,
            alertSlugName: slug(req.body.alertName),
            alertProcedure: req.body.alertProcedure,
            sortID: req.body.sortID
        });
        alert1.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                return res.status(409).send('showAlert')
            }else{
                var typeAclAlert = 'AclAlertsReal';
                addAclAlerts(req, res, typeAclAlert);

                typeAclAlert = 'AclAlertsTest';
                addAclAlerts(req, res, typeAclAlert);

                return res.send({redirect:'/alerts/showAlerts'})
            }
            //-------- adding ACL ALERTS
            function addAclAlerts(req, res, typeAclAlert){
                models.Roles2.find({}, function(err, groups) {
                    for (var u=0; u < groups.length;u++){
                        var aclAlertSend = new models[typeAclAlert]({
                            roleGroupID: groups[u].roleID,
                            roleGroupName: groups[u].roleName,
                            alertTypeID: req.body.alertGroupID,
                            alertTypeName: req.body.alertGroupName,
                            alertTypeValue: alertGroup[0].colorValue,
                            alertID: req.body.alertID,
                            alertName: req.body.alertName,
                            checkBoxType: 'send',
                            checkBoxID: 's'+groups[u].roleID+req.body.alertID,
                            checkBoxName: 's'+groups[u].roleName+req.body.alertName
                        });
                        aclAlertSend.save();
                        var aclAlertReceive = new models[typeAclAlert]({
                            roleGroupID: groups[u].roleID,
                            roleGroupName: groups[u].roleName,
                            alertTypeID: req.body.alertGroupID,
                            alertTypeName: req.body.alertGroupName,
                            alertTypeValue: alertGroup[0].colorValue,
                            alertID: req.body.alertID,
                            alertName: req.body.alertName,
                            checkBoxType: 'receive',
                            checkBoxID: 'r'+groups[u].roleID+req.body.alertID,
                            checkBoxName: 'r'+groups[u].roleName+req.body.alertName
                        });
                        aclAlertReceive.save();
                    }
                    console.log('******************* END FUNCTION ADD ACL ALERTS = ' + typeAclAlert);
                });
            }
            //--------end adding ACL ALERTS
        });


    });



};
/*-------------------------end of adding Alerts*/



/* UPDATE Alerts. -------------------------------*/
module.exports.update = function(req, res) {
    var arraySort = [];
    var array = [];
    async.parallel([
        function(callback){
            models.Alerts.findById(req.params.id).exec(callback);
        },
        function(callback) {
            models.AlertsGroup.find().sort({"sortID": 1}).exec(callback);
        },
        function(callback){
            models.Roles2.find().sort({"roleID":1}).exec(callback);
        }
    ],function(err, results){

        var streamSort = models.Alerts.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(arraySort);
        });

        var stream = models.Alerts.find().sort({"alertID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.alertID);

        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('alerts/updateAlerts', {
                title: 'Update Alert',
                arraySort: arraySort,
                array: array,
                userAuthID: req.user.userPrivilegeID,
                alert: results[0],
                alertGroup: results[1],
                roles: results[2]
            });
        });
    })
};
module.exports.updatePost = function(req, res) {
    var alertToUpdate1 = req.body.alertToUpdate;
    models.Alerts.findById({'_id': alertToUpdate1}, function(err, alert){
        models.AlertsGroup.find({'alertTypeID': req.body.alertGroupID}, function(err, alertGroup){
            alert.alertTypeID = req.body.alertGroupID;
            alert.alertTypeName = req.body.alertGroupName;
            alert.alertTypeColorName = alertGroup[0].colorName;
            alert.alertTypeColorValue = alertGroup[0].colorValue;
            alert.alertRequest911Call = req.body.request911Call;
            alert.whoCanCall911 = req.body.whoCanCall911;
            alert.alertName = req.body.alertName;
            alert.alertID = req.body.alertID;
            alert.sortID = req.body.sortID;
            alert.save(function (err) {
                if (err && (err.code === 11000 || err.code === 11001)) {
                    console.log(err);
                    return res.status(409).send('showAlert')
                }else {

                    var typeAclAlert = 'AclAlertsReal';
                    updateAclAlerts(typeAclAlert);

                    typeAclAlert = 'AclAlertsTest';
                    updateAclAlerts(typeAclAlert);

                    res.send({redirect: '/alerts/showAlerts'});
                }
                //UPDATE ACL ALERTS--------
                function updateAclAlerts(typeAclAlert){
                    models[typeAclAlert].find({}, function(err, groups) {
                        if( err || !groups) console.log("No Alerts groups found");
                        else groups.forEach( function(group) {
                            if (group.checkBoxID == 's'+group.roleGroupID+req.body.oldAlertID){
                                group.alertTypeID = req.body.alertGroupID;
                                group.alertTypeName = req.body.alertGroupName;
                                group.alertTypeValue = alertGroup[0].colorValue;
                                group.alertID = req.body.alertID;
                                group.alertName = req.body.alertName;
                                group.checkBoxType = 'send';
                                group.checkBoxID = 's'+group.roleGroupID+req.body.alertID;
                                group.checkBoxName = 's'+group.roleGroupName+req.body.alertName;
                                group.save();
                            }
                            if (group.checkBoxID == 'r'+group.roleGroupID+req.body.oldAlertID){
                                group.alertTypeID = req.body.alertGroupID;
                                group.alertTypeName = req.body.alertGroupName;
                                group.alertTypeValue = alertGroup[0].colorValue;
                                group.alertID = req.body.alertID;
                                group.alertName = req.body.alertName;
                                group.checkBoxType = 'receive';
                                group.checkBoxID = 'r'+group.roleGroupID+req.body.alertID;
                                group.checkBoxName = 'r'+group.roleGroupName+req.body.alertName;
                                group.save();
                            }
                        });
                    });
                }
                //--------end UPDATE ACL ALERT (default: all checkboxes are enable)
            });
        });



    });


};
/*-------------------------end of update Alerts*/

/* PROCEDURE Alerts. -------------------------------*/
module.exports.procedure = function(req, res) {
    async.parallel([
        function(callback){
            models.Alerts.findById(req.params.id).exec(callback);
        },
        function(callback){aclPermissions.modifyProcedure(req, res, callback);}   //aclPermissions modifyProcedure

    ],function(err, results){

        res.render('alerts/procedure', {
            userAuthID: req.user.userPrivilegeID,
            alert: results[0],
            aclModifyProcedure: results[1] //aclPermissions modifyProcedure
        });
    })

};

module.exports.procedurePost = function(req, res) {
    var alertToUpdate1 = req.body.alertToUpdate;
    models.Alerts.findById({'_id': alertToUpdate1}, function(err, alert){
        alert.alertProcedure = req.body.alertProcedure;
        alert.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                console.log(err);
                return res.status(409).send('showAlert')
            }
            //res.send({redirect:'/alerts/showAlerts'});
        });
    });
};
/*-------------------------end of PROCEDURE Alerts*/


/* SoftDeleted Alerts. */
module.exports.softDelete = function(req, res) {
    var alertToSoftDelete = req.params.id;
    models.Alerts.findById({'_id': alertToSoftDelete}, function(err, alert){
        alert.softDeleted = true;
        alert.save();
        res.redirect('/alerts/showAlerts');

        //UPDATE ACL ALERTS--------
        var aclAlertsToUpdate =  alert.alertID;
        var typeAclAlert = 'AclAlertsReal';
        updateAclAlerts(aclAlertsToUpdate);

        typeAclAlert = 'AclAlertsTest';
        updateAclAlerts(aclAlertsToUpdate);

        function updateAclAlerts(aclAlertsToUpdate){
            models[typeAclAlert].find({'alertID': aclAlertsToUpdate }, function(err, groups) {
                groups.forEach( function(group) {
                    group.alertSoftDeleted = true;
                    group.save();
                });
            });
        }
        //--------end UPDATE ACL ALERT
    });



};
/* ------------ end of SoftDeleted Alerts. */

/* Restore SoftDeleted Alerts. */
module.exports.restoreAlert = function(req, res) {
    var alertToRestore = req.params.id;

    models.Alerts.findById({'_id': alertToRestore}, function(err, alert){
        alert.softDeleted = false;
        alert.save();
        res.redirect('/alerts/addAlerts');

        //UPDATE ACL ALERTS--------
        var aclAlertsToUpdate =  alert.alertID;
        var typeAclAlert = 'AclAlertsReal';
        updateAclAlerts(aclAlertsToUpdate);

        typeAclAlert = 'AclAlertsTest';
        updateAclAlerts(aclAlertsToUpdate);

        function updateAclAlerts(aclAlertsToUpdate){
            models[typeAclAlert].find({'alertID': aclAlertsToUpdate }, function(err, groups) {
                groups.forEach( function(group) {
                    group.alertSoftDeleted = false;
                    group.save();
                });
            });
        }
        //--------end UPDATE ACL ALERT
    })
};/* ------------ end of SoftDeleted Alerts. */


/* DELETE Alerts. */
module.exports.delete = function(req, res) {
    var alertToDelete = req.params.id;
    //delete ACL Alert-----
    function deleteAclAlert(callback) {
        models.Alerts.findById({'_id': alertToDelete}, function(err, alert){
            var aclAlertToDelete = alert.alertID;
            models.AclAlertsReal.find({'alertID': aclAlertToDelete}).remove().exec();
            models.AclAlertsTest.find({'alertID': aclAlertToDelete}).remove().exec();
            callback(null);
        });
    } //----end delete ACL ALERT

    function deleteAlert(callback) {
        models.Alerts.remove({'_id': alertToDelete}, function(err) {
            //res.send((err === null) ? { msg: 'Permission not deleted' } : { msg:'error: ' + err });
            return res.redirect('/alerts/addAlerts');

        });
    }

    async.waterfall([
        deleteAclAlert,
        deleteAlert
    ], function (error) {
        if (error) {
            //handle readFile error or processFile error here
        }
    });
};
/* ----- end of DELETE Alerts. */

/* SHOW/UPDATE/DELETE 911 USER ROLES. */
module.exports.show911UserRoles = function(req, res, next) {
    async.parallel([
        function(callback){
            models.Alerts.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.Roles2.find().exec(callback);
        },
        function(callback){aclPermissions.showDeletedUsers(req, res, callback);},   //aclPermissions showDeletedUsers
        function(callback){aclPermissions.showUsers(req, res, callback);},          //aclPermissions showUsers
        function(callback){aclPermissions.addUsers(req, res, callback);},           //aclPermissions addUsers
        function(callback){aclPermissions.modifyUsers(req, res, callback);},        //aclPermissions modifyUsers
        function(callback){aclPermissions.deleteUsers(req, res, callback);}         //aclPermissions deleteUsers


    ],function(err, results){
        res.render('alerts/crud911Users',{
            title: results[0].alertName,
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
module.exports.update911UserRolesPost = function(req, res) {
    var utilityToUpdate1 = req.body.utilityToUpdate;
    models.Alerts.findById({'_id': utilityToUpdate1}, function(err, utility){
        utility.whoCanCall911 = req.body.whoCanCall911;
        if (utility.whoCanCall911 === undefined || utility.whoCanCall911.length < 1){ //put radio button off if array is empty
            utility.alertRequest911Call = 'false';
        }
        utility.save();
        return res.send({redirect:'/alerts/showAlerts'})
    });
};
/*-------------------------end of SHOW/UPDATE/DELETE 911 USER ROLES*/