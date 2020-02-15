//Dependencies
//var FCM = require('fcm-node'); //for Firebase
let OneSignal = require('onesignal-node'); //for OneSignal
let models = require('./../../models');
let jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
let config = require('../../api/config');

let appId= '2ce09fe3-5c91-4e53-9624-4d5b647322ea';
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
    console.log('alert');
    console.log('action of alert = ', action);

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
                //console.log('user.email = ',user.email); //show to who this alert should be sent
                if (user.pushToken && (user.email !== userAuthEmail)) {
                    user.pushToken.forEach(function (token) {
                        console.log('user.email with token = ',user.email);//show to who this alert will be sent
                        allUsersWithPushToken.push(token);
                    });
                }
            });

            // we need to create a notification to send
            let message = {
                app_id: appId,
                contents: {
                    en: testModeON + ' ' + alert.alert.name
                },
                //content_available: true, //silent notification

                include_player_ids: allUsersWithPushToken,
                android_sound: "car_alarm", //android 7 and older
                android_channel_id: alert.group.soundChannel,
                data: {
                    alertID: alert._id,
                    action: action
                }

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
module.exports.updateBadge= function(alerts,reOpenAlert,alertsClosed,alertsReopened) {
    console.log('updateBadge');
    console.log('action (no var action) of updateBadge = ');

    //popup message for alerts closed and reopened
    let enClosed = 'no alerts were closed';
    if(alertsClosed.length === 1)
        enClosed = 'Alert ' + alertsClosed[0].name + ' was closed';
    if(alertsClosed.length > 1) {
        let allAlertsClosed = [];
        alertsClosed.forEach(function(alertClosed) {
            allAlertsClosed.push(alertClosed.name);
        });
        enClosed = 'The following alerts were closed:\n' + '-' + allAlertsClosed.join("\n-");
    }
    let enReopened = 'no alerts were reopened';
    if(alertsReopened.length === 1)
        enReopened = 'Alert ' + alertsReopened[0].name + ' was reopened';

    //end of popup message for alerts closed and reopened

    let allUsersWithPushToken = [];

    let arrayUsersToSend = [];
    alerts.forEach(function (alert) {
        alert.sentTo.forEach(function (users) {
            arrayUsersToSend.indexOf(users.email) === -1 ? arrayUsersToSend.push(users.email) : console.log("This item already exists"); //add to array if not exists
        });
    });

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
                //console.log('ALERT REOPEN CLOSED = ');
                console.log('alertsReopened[0]', alertsReopened[0].id);
                let message = {
                    app_id: appId,
                    contents: {
                        en: enReopened
                    },
                    //content_available: true,
                    include_player_ids: allUsersWithPushToken,
                    android_sound: "car_alarm", //android 7 and older
                    android_channel_id: alerts[0].group.soundChannel, //reopen sound
                    data: {
                        action: 'reOpenAlert',
                        alertID: alertsReopened[0].id
                    }
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
                //console.log('ALERT CLOSED = ');
                // we need to create a notification to send
                let message = {
                    app_id: appId,
                    contents: {
                        en: enClosed
                    },
                    //content_available: true,
                    include_player_ids: allUsersWithPushToken,
                    android_sound: "car_alarm", //android 7 and older
                    android_channel_id: 'ee9140fa-9eff-403d-b14b-cd5547291382',  //sound for alert update/notes/closed
                    data: {
                        action: 'closeAlert',
                        alertsClosed: alertsClosed
                    }
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
    console.log('icons');
    console.log('action of icons = ', action);

    models.Users.find({pushToken: {$exists: true, $not: {$size: 0}}}, function (err,users) {
        if( err || !users) console.log("No users with pushToken to update");
        else{
            let allUsersWithPushToken = [];
            users.forEach(function (user) {
                user.pushToken.forEach(function (token) {
                    allUsersWithPushToken.push(token);
                });
            });
            let message = {
                app_id: appId,
                content_available: true,
                include_player_ids: allUsersWithPushToken,
                data: {
                    action: action,
                    icons: icons
                }
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
    console.log('notifyUser');
    console.log('action of notifyUser= ', action);

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
    let message = {
        app_id: appId,
        content_available: true,
        include_player_ids: user.pushToken,
        data: {
            action: action,
            groupAlertsButtons: user.appSettings.groupAlertsButtons,
            enableFingerprint: user.appSettings.enableFingerprint,
            theme: user.appSettings.theme,
            userRoleName: user.userRoleName,
            firstName: user.firstName,
            lastName: user.lastName,
            userPhoto: user.photo,
            userEmail: user.email,
            token: token
        }
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
    console.log('refreshAlertInfo');
    console.log('action of refreshAlertInfo = ', action);

    // ONESIGNAL
    let allUsersWithPushToken = [];
    alert.sentTo.forEach(function (user) {
        user.pushToken.forEach(function (token) {
            allUsersWithPushToken.push(token);
        });
    });

    // we need to create a notification to send
    let message = {
        app_id: appId,
        content_available: true,
        include_player_ids: allUsersWithPushToken,
        data: {
            alertID: alert._id,
            action: action
        }
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
    console.log('refreshNotes');
    console.log('action of refreshNotes = ', action);

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
    let message = {
        app_id: appId,
        contents: {
            en: testModeON + ' ' + alert.alert.name + '. Notes have been updated'
        },
        include_player_ids: allUsersWithPushToken,
        //android_sound: alert.group.mp3, //android 7 and older
        //ios_sound: alert.group.mp3 + '.wav', //ios .wav
        android_channel_id: 'ee9140fa-9eff-403d-b14b-cd5547291382',  //sound for alert update/notes/closed
        data: {
            action: action,
            alert: alert._id
        }
    };

    let title = testModeON + ' ' + alert.alert.name;
    sendPush(message, title, function (result,err) {
        if(err || !result) console.log('refreshNotes err = ',err);
        else {
            console.log('result refreshNotes = ',result)
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
    console.log('sendPush');

    // first we need to create a client
    let myClient = new OneSignal.Client(
        //userAuthKey: userAuthKey,
        'OGY3NTY1NjAtMzI0OS00NDJhLWFlNDYtNWNlZDQ3NDhhOGZk' , '2ce09fe3-5c91-4e53-9624-4d5b647322ea'
    );

    // or you can use promise style:
    myClient.createNotification(message)
        .then(response => {
            if (response.errors) {
                resendMessage(response, message, myClient, title);
            }
            else {
                console.log('PUSH NOTIFICATION SENT Correctly');
                //console.log('pushResult = ',data, httpResponse.statusCode);
            }
        })
        .catch(e => { //when a pushToken has incorrect format
            resendMessage(e, message, myClient, title);
        });
    callback('doneSendPush');




}
//end of OneSignal - sending cellPhone notification



function resendMessage(errResponse, message, myClient, title) {

    if(typeof errResponse.body.errors.length !== 'undefined'){
        let usersArray = message.include_player_ids;

        // send message without notification (no sound, no icon on cellphone...)
        if (typeof message.android_channel_id === 'undefined' || message.android_channel_id === null) {
            usersArray.forEach(function (user) {
                let message2 = {
                    app_id: appId,
                    //contents: {en: title},
                    content_available: true, //silent notification
                    include_player_ids: [user],
                    data: message.data
                };

                myClient.createNotification(message2)
                    .then(response => {
                        console.log('A- user with bad token - ', response.body.errors);
                    })
                    .catch(e => {
                        console.log('A- ent to 1 user successfully - ', e);
                    });

            });
        }
        else {  // send message with notification (sound)
            console.log('B- android_channel_id - ', message.android_channel_id);
            usersArray.forEach(function (user) {
                let message2 = {
                    app_id: appId,
                    contents: {
                        en: title
                    },
                    //content_available: true, //silent notification
                    include_player_ids: [user],
                    android_sound: "car_alarm", //android 7 and older
                    android_channel_id: message.android_channel_id,
                    data: message.data
                };

                myClient.createNotification(message2)
                    .then(response => {
                        if(response.body.errors)
                            console.log('B- user with bad token - ', response.body.errors);
                    })
                    .catch(e => {
                        console.log('B- sent to 1 user successfully - ', e);
                    });

            });
        }
        //console.log('include_player_ids = ',message.postBody.contents.include_player_ids.length);
    }
    else {
        console.log('PUSH NOTIFICATION SENT Correctly but there are tokens in mongo that dont exist in OneSignal');
    }

    //end of When a pushToken has incorrect format
}



//add pushtoken to OneSignal - to resolve issue of "unsubscribe user"
/*
OneSignal.push(["init", {
    appId: "2ce09fe3-5c91-4e53-9624-4d5b647322ea",
    autoRegister: false,
    notifyButton: {
        enable: true
    }
}]);
OneSignal.push(function() {
    OneSignal.registerForPushNotifications();
});
OneSignal.push(function() {
    OneSignal.registerForPushNotifications({
        modalPrompt: true
    });
});
*/