//Dependencies
var models = require('./../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var slug = require('slug');
var functions = require('./../functions');







/* UPDATE Road Functions. -------------------------------*/
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
        },
        function(callback){aclPermissions.modifyAlertGroup(req, res, callback);},  //aclPermissions modifyAlertGroup
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

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
            res.render('alertsAndGroups/alerts/updateAlerts', {
                title: 'Update Alert',
                arraySort: arraySort,
                array: array,
                userAuthID: req.user.userPrivilegeID,
                alert: results[0],
                alertGroup: results[1],
                roles: results[2],
                aclModifyAlertGroup: results[3],      //aclPermissions modifyAlertGroup
                aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        });
    })
};
module.exports.updateRoadFunctionsPost = function(req, res) {

    var alertToUpdate1 = req.body.alertToUpdate;
    models.Alerts.findById({'_id': alertToUpdate1}, function(err, alert){
        models.AlertsGroup.findOne({'groupID': req.body.alertGroupID}, function(err, group){
            alert.group.groupID = group.groupID;
            alert.group.sortID = group.sortID;
            alert.group.name = group.name;
            alert.group.mp3 = group.sound.mp3;
            alert.group.icon = group.icon;
            alert.group.color.name = group.color.name;
            alert.group.color.bgValue = group.color.bgValue;
            alert.group.color.textValue = group.color.textValue;

            alert.alertRequest911Call = req.body.request911Call;
            alert.whoCanCall911 = req.body.whoCanCall911;
            alert.alertName = req.body.alertName;
            alert.alertID = req.body.alertID;
            alert.sortID = req.body.sortID;
            alert.alertRequestProcedureCompleted = req.body.alertRequestProcedureCompleted;
            alert.alertRequestWeAreSafe = req.body.alertRequestWeAreSafe;
            alert.alertRequestForINeedHelp = req.body.alertRequestForINeedHelp;
            alert.alertRequestSendEmail = req.body.alertRequestSendEmail;
            alert.icon = req.body.icon;


            alert.save(function (err) {
                if (err && (err.code === 11000 || err.code === 11001)) {
                    console.log(err);
                    return res.status(409).send('showAlert')
                }else {
                    res.send({redirect: '/alertGroups/showAlertGroups'});
                }
            });
        });
    });
};
/*-------------------------end of update Alerts*/









/* Show Alert Road. -------------------------------*/
module.exports.show = function(req, res) {
    async.parallel([
        function(callback){
            models.Alerts.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.AlertRoadFunctions.find().sort({"sortID":1}).exec(callback);
        },
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        res.render('alertsAndGroups/alerts/road/showAlertRoad', {
            title: 'Alert Road',
            alert: results[0],
            AlertRoadFunctions: results[1],
            aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    });
};


/* Change Alert Road. -------------------------------*/
module.exports.changeRoad = function(req, res) {
    async.parallel([
        function(callback){
            models.Alerts.findById(req.params.id).exec(callback);
        },
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        res.render('alertsAndGroups/alerts/road/ChangeAlertRoad', {
            title: 'Change Alert Road',
            alert: results[0],
            aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    });
};
module.exports.changeRoadPost = function(req, res) {

    var alertToUpdate1 = req.body.alertToUpdate;
    models.Alerts.findById({'_id': alertToUpdate1}, function(err, alert){
        models.AlertsGroup.findOne({'groupID': req.body.alertGroupID}, function(err, group){
            alert.group.groupID = group.groupID;
            alert.group.sortID = group.sortID;
            alert.group.name = group.name;
            alert.group.mp3 = group.sound.mp3;
            alert.group.icon = group.icon;
            alert.group.color.name = group.color.name;
            alert.group.color.bgValue = group.color.bgValue;
            alert.group.color.textValue = group.color.textValue;

            alert.alertRequest911Call = req.body.request911Call;
            alert.whoCanCall911 = req.body.whoCanCall911;
            alert.alertName = req.body.alertName;
            alert.alertID = req.body.alertID;
            alert.sortID = req.body.sortID;
            alert.alertRequestProcedureCompleted = req.body.alertRequestProcedureCompleted;
            alert.alertRequestWeAreSafe = req.body.alertRequestWeAreSafe;
            alert.alertRequestForINeedHelp = req.body.alertRequestForINeedHelp;
            alert.alertRequestSendEmail = req.body.alertRequestSendEmail;
            alert.icon = req.body.icon;


            alert.save(function (err) {
                if (err && (err.code === 11000 || err.code === 11001)) {
                    console.log(err);
                    return res.status(409).send('showAlert')
                }else {
                    res.send({redirect: '/alertGroups/showAlertGroups'});
                }
            });
        });
    });
};

module.exports.deleteRoad = function(req, res) {

};
/*-------------------------end of Alert Road*/






/* CREATE AlertRoadFunctions. -------------------------------*/
module.exports.createFunctions = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertRoadFunctions.find(function(error, alerts) {

            }).exec(callback);
        },
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){

        var arraySort = [];
        var array = [];

        var streamSort = models.AlertRoadFunctions.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
        });

        var stream = models.AlertRoadFunctions.find().sort({"sortID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.functionID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed

            res.render('alertsAndGroups/alerts/road/createFunction',{
                title:'Create Function',
                arraySort: arraySort,
                array: array,
                functions: results[0],
                pageToReturn: req.params.id,
                aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};

module.exports.createFunctionsPost = function(req, res) {

    var function1 = new models.AlertRoadFunctions({
        sortID: req.body.sortID,
        functionID: req.body.functionID,
        functionName: req.body.functionName
    });

    function1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            return res.status(409).send('showAlert')
        }else{
            return res.send({redirect:'/alerts/showRoad/' + req.body.pageToReturn})
        }
    });

};
/*-------------------------end of adding Alerts*/


/* UPDATE AlertRoadFunctions. -------------------------------*/
module.exports.updateFunctions = function(req, res) {
    //console.log('req.params.function_id');
    //console.log(req.params.alert_id);
    async.parallel([
        function(callback){
            models.AlertRoadFunctions.findById(req.params.function_id,function(error, functions) {
            }).exec(callback);

        },
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu


    ],function(err, results){
        var arraySort = [];
        var array = [];

        var streamSort = models.AlertRoadFunctions.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
        });

        var stream = models.AlertRoadFunctions.find().sort({"sortID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.functionID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed

            res.render('alertsAndGroups/alerts/road/updateFunction',{
                title:'Update Function',
                arraySort: arraySort,
                array: array,
                functions: results[0],
                pageToReturn: req.params.alert_id,
                aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};
module.exports.updateFunctionsPost = function(req, res) {
    var functionToUpdate1 = req.body.alertGroupToUpdate;
    var oldFunctionName = req.body.oldAlertGroupName;
    var newFunctionName = req.body.name;

    models.AlertRoadFunctions.findById({'_id': functionToUpdate1}, function(err, functions){
        functions.functionID = req.body.groupID;
        functions.functionName = req.body.name;
        functions.sortID = req.body.sortID;

        functions.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                console.log(err);
                return res.status(409).send('showAlert')
            }
            else{
                //UPDATE Alerts Function name DATABASE--------
                models.Alerts.find({}, function(err, alerts) {
                    if( err || !alerts) console.log("No alerts to update");
                    else {
                        alerts.forEach(function (alert) {
                            alert.alertRoad.forEach(function (road) {
                                if (road.callFunction.includes(oldFunctionName)) {
                                    var index = road.callFunction.indexOf(oldFunctionName);
                                    road.callFunction.set(index, newFunctionName);
                                    alert.save();
                                }
                            });
                        });
                    }
                });
                //--------end UPDATE Alerts Function name Database

                return res.send({redirect:'/alerts/showRoad/' + req.body.pageToReturn})
            }
        });
    });
};
/*-------------------------end of update AlertGroups*/








/* PROCEDURE Alerts. -------------------------------*/
module.exports.procedure = function(req, res) {
    async.parallel([
        function(callback){
            models.Alerts.findById(req.params.id).exec(callback);
        },
        function(callback){aclPermissions.modifyProcedure(req, res, callback);},   //aclPermissions modifyProcedure
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){

        res.render('alertsAndGroups/alerts/procedure', {
            userAuthID: req.user.userPrivilegeID,
            userAuthRedirect: req.user.redirect,
            alert: results[0],
            aclModifyProcedure: results[1], //aclPermissions modifyProcedure
            aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
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
        res.redirect('/alertGroups/showAlertGroups');
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

    })
};/* ------------ end of SoftDeleted Alerts. */


/* DELETE Alerts. */
module.exports.delete = function(req, res) {
    var alertToDelete = req.params.id;

    function deleteAlert(callback) {
        models.Alerts.remove({'_id': alertToDelete}, function(err) {
            return res.redirect('/alerts/addAlerts');
        });
    }

    async.waterfall([
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
        function(callback){aclPermissions.deleteUsers(req, res, callback);},        //aclPermissions deleteUsers
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        res.render('alertsAndGroups/alerts/crud911Users',{
            title: results[0].alertName,
            utility: results[0],
            allUtilUsers: results[1],
            userAuthID: req.user.userPrivilegeID,
            aclShowDeletedUsers: results[2], //aclPermissions showDeletedUsers
            aclShowUsers: results[3], //aclPermissions showUsers
            aclAddUsers: results[4], //aclPermissions addUsers
            aclModifyUsers: results[5],  //aclPermissions modifyUsers
            aclDeleteUsers: results[6],  //aclPermissions deleteUsers
            aclSideMenu: results[7],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
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
        return res.send({redirect:'/alertGroups/showAlertGroups'})
    });
};
/*-------------------------end of SHOW/UPDATE/DELETE 911 USER ROLES*/