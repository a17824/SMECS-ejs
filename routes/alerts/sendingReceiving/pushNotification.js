//Dependencies
//var FCM = require('fcm-node'); //for Firebase
let OneSignal = require('onesignal-node'); //for OneSignal

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
module.exports.alert= function(alert, action) {
    let allUsersWithPushToken = [];
    let testModeON = 'This is a Real Alert -';
    if (alert.realDrillDemo == 'drill')
        testModeON = 'Drill Alert -';

    alert.sentTo.forEach(function (user) {
        if (user.pushToken) {
            user.pushToken.forEach(function (token) {
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

};



//Create message for cellPhone notification
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
        include_player_ids: user.pushToken
    });
    message.postBody["data"] = {
        action: action,
        groupAlertsButtons: user.appSettings.groupAlertsButtons,
        theme: user.appSettings.theme
    };
    sendPush(message);
};
//end of Create message for cellPhone notification




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
            //console.log(userName);
            //console.log(data, httpResponse.statusCode);
        }
    });
}
//end of OneSignal - sending cellPhone notification