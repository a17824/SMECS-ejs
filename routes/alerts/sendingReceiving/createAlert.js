//Dependencies
//var FCM = require('fcm-node'); //for Firebase
let models = require('./../../models');
let alertSentInfo = require('./saveAlertFunc/3c.alertSentInfo.js');
let pushNotification = require('./pushNotification.js');
let bcrypt = require('bcryptjs');


module.exports.createAlert= function(req, res, alertTemp1, cb) {
    let email = req.decoded.user.email;
    models.Users.findOne({'email': email}, function (err, user) {
        if (err) {
            return res.json({
                success: false,
                message: 'Failed to locate user.'
            });
        } else {
            let bodyPin = req.body.pin;
            if ( typeof bodyPin !== 'undefined' && bodyPin )
            {
                if (!bcrypt.compareSync(bodyPin, user.pin)) {
                    console.log('STEP 1a');
                    cb('0');
                    /*
                    res.json({
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    });*/
                } else {
                    console.log('Pin OK');
                    cb(1);
                    if(alertTemp1.realDrillDemo !== 'demo') {
                        alertTemp1.latitude = req.body.latitude;
                        alertTemp1.longitude = req.body.longitude;
                        alertSentInfo.create(req, res, alertTemp1,function (result,err) {  //create AlertSentInfo
                            /*****  CALL HERE NOTIFICATION API  *****/
                            pushNotification.alert(result, 'newAlert');
                        });
                    }
                }
            } else {
                console.log('Pin undefined');
                console.log('req.body.pin = ',req.body.pin);
                cb('0');
            }
        }
    });
};


