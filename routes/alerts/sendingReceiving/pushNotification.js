//Dependencies
let FCM = require('fcm-node'); //for Firebase
let OneSignal = require('onesignal-node'); //for OneSignal
let models = require('./../../models');
let jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
let config = require('../../api/config');
let admin = require('firebase-admin');

let appId= '2ce09fe3-5c91-4e53-9624-4d5b647322ea';
/*****  CALL HERE NOTIFICATION API  ****
 *  var 'action' can be:                *
 *     .newAlert                        *
 *     .updateAlert                     *
 *     .closeAlert                      *
 *                                      *
 ***************************************/


// FOR FIREBASE - Create message for cellPhone notification
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



            let arr =  allUsersWithPushToken;
            let size = 500;
            splittingArray(size, arr,function (newArray,err) { // split allUsersWithPushToken array in arrays of maximum 500 users
                if(err || !newArray || newArray < 1) console.log('newArray err = ',err);
                else {
                    newArray.forEach(function(usersWithPushTokenArrayChunk, idx, array) {
                        let title = testModeON + ' ' + alert.alert.name;
                        let message = { //this may vary according to the message type (single recipient, multicast, topic, etc.)
                            registration_ids: usersWithPushTokenArrayChunk,
                            //to: usersWithPushTokenArrayChunk[0],
                            notification: {
                                title: title,
                                android_channel_id: alert.group.sound


                            },
                            data: {  //you can send only notification or only data(or include both)
                                alertID: alert._id,
                                action: action
                            },
                            priority: "high"
                        };

                        sendPush2(message, function (result,err) {
                            if(err || !result) console.log('timeDif err = ',err);
                            else {
                                console.log('resultAlert = ',result);
                                if (idx === array.length - 1) { //if last loop do callback
                                    callback('doneAlert')
                                }
                            }
                        });
                    });
                }
            });


            /*
                        // OneSignal - we need to create a notification to send
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
                        //-------------------------------------------------
            */
        }
    });
};
//end of FOR FIREBASE - Create message for cellPhone notification

/*
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
*/

// FOR FCM - Update open alerts badge number
module.exports.updateBadge= function(alerts,reOpenAlert,alertsClosed,alertsReopened) {
    console.log('updateBadge');
    console.log('action (no var action) of updateBadge = ');

    //popup message for alerts closed and reopened
    let enClosed = 'no alerts were closed';
    let strClosedAlerts = '';

    if(alertsClosed.length >= 1) {
        if(alertsClosed.length === 1) {
            strClosedAlerts = alertsClosed[0].name + ' was closed';
        }
        else {
            strClosedAlerts = alertsClosed.length + ' alerts were closed';
            /*
            let allAlertsClosed = [];
            let flagFirstTime = 0;
            alertsClosed.forEach(function(alertClosed) {
                if(flagFirstTime === 0){
                    strClosedAlerts = alertClosed.name;
                    flagFirstTime = 1;
                }
                else
                {
                    allAlertsClosed.push(alertClosed.name);
                    strClosedAlerts = strClosedAlerts + ',' + alertClosed.name;
                }
            });
            */
        }

        //enClosed = 'The following alerts were closed:\n' + '-' + allAlertsClosed.join("\n-");

        console.log('strClosedAlerts = ',strClosedAlerts);

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
                //console.log('alertsReopened[0]', alertsReopened[0].id);
                /*let message = {
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
*/

                let arr =  allUsersWithPushToken;
                let size = 500;
                splittingArray(size, arr,function (newArray,err) { // split allUsersWithPushToken array in arrays of maximum 500 users
                    if(err || !newArray || newArray < 1) console.log('newArray err = ',err);
                    else {
                        newArray.forEach(function(usersWithPushTokenArrayChunk) {

                            let message = { //this may vary according to the message type (single recipient, multicast, topic, etc.)
                                registration_ids: usersWithPushTokenArrayChunk,
                                notification: {
                                    title: enReopened,
                                    android_channel_id: alerts[0].group.sound
                                },
                                data: {  //you can send only notification or only data(or include both)
                                    action: 'reOpenAlert',
                                    alertID: alertsReopened[0].id
                                },
                                priority: "high"
                            };

                            sendPush2(message, function (result,err) {

                                if(err || !result) console.log('updateBadge err = ',err);
                                else {
                                    console.log('result updateBadge = ',result);
                                }
                            });
                        });
                    }
                });

            }
            else {
                //console.log('ALERT CLOSED = ');
                // we need to create a notification to send

                let arr =  allUsersWithPushToken;
                let size = 500;
                splittingArray(size, arr,function (newArray,err) { // split allUsersWithPushToken array in arrays of maximum 500 users
                    if(err || !newArray || newArray < 1) console.log('newArray err = ',err);
                    else {
                        newArray.forEach(function(usersWithPushTokenArrayChunk) {

                            let message = { //this may vary according to the message type (single recipient, multicast, topic, etc.)
                                registration_ids: usersWithPushTokenArrayChunk,
                                notification: {
                                    title: strClosedAlerts,
                                    android_channel_id: 'sound22'
                                },
                                data: {  //you can send only notification or only data(or include both)
                                    action: 'closeAlert',
                                    alertsClosed: strClosedAlerts
                                },
                                priority: "high"
                            };

                            sendPush2(message, function (result,err) {

                                if(err || !result) console.log('updateBadge err = ',err);
                                else {
                                    console.log('result updateBadge = ',result);
                                }
                            });
                        });
                    }
                });
                /*
                //ONE SIGNAL
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
                */


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

            /*
            //ONE SIGNAL
            let message = {
                app_id: appId,
                content_available: true,
                include_player_ids: allUsersWithPushToken,
                data: {
                    action: action,
                    icons: icons
                }
            };
            */

            let arr =  allUsersWithPushToken;
            let size = 500;
            splittingArray(size, arr,function (newArray,err) { // split allUsersWithPushToken array in arrays of maximum 500 users
                if(err || !newArray || newArray < 1) console.log('newArray err = ',err);
                else {
                    newArray.forEach(function(usersWithPushTokenArrayChunk) {

                        let message = { //this may vary according to the message type (single recipient, multicast, topic, etc.)
                            registration_ids: usersWithPushTokenArrayChunk,
                            data: {  //you can send only notification or only data(or include both)
                                action: action,
                                icons: icons
                            },
                            priority: "high"
                        };

                        sendPush2(message, function (result,err) {
                            if(err || !result) console.log('icons err = ',err);
                            else {
                                console.log('result icons = ',result);
                            }
                        });
                    });
                }
            });
        }
    });
};
//end of Create message for cellPhone notification

module.exports.notifyUser = function(user, action) { //action = updateUserInfo (group buttons, fingerprint)
    console.log('notifyUser');
    console.log('action of notifyUser= ', action);

    let token = jwt.sign({user: user}, config.secret, {
        //expiresIn: 1440 // expires in 24 hours
    });


    /*
    //ONESIGNAL
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
    */

    let message = { //this may vary according to the message type (single recipient, multicast, topic, etc.)
        registration_ids: user.pushToken,
        data: {  //you can send only notification or only data(or include both)
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
        },
        priority: "high"
    };

    sendPush2(message, function (result,err) {
        if(err || !result) console.log('notifyUser err = ',err);
        else {
            console.log('result notifyUser = ',result);
        }
    });
};

module.exports.refreshAlertInfo = function(alert, action) {
    /*   console.log('refreshAlertInfo');
       console.log('action of refreshAlertInfo = ', action);


       let allUsersWithPushToken = [];
       alert.sentTo.forEach(function (user) {
           user.pushToken.forEach(function (token) {
               allUsersWithPushToken.push(token);
           });
       });
       /*
       //ONESIGNAL
       let message = {
           app_id: appId,
           content_available: true,
           include_player_ids: allUsersWithPushToken,
           data: {
               alertID: alert._id,
               action: action
           }
       };
       */
    /*
    let arr =  allUsersWithPushToken;
    let size = 500;
    splittingArray(size, arr,function (newArray,err) { // split allUsersWithPushToken array in arrays of maximum 500 users
        if(err || !newArray || newArray < 1) console.log('newArray err = ',err);
        else {
            newArray.forEach(function(usersWithPushTokenArrayChunk) {

                let message = { //this may vary according to the message type (single recipient, multicast, topic, etc.)
                    registration_ids: usersWithPushTokenArrayChunk,
                    data: {  //you can send only notification or only data(or include both)
                        alertID: alert._id,
                        action: action
                    },
                    priority: "high"
                };

                sendPush2(message, function (result,err) {
                    if(err || !result) console.log('refreshAlertInfo err = ',err);
                    else {
                        console.log('result refreshAlertInfo = ',result);
                    }
                });
            });
        }
    });*/
};


module.exports.refreshNotes = function(alert, action) {
    console.log('refreshNotes');
    console.log('action of refreshNotes = ', action);


    let allUsersWithPushToken = [];
    let testModeON = 'This is a Real Alert -';
    if (alert.realDrillDemo == 'drill')
        testModeON = 'Drill Alert -';

    alert.sentTo.forEach(function (user) {
        user.pushToken.forEach(function (token) {
            allUsersWithPushToken.push(token);
        });
    });
    /*
    // ONESIGNAL
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
    //let title = testModeON + ' ' + alert.alert.name;
    */

    let arr =  allUsersWithPushToken;
    let size = 500;
    splittingArray(size, arr,function (newArray,err) { // split allUsersWithPushToken array in arrays of maximum 500 users
        if(err || !newArray || newArray < 1) console.log('newArray err = ',err);
        else {
            newArray.forEach(function(usersWithPushTokenArrayChunk) {

                let title = testModeON + ' ' + alert.alert.name;
                let message = { //this may vary according to the message type (single recipient, multicast, topic, etc.)
                    registration_ids: usersWithPushTokenArrayChunk,
                    notification: {
                        title: title,
                        android_channel_id: 'sound22'
                    },
                    data: {  //you can send only notification or only data(or include both)
                        alertID: alert._id,
                        action: action
                    },
                    priority: "high"
                };

                sendPush2(message, function (result,err) {
                    if(err || !result) console.log('refreshNotes err = ',err);
                    else {
                        console.log('result refreshNotes = ',result);
                    }
                });
            });
        }
    });
};


//To remove pushTokens "not Registered" in FCM
module.exports.heartBeat = function(token, action, callback) {

    let message = { //this may vary according to the message type (single recipient, multicast, topic, etc.)
        to: token,
        data: {  //you can send only notification or only data(or include both)
            action: action
        },
        priority: "high"
    };

    sendPush2(message, function (result,err) {
        if(err || !result) {
            console.log('notifyUser err = ',err);
        }
        else {
            console.log('result notifyUser = ',result);

        }
        callback(result) // result = 'sendPush with Error' or 'doneSendPush'
    });
};


/*
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
*/


// FCM - sending cellPhone notification
function sendPush2(message, callback) {
    let serverKey = 'AAAAblin56M:APA91bEISdc0T7gPr_MeUJZ6wHnnKzwv1oUWi360L83GsEFTNpx-8yLg-Hs5-DXGcPWk8EzCxt1Vqhs3aaK9d2JM_uSe45pV3i_Ypw6bmnRtG9OCOzAefMqmsDR9uKEyKwitJe7aDfBN';
    let fcm = new FCM(serverKey);

    fcm.send(message, function (err, result) {
        if(err || !result) {
            console.log('err = ', err);
            /*
            //this IF and ELSE can be deleted. this was just for testing receipts
            if(result !== null && result !== undefined ){
                let myArrayResult = result.split(/([0-9]+)/);
                let success_number =  parseInt(myArrayResult[3]);
                console.log('success_number - ', success_number);
            }
            else
                console.log('result1 - ', result);
            //END OF this IF and ELSE can be deleted. this was just for testing receipts
            */
            //resendMessage function
            callback('sendPush with Error');
        }
        else {
            console.log('PUSH NOTIFICATION SENT Correctly');
            //console.log('result2 - ', result);
            /*
            //this IF and ELSE can be deleted. this was just for testing receipts
            if(result !== null && result !== undefined ){
                let myArrayResult = result.split(/([0-9]+)/);
                let success_number =  parseInt(myArrayResult[3]);
                console.log('success_number - ', success_number);
            }
            //END OF this IF and ELSE can be deleted. this was just for testing receipts
            */
            callback('doneSendPush');
        }
    });
    /*admin.messaging().send(message).then(response => {
        // handle response
        console.log('response - ', response);
    });*/


}

//end of FireBase - sending cellPhone notification




/*
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
*/

function splittingArray(size, arr, callback){ //size - child_array.length
    let out = [],i = 0, n= Math.ceil((arr.length)/size);
    while(i < n) { out.push(arr.splice(0, (i==n-1) && size < arr.length ? arr.length: size));  i++;}
    callback(out);
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