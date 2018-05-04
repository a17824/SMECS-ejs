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






//Sening cellPhone notification
function sendPush(message, userName) {
    var serverKey = 'AIzaSyAQHCWvoiCkDk_8_Aur1rpUInk-Sx_uilk';
    var fcm = new FCM(serverKey);

    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Couldn't send message to " + userName);
        } else {
            console.log("Successfully sent to " + userName);
        }
    });
}