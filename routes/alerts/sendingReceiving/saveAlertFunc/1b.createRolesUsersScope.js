//Dependencies
var models = require('./../../../models');
var async = require("async");



/**
 * middleware for Express.
 *
 * This middleware will run all functions related to sending alerts
 *
 */

module.exports.getUsersToReceiveAlert = function(req, res, alert,callback) {

    if(alert.testModeON){
        var typeAclAlert = 'AclAlertsTest';
        var errorMesssageNoScope = 'In Drill mode,'
    } else{
        var typeAclAlert = 'AclAlertsReal';
        var errorMesssageNoScope = 'In Real mode,'
    }

    //retrieve all checkboxes that have an "r" and are "true" and put them in array
    var arrayRoleID = []; //scope ID
    var arrayRoleName = []; //scope Name
    var stream = models[typeAclAlert].find({'alertID': alert.alertNameID, 'checkBoxID': /r/i, 'checkBoxValue': true}).cursor(); //checkboxes that have an "r" and are "true", put them in array
    stream.on('data', function (doc) {
        arrayRoleID.push(doc.roleGroupID); //ROLES that will receive alert
        arrayRoleName.push(doc.roleGroupName);
    }).on('error', function (err) {
        // handle the error
    }).on('close', function () {
        // the stream is closed............end of retrieve all checkboxes that have an "s" and are "true" and put them in array
        if (arrayRoleID.length < 1 || arrayRoleID == null) {
            console.log('This alert has no Roles to send this alert');
            req.flash('error_messages', errorMesssageNoScope + ' ' + alert.alertName + ' alert, has no roles associated.<br />Please, inform your school principal so he/she can add roles to this alert');
            if(req.user.appSettings.groupAlertsButtons == false)
                res.send({redirect: '/alerts/sending/chooseAlert'});
            else
                res.send({redirect: '/alerts/sending/chooseGroup'});
        }
        else {
            models.Users.find({'userRoleID': {$in: arrayRoleID}, 'softDeleted': null}, function (error1, allUsersToSendAlert) {
                if (error1) {
                    console.log('error1 = ',error1);
                } else {
                    if(allUsersToSendAlert < 1 || allUsersToSendAlert == null){
                        console.log('This alert has no Users to send this alert');
                        req.flash('error_messages', errorMesssageNoScope + ' ' + alert.alertName + ' alert, has no users associated.<br />Please, inform your school principal so he/she can associate users to roles in this alert');
                        if(req.user.appSettings.groupAlertsButtons == false)
                            res.send({redirect: '/alerts/sending/chooseAlert'});
                        else
                            res.send({redirect: '/alerts/sending/chooseGroup'});
                    }else{
                        //save to AlertSentTemp all ROLES and USERS that will receive alert
                        models.AlertSentTemp.findById({'_id': alert._id}, function(error, alertUpdate) {
                            if(error || arrayRoleID == null || arrayRoleName == null){
                                console.log('erro da primeira vez que se escolhe um alerta');
                                req.flash('error_messages',
                                    'Please try again and contact the administrator if this message continues to show');
                                res.send({redirect: '/alerts/sending/chooseAlert/'});
                            }else {
                                alertUpdate.sentRoleIDScope = arrayRoleID;
                                alertUpdate.sentRoleNameScope = arrayRoleName;

                                var userArray =[];
                                for (var i = 0; i < allUsersToSendAlert.length; i++) {
                                    if(allUsersToSendAlert[i].pushToken){
                                        var user = {
                                            firstName: allUsersToSendAlert[i].firstName,
                                            lastName: allUsersToSendAlert[i].lastName,
                                            email: allUsersToSendAlert[i].email,
                                            pushToken: allUsersToSendAlert[i].pushToken,
                                            photo: allUsersToSendAlert[i].photo};
                                        userArray.push(user);
                                        alertUpdate.sentTo = userArray;
                                    }
                                }
                                alertUpdate.save(function(err, resp) {
                                    if (err) {
                                        console.log('err = ',err);
                                    } else {
                                        console.log('the tempAlert has been saved');
                                    }
                                });
                                callback(alertUpdate);
                            }
                        });
                        //---------------end of save to AlertSentTemp all ROLES and USERS that will receive alert
                    }
                }
            });
        }
    });
};

/*
module.exports.sendAlertRequestAssistance = function(utilityName) {
    models.Utilities.findOne({'utilityName': utilityName}, function(err, users){
        for (var i=0; i < users.smecsUsers.length; i++ ){
            console.log('AQUI ENVIA SMECS REQUEST ASSISTANCE ALERT PARA: ' + users.smecsUsers[i])
        }
    });
};
*/