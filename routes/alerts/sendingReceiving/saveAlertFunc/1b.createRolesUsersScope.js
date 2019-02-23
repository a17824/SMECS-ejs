//Dependencies
var models = require('./../../../models');
var async = require("async");


/**
 * middleware for Express.
 *
 * This middleware will run all functions related to sending alerts
 *
 */

module.exports.getUsersToReceiveAlert = function(req, res, alertTemp,callback) {
    let errorMesssageNoScope = 'In Real mode,';
    if(alertTemp.realDrillDemo === 'drill')
        errorMesssageNoScope = 'In Drill mode,';

    async.parallel([
        function(callback2){
            models.Alerts.findOne({ alertID: alertTemp.alertNameID
            }, callback2).sort({"group.sortID": 1}).sort({"sortID": 1}).cursor();
        },
        function(callback2){
            models.Alerts.find({ alertID: alertTemp.alertNameID, 'whoCanSendReceive.receiveDrill': {$elemMatch: {checkbox: true}}
            }, callback2).sort({"group.sortID": 1}).sort({"sortID": 1}).cursor();
        }


    ],function(err, results){

        var arrayRoleID = []; //scope ID
        var arrayRoleName = []; //scope Name
        if(alertTemp.realDrillDemo == 'drill'){
            results[0].whoCanSendReceive.receiveDrill.forEach(function (role) {
                if(role.checkbox == true){
                    arrayRoleID.push(role.roleID); //ROLES that will receive alert
                    arrayRoleName.push(role.roleName);
                }
            });
        }
        if(alertTemp.realDrillDemo == 'real'){
            results[0].whoCanSendReceive.receiveReal.forEach(function (role) {
                if(role.checkbox == true){
                    arrayRoleID.push(role.roleID); //ROLES that will receive alert
                    arrayRoleName.push(role.roleName);
                }
            });
        }

        if (arrayRoleID.length < 1 || arrayRoleID == null) {
            console.log('This alert has no Roles to send this alert');

            if(req.decoded){ // run SMECS API
                models.Users.findOne({'email': req.decoded.user.email}, function (err, user) {
                    if (user.appSettings.groupAlertsButtons == false) {//Groups Buttons OFF -----------
                        res.json({
                            success: false,
                            message: errorMesssageNoScope + ' ' + alertTemp.alertName + ' alert, has no roles associated with it. Please, inform your school principal so he/she can add roles to this alert.',
                            redirect: 'chooseAlert'
                        });
                    } else {    //Groups Buttons ON
                        res.json({
                            success: false,
                            message: errorMesssageNoScope + ' ' + alertTemp.alertName + ' alert, has no roles associated with it.Please, inform your school principal so he/she can add roles to this alert.',
                            redirect: 'home' // ou chooseGroup?
                        });
                    }
                });

            }else{  // run SMECS EJS
                req.flash('error_messages', errorMesssageNoScope + ' ' + alertTemp.alertName + ' alert, has no roles associated.<br />Please, inform your school principal so he/she can add roles to this alert.');
                if(req.user.appSettings.groupAlertsButtons == false)
                    res.send({redirect: '/alerts/sending/chooseAlert'});
                else
                    res.send({redirect: '/alerts/sending/chooseGroup'});
            }

        }

        else {
            models.Users.find({'userRoleID': {$in: arrayRoleID}, 'softDeleted': null}, function (error1, allUsersToSendAlert) {
                if (error1) {
                    console.log('error1 = ',error1);
                } else {
                    if(allUsersToSendAlert < 1 || allUsersToSendAlert == null){
                        console.log('This alert has no Users to send this alert');

                        if(req.decoded){ // run SMECS API
                            models.Users.findOne({'email': req.decoded.user.email}, function (err, user) {
                                if (user.appSettings.groupAlertsButtons == false) {//Groups Buttons OFF -----------
                                    res.json({
                                        success: false,
                                        message: errorMesssageNoScope + ' ' + alertTemp.alertName + ' alert, has no users associated. Please, inform your school principal so he/she can associate users to roles in this alert.',
                                        redirect: 'chooseAlert'
                                    });
                                } else {    //Groups Buttons ON
                                    res.json({
                                        success: false,
                                        message: errorMesssageNoScope + ' ' + alertTemp.alertName + ' alert, has no users associated. Please, inform your school principal so he/she can associate users to roles in this alert.',
                                        redirect: 'home' // ou chooseGroup?
                                    });
                                }
                            });

                        }else{  // run SMECS EJS
                            req.flash('error_messages', errorMesssageNoScope + ' ' + alertTemp.alertName + ' alert, has no users associated.<br />Please, inform your school principal so he/she can associate users to roles in this alert.');
                            if(req.user.appSettings.groupAlertsButtons == false)
                                res.send({redirect: '/alerts/sending/chooseAlert'});
                            else
                                res.send({redirect: '/alerts/sending/chooseGroup'});
                        }


                    }else{
                        //save to AlertSentTemp all ROLES and USERS that will receive alert
                        models.AlertSentTemp.findById({'_id': alertTemp._id}, function(error, alertUpdate) {
                            if(error || arrayRoleID == null || arrayRoleName == null || alertUpdate == null){

                                if(req.decoded){ // run SMECS API
                                    models.Users.findOne({'email': req.decoded.user.email}, function (err, user) {
                                        if (user.appSettings.groupAlertsButtons == false) {//Groups Buttons OFF -----------
                                            res.json({
                                                success: false,
                                                message: 'Please try again and contact the administrator if this message continues to show.',
                                                redirect: 'chooseAlert'
                                            });
                                        } else {    //Groups Buttons ON
                                            res.json({
                                                success: false,
                                                message: 'Please try again and contact the administrator if this message continues to show.',
                                                redirect: 'home' // ou chooseGroup?
                                            });
                                        }
                                    });

                                }else{  // run SMECS EJS
                                    req.flash('error_messages',
                                        'Please try again and contact the administrator if this message continues to show.');
                                    if(req.user.appSettings.groupAlertsButtons == false)
                                        res.send({redirect: '/alerts/sending/chooseAlert'});
                                    else
                                        res.send({redirect: '/alerts/sending/chooseGroup'});
                                }



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
