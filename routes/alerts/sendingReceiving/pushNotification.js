//Dependencies
var FCM = require('fcm-node');

                      /*****  CALL HERE NOTIFICATION API  ****
                      *  var 'action' can be:                  *
                      *     .newAlert                        *
                      *     .updateAlert                     *
                      *     .closeAlert                      *
                      *                                      *
                      ***************************************/

//Create message for cellPhone notification
module.exports.alert= function(alert, action) {

    alert.sentTo.forEach(function (user) {
        if (user.pushToken) {

            var message = {
                to: user.pushToken, // required fill with device token
                data: { //you can send only notification or only data(or include both)
                    alertID: alert._id,
                    action: action
                }
            };
            var userName = user.firstName + ' ' + user.lastName;
            sendPush(message, userName);
        }
    });
};
//end of Create message for cellPhone notification

//Create message for cellPhone notification
module.exports.notifyUser = function(user, action) {
            var message = {
                to: user.pushToken, // required fill with device token
                data: { //you can send only notification or only data(or include both)
                    action: action,
                    groupAlertsButtons: user.appSettings.groupAlertsButtons,
                    theme: user.appSettings.theme
                }
            };
            sendPush(message, user.firstName + ' ' + user.lastName);
};
//end of Create message for cellPhone notification




//Sening cellPhone notification
function sendPush(message, userName) {
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