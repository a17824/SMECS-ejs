//Dependencies
var models = require('./../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var functions = require('./../functions');
var schedule = require('node-schedule');


/* SHOW SoftDeleted ALERTS. */
module.exports.showSoftDeleted = function(req, res, next) {
    async.parallel([
        function(callback){
            models.Alerts.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){aclPermissions.addAlerts(req, res, callback);},   //aclPermissions addAlerts
        function(callback){aclPermissions.modifyAlert(req, res, callback);},   //aclPermissions modifyAlert
        function(callback){aclPermissions.showProcedure(req, res, callback);},   //aclPermissions showProcedure
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectPage(req, res, 'addAlerts');
        functions.redirectTabUsers(req, res, 'showUsers');
        functions.redirectTabAlertGroups(req, res, 'showAlerts');

        res.render('alertsAndGroups/alerts/addAlerts',{
            title:'Add Alerts',
            userAuthID: req.user.userPrivilegeID,
            alert: results[0],
            aclAddAlert: results[1], //aclPermissions addAlerts
            aclModifyAlert: results[2], //aclPermissions modifyAlert
            aclShowProcedure: results[3], //aclPermissions showProcedure
            aclSideMenu: results[4][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
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
        function(callback){aclPermissions.addAlerts(req, res, callback);},  //aclPermissions addAlerts
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        var arraySort = [];
        var array = [];

        let arrayRoles = [];
        results[2].forEach(function (role) {
            if(role.roleID !== 97)
                arrayRoles.push(role);
        });

        var streamSort = models.Alerts.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
        });

        var stream = models.Alerts.find().sort({"sortID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.alertID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            res.render('alertsAndGroups/alerts/createAlert',{
                title:'Create Alert',
                arraySort: arraySort,
                array: array,
                userAuthID: req.user.userPrivilegeID,
                alertGroup: results[0],
                alert: results[1],
                roles: arrayRoles,
                aclAddAlerts: results[3],      //aclPermissions addAlerts
                aclSideMenu: results[4][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};

module.exports.createPost = function(req, res) {

    models.AlertsGroup.findOne({'groupID': req.body.alertGroupID}, function(err, group){
        models.Roles2.find({}, function(err, roles) {
            var rolesArray = [];
            roles.forEach(function (role) {
                var roleData = {
                    roleID: role.roleID,
                    roleName: role.roleName,
                    checkbox: false
                };
                rolesArray.push(roleData);
            });

            var alert1 = new models.Alerts({
                group: {
                    groupID: group.groupID,
                    sortID: group.sortID,
                    name: group.name,
                    mp3: group.sound.mp3,
                    icon: group.icon,
                    color: {
                        name: group.color.name,
                        bgValue: group.color.bgValue,
                        textValue: group.color.textValue
                    }
                },
                alertRequest911Call: req.body.request911Call,
                alertRequestProcedureCompleted: req.body.alertRequestProcedureCompleted,
                alertRequestWeAreSafe: req.body.alertRequestWeAreSafe,
                alertRequestForINeedHelp: req.body.alertRequestForINeedHelp,
                whoCanCall911: req.body.whoCanCall911,
                alertID: req.body.alertID,
                alertName: req.body.alertName,
                alertProcedure: req.body.alertProcedure,
                sortID: req.body.sortID,
                icon: req.body.icon,

                whoCanSendReceive: {
                    sendReal: rolesArray,
                    receiveReal: rolesArray,
                    sendDrill: rolesArray,
                    receiveDrill: rolesArray
                }
            });
            alert1.save(function (err) {
                if (err && (err.code === 11000 || err.code === 11001)) {
                    return res.status(409).send('showAlert')
                }else{
                    return res.send({redirect:'/alertGroups/showAlertGroups'})
                }
            });
        });

    });
};
/*-------------------------end of adding Alerts*/



/* UPDATE Alerts. -------------------------------*/
module.exports.update = function(req, res) {
    let arraySort = [];
    let array = [];

    let modelType = 'EvacuateTo';
    let title2 = 'Evacuate To' ;
    if(req.params.id == 18){
        modelType = 'Medical';
        title2 = 'Medical Emergencies'
    }
    if(req.params.id == 29){
        modelType = 'SchoolClosed';
        title2 = 'Cause of School Closed';
    }
    async.parallel([
        function(callback){
            models.Alerts.findOne({'alertID': req.params.id}).exec(callback);
        },
        function(callback) {
            models.AlertsGroup.find().sort({"sortID": 1}).exec(callback);
        },
        function(callback){
            models.Roles2.find().sort({"roleID":1}).exec(callback);
        },
        function(callback) {
            models.EmailAddresses.find().sort({"sortID": 1}).exec(callback);
        },
        function(callback){
            models[modelType].find().sort({"utilityID":1}).exec(callback);
        },
        function(callback){aclPermissions.addMedical(req, res, callback);},   //aclPermissions addMedical
        function(callback){aclPermissions.modifyMedical(req, res, callback);},   //aclPermissions modifyMedical
        function(callback){aclPermissions.deleteMedical(req, res, callback);},   //aclPermissions deleteMedical
        function(callback){aclPermissions.modifyAlertGroup(req, res, callback);},  //aclPermissions modifyAlertGroup
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){

        //Show Hide Alerts Options in EJS
        if(req.params.id != 7 &&
            req.params.id != 18 &&
            req.params.id != 29 ){
            modelType = 'other';
        }
        //console.log('modelType = ',modelType);

        //show hide AlertID select in EJS
        let showHideAlertID = 'hide';
        if (req.user.userPrivilegeID == 1)
            showHideAlertID = '';


        let arrayRoles = [];
        results[2].forEach(function (role) {
            if(role.roleID !== 97)
                arrayRoles.push(role);
        });

        let streamSort = models.Alerts.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            let stream = models.Alerts.find().sort({"alertID":1}).cursor();
            stream.on('data', function (doc2) {
                array.push(doc2.alertID);

            }).on('error', function (err) {
                // handle the error
            }).on('close', function () {
                // the stream is closed
                //console.log('array = ',array);
                res.render('alertsAndGroups/alerts/updateAlerts', {
                    title: 'Update Alert',
                    arraySort: arraySort,
                    array: array,
                    userAuthID: req.user.userPrivilegeID,
                    showHideAlertID: showHideAlertID,
                    alert: results[0],
                    alertGroup: results[1],
                    roles: arrayRoles,

                    modelType: modelType,
                    title2: title2,
                    emails: results[3],
                    options: results[4],
                    aclAddMedical: results[5], //aclPermissions addMedical
                    aclModifyMedical: results[6], //aclPermissions modifyMedical
                    aclDeleteMedical: results[7], //aclPermissions deleteMedical

                    aclModifyAlertGroup: results[8],      //aclPermissions modifyAlertGroup
                    aclSideMenu: results[9][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            });
        });


    })
};
module.exports.updatePost = function(req, res) {

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
            alert.alertRequestSendSMS = req.body.alertRequestSendSMS;
            alert.alertLight = req.body.alertLight;
            alert.alertLightSound = req.body.alertLightSound;
            alert.icon = req.body.icon;
            alert.sendEmailWith.emailID = req.body.emailID;
            alert.sendEmailWith.email = req.body.email;
            alert.alertAutoDrill.alertAutoDrill = req.body.autoDrill;
            alert.alertAutoDrill.everyNumber = req.body.autoDrillNumber;
            alert.alertAutoDrill.everyType = req.body.everyType;
            alert.alertAutoDrill.days.sunday = req.body.sunday;
            alert.alertAutoDrill.days.monday = req.body.monday;
            alert.alertAutoDrill.days.tuesday = req.body.tuesday;
            alert.alertAutoDrill.days.wednesday = req.body.wednesday;
            alert.alertAutoDrill.days.thursday = req.body.thursday;
            alert.alertAutoDrill.days.friday = req.body.friday;
            alert.alertAutoDrill.days.saturday = req.body.saturday;

            alert.save(function (err) {
                if (err && (err.code === 11000 || err.code === 11001)) {
                    console.log(err);
                    return res.status(409).send('showAlert')
                }else {
                    if (alert.alertAutoDrill.alertAutoDrill) { //schedule auto drill
                        console.log('alertAutoDrill');
                        schedule.scheduleJob("* 1 * * * *", function() {
                            console.log('This runs every day ay 0X:01');
                            //call notification

                        });

                    }
                    res.send({redirect: '/alertGroups/showAlertGroups'});
                }
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
        function(callback){aclPermissions.modifyProcedure(req, res, callback);},   //aclPermissions modifyProcedure
        function(callback){aclPermissions.showProcedure(req, res, callback);},   //aclPermissions showProcedure
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){

        let procedureSpecific = results[0].procedureSpecific;

        res.render('alertsAndGroups/alerts/procedures', {
            userAuthID: req.user.userPrivilegeID,
            userAuthRedirect: req.user.redirect,
            alert: results[0],
            procedureSpecific: procedureSpecific,
            aclModifyProcedure: results[1], //aclPermissions modifyProcedure
            aclShowProcedure: results[2], //aclPermissions showProcedure
            aclSideMenu: results[3][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo,
            redirectTab: req.user.redirectTabProcedure
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
        res.send({redirect: '/alertGroups/showAlertGroups'});
    });
};
/*-------------------------end of PROCEDURE Alerts*/


/* PROCEDURE Alerts. -------------------------------*/
module.exports.specificProcedure = function(req, res) {
    let roomID = req.params.roomID;

    async.parallel([
        function(callback){
            models.Alerts.findById(req.params.id).exec(callback);
        },
        function(callback){aclPermissions.modifyProcedure(req, res, callback);},   //aclPermissions modifyProcedure
        function(callback){aclPermissions.showProcedure(req, res, callback);},   //aclPermissions showProcedure
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        let roomProcedure = '';
        results[0].procedureSpecific.forEach(function (room) {
            if(room.roomID == roomID)
                roomProcedure = room.procedure;
        });

        res.render('alertsAndGroups/alerts/specificProcedure', {
            userAuthID: req.user.userPrivilegeID,
            userAuthRedirect: req.user.redirect,
            alert: results[0],
            roomID: roomID,
            roomProcedure: roomProcedure,
            aclModifyProcedure: results[1], //aclPermissions modifyProcedure
            aclShowProcedure: results[2], //aclPermissions showProcedure
            aclSideMenu: results[3][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo,
            redirectTab: req.user.redirectTabProcedure
        });
    })

};

module.exports.specificProcedurePost = function(req, res) {
    let alertToUpdate1 = req.body.alertToUpdate;
    let roomID = req.body.roomID;
    let procedure = req.body.alertProcedure;

    models.Alerts.findById(alertToUpdate1, function(err, alertRoom){
        if(!alertRoom || err)
            console.log('alertRoom failed. err = ',err);
        else {
            alertRoom.procedureSpecific.forEach(function (room) {
                if(room.roomID == roomID){
                    room.procedure = procedure;
                    alertRoom.save(function (err) {
                        if (err)
                            console.log('error saving specific procedure - ',err);
                        else{
                            console.log('success saving specific procedure');
                            res.send({redirect: '/alerts/procedure/' + alertToUpdate1});
                        }

                    });
                }
            });
        }
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
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

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
            aclSideMenu: results[7][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
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