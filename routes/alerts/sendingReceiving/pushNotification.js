//Dependencies
//var FCM = require('fcm-node'); //for Firebase
let OneSignal = require('onesignal-node'); //for OneSignal
let models = require('./../../models');
let jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
let config = require('../../api/config');

/*****  CALL HERE NOTIFICATION API  ****
 *  var 'action' can be:                *
 *     .newAlert                        *
 *     .updateAlert                     *
 *     .closeAlert                      *
 *                                      *
 ***************************************/


/* FOR FIREBASE - Create message for cellPhone notification
module.exports.alert= function(alert, action) {
    alert.sentTo.forEach(function (user) {
        if (user.pushToken) {
            var message = {
                to: user.pushToken, // required fill with device token
                notification: {
                    title: alert.alertGroupName,
                    body: alert.alertName,
                    sound : alert.groupSound,
                    vibrate: true
                },
                data: { //you can send only notification or only data(or include both)
                    alertID: alert._id,
                    sound : alert.groupSound,
                    action: action
                }
            };
        }
    });
};
*/
//end of FOR FIREBASE - Create message for cellPhone notification

// FOR OneSignal - Create message for cellPhone notification
module.exports.alert= function(alert, action, userAuthEmail, callback) {
    let allUsersWithPushToken = [];
    let testModeON = 'This is a Real Alert -';
    if (alert.realDrillDemo == 'drill')
        testModeON = 'Drill Alert -';

    let arrayUsersToSend = [];
    alert.sentTo.forEach(function (users) {
        arrayUsersToSend.push(users.email);
    });

    models.Users.find({'email': { $in : arrayUsersToSend}}, function (err, users) {
        if (err) {
            console.log('err - finding Users to send Alert');
        } else {
            users.forEach(function (user) {
                console.log('user.email = ',user.email); //show to who this alert should be sent
                if (user.pushToken && (user.email !== userAuthEmail)) {
                    user.pushToken.forEach(function (token) {
                        console.log('user.email with token = ',user.email);//show to who this alert will be sent
                        allUsersWithPushToken.push(token);
                    });
                }
            });
            // we need to create a notification to send
            let message = new OneSignal.Notification({
                contents: {
                    en: testModeON + ' ' + alert.alert.name
                },
                //content_available: true, //silent notification

                include_player_ids: allUsersWithPushToken,
                android_sound: "car_alarm", //android 7 and older
                android_channel_id: alert.group.soundChannel

            });
            message.postBody["data"] = {
                alertID: alert._id,
                action: action
            };
            //let userName = user.firstName + ' ' + user.lastName;
            let title = testModeON + ' ' + alert.alert.name;
            sendPush(message, title, function (result,err) {
                if(err || !result) console.log('timeDif err = ',err);
                else {
                    console.log('resultAlert = ',result);
                    callback('doneAlert')
                }
            });
        }
    });
};


// FOR OneSignal - Update open alerts badge number
module.exports.updateBadge= function(alerts,reOpenAlert) {
    let allUsersWithPushToken = [];

    let arrayUsersToSend = [];
    alerts.forEach(function (alert) {
        alert.sentTo.forEach(function (users) {
            arrayUsersToSend.indexOf(users.email) === -1 ? arrayUsersToSend.push(users.email) : console.log("This item already exists"); //add to array if not exists
        });
    });
    console.log(arrayUsersToSend);

    models.Users.find({'email': { $in : arrayUsersToSend}}, function (err, users) {
        if (err) {
            console.log('err - finding Users to send Alert');
        } else {
            users.forEach(function (user) {
                //console.log('user.email = ',user.email); //show to who this alert will be sent
                if (user.pushToken) {
                    user.pushToken.forEach(function (token) {
                        //console.log('user.email with token = ',user.email);
                        allUsersWithPushToken.push(token);
                    });
                }
            });

            if(reOpenAlert){
                // we need to create a notification to send
                let message = new OneSignal.Notification({
                    contents: {
                        en: 'An alert(s) was reopened'
                    },
                    //content_available: true,
                    include_player_ids: allUsersWithPushToken,
                    android_sound: "car_alarm", //android 7 and older
                    android_channel_id: '2b500d9f-7d71-41c0-92c9-fc02d9fcb7df' //reopen sound
                });
                message.postBody["data"] = {
                    action: 'closeAlert'
                };

                let title = '';
                sendPush(message, title, function (result,err) {

                    if(err || !result) console.log('updateBadge err = ',err);
                    else {
                        console.log('result updateBadge = ',result)
                    }
                });
            }
            else {
                // we need to create a notification to send
                let message = new OneSignal.Notification({
                    contents: {
                        en: 'An alert(s) was closed'
                    },
                    //content_available: true,
                    include_player_ids: allUsersWithPushToken
                });
                message.postBody["data"] = {
                    action: 'closeAlert'
                };

                let title = '';
                sendPush(message, title, function (result,err) {

                    if(err || !result) console.log('updateBadge err = ',err);
                    else {
                        console.log('result updateBadge = ',result)
                    }
                });
            }



        }
    });
};


module.exports.icons = function(icons,action) {
    models.Users.find({pushToken: {$exists: true, $not: {$size: 0}}}, function (err,users) {
        if( err || !users) console.log("No users with pushToken to update");
        else{
            let allUsersWithPushToken = [];
            users.forEach(function (user) {
                user.pushToken.forEach(function (token) {
                    allUsersWithPushToken.push(token);
                });
            });
            let message = new OneSignal.Notification({
                content_available: true,
                include_player_ids: allUsersWithPushToken
            });
            message.postBody["data"] = {
                action: action,
                icons: icons
            };
            let title = '';
            sendPush(message, title, function (result,err) {
                if(err || !result) console.log('icons err = ',err);
                else {
                    console.log('result icons = ',result)
                }

            });
        }
    });
};
//end of Create message for cellPhone notification

module.exports.notifyUser = function(user, action) {

    let token = jwt.sign({user: user}, config.secret, {
        //expiresIn: 1440 // expires in 24 hours
    });

    /* FIREBASE
    var message = {
        to: user.pushToken, // required fill with device token
        data: { //you can send only notification or only data(or include both)
            action: action,
            groupAlertsButtons: user.appSettings.groupAlertsButtons,
            theme: user.appSettings.theme
        }
    };
    */
    // ONESIGNAL

    // we need to create a notification to send
    let message = new OneSignal.Notification({
        content_available: true,
        include_player_ids: user.pushToken,

    });
    message.postBody["data"] = {
        action: action,
        groupAlertsButtons: user.appSettings.groupAlertsButtons,
        enableFingerprint: user.appSettings.enableFingerprint,
        theme: user.appSettings.theme,
        userRoleName: user.userRoleName,
        firstName: user.firstName,
        lastName: user.lastName,
        userPhoto: user.photo,
        token: token

    };

    let title = '';
    sendPush(message, title, function (result,err) {
        if(err || !result) console.log('notifyUser err = ',err);
        else {
            console.log('result notifyUser = ',result)
        }

    });
};

module.exports.refreshAlertInfo = function(alert, action) {
    // ONESIGNAL
    let allUsersWithPushToken = [];
    alert.sentTo.forEach(function (user) {
        user.pushToken.forEach(function (token) {
            allUsersWithPushToken.push(token);
        });
    });

    // we need to create a notification to send
    let message = new OneSignal.Notification({
        content_available: true,
        include_player_ids: allUsersWithPushToken
    });
    message.postBody["data"] = {
        action: action,
        alert: alert._id
    };
    let title = '';
    sendPush(message, title, function (result,err) {
        if(err || !result) console.log('refreshAlertInfo err = ',err);
        else {
            console.log('result refreshAlertInfo = ',result)
        }

    });
};


module.exports.refreshNotes = function(alert, action) {
    // ONESIGNAL
    let allUsersWithPushToken = [];
    let testModeON = 'This is a Real Alert -';
    if (alert.realDrillDemo == 'drill')
        testModeON = 'Drill Alert -';

    alert.sentTo.forEach(function (user) {
        user.pushToken.forEach(function (token) {
            allUsersWithPushToken.push(token);
        });
    });

    // we need to create a notification to send
    let message = new OneSignal.Notification({
        contents: {
            en: testModeON + ' ' + alert.alert.name + '. Notes have been updated'
        },
        include_player_ids: allUsersWithPushToken,
        android_sound: alert.group.mp3, //android 7 and older
        ios_sound: alert.group.mp3 + '.wav', //ios .wav
        android_channel_id: alert.group.soundChannel
    });
    message.postBody["data"] = {
        action: action,
        alert: alert._id
    };
    let title = testModeON + ' ' + alert.alert.name;
    sendPush(message, title, function (result,err) {
        if(err || !result) console.log('refreshAlertInfo err = ',err);
        else {
            console.log('result refreshAlertInfo = ',result)
        }

    });
};


/* FireBase - sending cellPhone notification
function sendPush(message, userName, userAuthKey) {

    var serverKey = 'AAAAblin56M:APA91bEISdc0T7gPr_MeUJZ6wHnnKzwv1oUWi360L83GsEFTNpx-8yLg-Hs5-DXGcPWk8EzCxt1Vqhs3aaK9d2JM_uSe45pV3i_Ypw6bmnRtG9OCOzAefMqmsDR9uKEyKwitJe7aDfBN';
    var fcm = new FCM(serverKey);

    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Couldn't send message to " + userName);
        } else {
            console.log("Successfully sent to " + userName);
        }
    });
}
*/
//end of FireBase - sending cellPhone notification

//OneSignal - sending cellPhone notification
function sendPush(message, title, callback) {


    // first we need to create a client
    let myClient = new OneSignal.Client({
        //userAuthKey: userAuthKey,
        app: { appAuthKey: 'OGY3NTY1NjAtMzI0OS00NDJhLWFlNDYtNWNlZDQ3NDhhOGZk' , appId: '2ce09fe3-5c91-4e53-9624-4d5b647322ea'}
    });


    myClient.sendNotification(message, function (err, httpResponse,data) {
        //when a pushToken has incorrect format
        if (err || data.errors) {
            if(typeof data.errors.length !== 'undefined'){
                let usersArray = message.postBody.include_player_ids;

                // send message without notification (no sound, no icon on cellphone...)
                if (typeof message.postBody.android_channel_id === 'undefined' || message.postBody.android_channel_id === null) {
                    usersArray.forEach(function (user) {
                        let message2 = new OneSignal.Notification({
                            //contents: {en: title},
                            content_available: true, //silent notification
                            include_player_ids: [user]
                        });
                        message2.postBody["data"] = message.data;
                        myClient.sendNotification(message2, function (err, httpResponse,data) {
                            if (err || data.errors) {
                                console.log('user with bad token - ', data);
                            }
                            else{
                                console.log('sent to 1 user successfully - ', data);
                            }
                        });
                    });
                }
                else {  // send message with notification (sound)

                    usersArray.forEach(function (user) {
                        let message2 = new OneSignal.Notification({
                            contents: {
                                en: title
                            },
                            //content_available: true, //silent notification
                            include_player_ids: [user],
                            android_sound: "car_alarm", //android 7 and older
                            android_channel_id: message.postBody.android_channel_id
                        });
                        message2.postBody["data"] = message.data;
                        myClient.sendNotification(message2, function (err, httpResponse,data) {
                            if (err || data.errors) {
                                console.log('user with bad token - ', data);
                            }
                            else{
                                console.log('sent to 1 user successfully - ', data);
                            }
                        });
                    });
                }
                //console.log('include_player_ids = ',message.postBody.contents.include_player_ids.length);
            }
            else {
                console.log('PUSH NOTIFICATION SENT Correctly but there are tokens in mongo that dont exist in OneSignal');
            }
        }

        //end of When a pushToken has incorrect format

        // when pusharrays are OK
        else {
            console.log('PUSH NOTIFICATION SENT Correctly');
            //console.log('pushResult = ',data, httpResponse.statusCode);
        }

        callback('doneSendPush');
    });
}
//end of OneSignal - sending cellPhone notification