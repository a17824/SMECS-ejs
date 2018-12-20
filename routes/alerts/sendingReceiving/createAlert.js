//Dependencies
//var FCM = require('fcm-node'); //for Firebase
let models = require('./../../models');
let async = require("async");
let alertSentInfo = require('./saveAlertFunc/3c.alertSentInfo.js');
let pushNotification = require('./pushNotification.js');
let bcrypt = require('bcryptjs');
let functions = require('./../../functions');


/* Verify PIN. -------------------------------*/
module.exports.verifyPinGet = function(req, res) {
    let alertToUpdate = req.params.id;

    async.parallel([
        function(callback) {
            if(req.decoded) { //API user
                models.Users.findOne({'email': req.decoded.user.email}).exec(callback);
            }else{  //EJS user
                functions.aclSideMenu(req, res, function (acl) {callback(null, acl);}); //aclPermissions sideMenu
            }
        }

    ],function(err, results){
        if (!results[0]) {
            functions.alertTimeExpired(req,res);
        }
        else {

            if(req.decoded){ // run SMECS API
                res.json({
                    success: true
                });

            }else{  // run SMECS EJS
                res.render('alerts/sending/verifyPin', {
                    title: 'Verify Pin',
                    alertToUpdate: alertToUpdate,
                    aclSideMenu: results[0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            }
        }
    });
};

module.exports.verifyPinPost = function(req, res) {
    let email; // EJS user
    if (req.decoded)      // API user
        email = req.decoded.user.email;
    else
        email = req.user.email;

    let bodyPin = req.body.pin;
    let alertToUpdate = req.body.alertToUpdate;

    models.Users.findOne({'email': email}, function (err, user) {
        if (err) {
            if (req.decoded) {     // API user
                return res.json({
                    success: false,
                    message: 'Failed to locate user.'
                });
            }
            else    // EJS user
                console.log('Failed to locate user. err = ',err);
        }
        else {
            if ( typeof bodyPin !== 'undefined' && bodyPin )
            {
                if (!bcrypt.compareSync(bodyPin, user.pin)) {
                    console.log('Wrong Pin');
                    if (req.decoded) {     // API user
                        return res.json({
                            success: false,
                            message: 'Authentication failed. Wrong Pin.'
                        });
                    }
                    else    // EJS user
                        console.log('Incorrect Pin');
                } else {
                    console.log('Pin OK');
                    models.AlertSentTemp.findById(alertToUpdate, function (err, alertTemp) {
                        if (!alertTemp) {
                            functions.alertTimeExpired(req,res);
                        }
                        else {
                            redirectTo(req,res,alertTemp);
                        }
                    });
                }
            } else {
                console.log('Pin undefined');
                console.log('req.body.pin = ',req.body.pin);
            }
        }
    });
};
/* end of Verify PIN. -------------------------------*/


/* Create AlertSentInfo and Send PushNotification. -------------------------------*/
module.exports.createAlert= function(req, res) {
    let alertToUpdate = req.params.id;

    models.AlertSentTemp.findById({'_id': alertToUpdate}, function (err, alertTemp) {
        if (!alertTemp) {
            functions.alertTimeExpired(req,res);
        }
        else {
            if(alertTemp.realDrillDemo !== 'demo') {
                alertTemp.latitude = req.body.latitude;
                alertTemp.longitude = req.body.longitude;
                alertSentInfo.create(req, res, alertTemp,function (result,err) {  //create AlertSentInfo
                    /*****  CALL HERE NOTIFICATION API  *****/
                    pushNotification.alert(result, 'newAlert');
                    console.log('0 = ');
                    redirectTo(req,res,alertTemp);
                });
            }
            else {
                redirectTo(req,res,alert);
            }
        }
    });
};
/* end of Create AlertSentInfo and Send PushNotification. -------------------------------*/


function redirectTo(req, res, alertTemp) {
    let redirectAPI = ''; //API user
    let redirectEJS = ''; //EJS user

    /***      ALERT ROAD      ***/
    alertTemp.alertRoad.forEach(function (road) {
        if(road.step == alertTemp.roadIndex) {
            for (let i=0; i < road.callFunction.length; i++) {

            }
            redirectAPI = road.redirectAPI;
            redirectEJS = road.redirectEJS + alertTemp._id;
        }
    });
    alertTemp.roadIndex = ++alertTemp.roadIndex;
    alertTemp.save();
    if(req.decoded){ // run SMECS API
        res.json({
            success: true,
            redirect: redirectAPI
        });
    }else{  // run SMECS EJS
        console.log('1 = ',redirectEJS);
        res.send({redirect: redirectEJS});
        //res.redirect(redirectEJS);
    }
    /***     end of ALERT ROAD      ***/

}