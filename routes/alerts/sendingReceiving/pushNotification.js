//Dependencies
var FCM = require('fcm-node');

module.exports.default = function(tempAlert) {
        tempAlert.sentUsersScope.forEach(function (user) {
            if (user.userPushToken) {
                var message = {
                    to: user.userPushToken, // required fill with device token
                    data: { //you can send only notification or only data(or include both)
                        alertID: tempAlert._id,
                        action: 'newAlert'
                    }
                };
                var userName = user.userFirstName + ' ' + user.userLastName;
                sendPush(message, userName);
            }
        });
};

//Send Request Assistance Alert //
module.exports.requestAssistance = function(req, res, next) {

};
//end of Send Request Assistance Alert //


//Send "CLOSE" Alert //
module.exports.closeAlert= function(alert) {
    alert.sentTo.forEach(function (user) {
        console.log('user.pushToken = ',user.pushToken);
        if (user.pushToken) {
            var message = {
                to: user.pushToken, // required fill with device token
                data: { //you can send only notification or only data(or include both)
                    alertID: alert._id,
                    action: 'closeAlert'
                }
            };
            var userName = user.firstName + ' ' + user.lastName;
            sendPush(message, userName);
        }
    });




};
//end of Send "CLOSE" Alert //


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