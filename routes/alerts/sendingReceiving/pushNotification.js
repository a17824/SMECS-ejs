//Dependencies
//var FCM = require('fcm-node'); //for Firebase
let OneSignal = require('onesignal-node'); //for OneSignal
let models = require('./../../models');

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
module.exports.alert= function(alert, action, userAuthEmail) {
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
                include_player_ids: allUsersWithPushToken
            });
            message.postBody["data"] = {
                alertID: alert._id,
                sound: alert.groupSound,
                action: action
            };

            //let userName = user.firstName + ' ' + user.lastName;
            sendPush(message);
        }
    });
};


// FOR OneSignal - Update open alerts badge number
module.exports.updateBadge= function(alerts) {
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

            // we need to create a notification to send
            let message = new OneSignal.Notification({
                contents: {
                    en: 'updateOpenAlertsBadge'
                },
                include_player_ids: allUsersWithPushToken
            });
            message.postBody["data"] = {
                action: 'closeAlert'
            };

            //let userName = user.firstName + ' ' + user.lastName;
            sendPush(message);
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
                contents: {
                    en: 'update on/off group buttons'
                },
                include_player_ids: allUsersWithPushToken
            });
            message.postBody["data"] = {
                action: action,
                icons: icons
            };
            sendPush(message);
        }
    });
};
//end of Create message for cellPhone notification

module.exports.notifyUser = function(user, action) {
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
        contents: {
            en: 'update on/off group buttons'
        },
        include_player_ids: user.pushToken
    });
    message.postBody["data"] = {
        action: action,
        groupAlertsButtons: user.appSettings.groupAlertsButtons,
        theme: user.appSettings.theme
    };
    sendPush(message);
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
function sendPush(message) {

    // first we need to create a client
    let myClient = new OneSignal.Client({
        //userAuthKey: userAuthKey,
        app: { appAuthKey: 'OGY3NTY1NjAtMzI0OS00NDJhLWFlNDYtNWNlZDQ3NDhhOGZk' , appId: '2ce09fe3-5c91-4e53-9624-4d5b647322ea'}
    });

    myClient.sendNotification(message, function (err, httpResponse,data) {
        if (err) {
            //console.log("Couldn't send message to " + userName);
            console.log(data, httpResponse.statusCode);
        } else {
            console.log('PUSH NOTIFICATION SENT');
            //console.log(data, httpResponse.statusCode);
        }
    });
}
//end of OneSignal - sending cellPhone notification