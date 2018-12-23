//Dependencies
var models = require('./../../models');
var async = require("async");
var reqAsst = require('./saveAlertFunc/2_3_4.reqAssistance.js');
var functions = require('./../../functions');
let redirectTo = require('./createAlert');

module.exports.reviewAlert = function(req, res) {
    async.parallel([
        function(callback){models.AlertSentTemp.findById(req.params.id).exec(callback);},
        function(callback){models.Floors.find().exec(callback);},
        function(callback){models.Utilities.find().exec(callback);},
        function(callback){models.Alerts.find().exec(callback);},
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
                    success: true,
                    userAuthGroupAlerts: results[4].userRoleName, //for Call911 button
                    info: results[0],
                    floor: results[1],
                    utilities: results[2],
                    results: results[3] // check if alert is softDeleted for Utilities Failure

                });

            }else{  // run SMECS EJS
                res.render('alerts/sending/reviewAlert', {
                    title: 'Review Alert',
                    userAuthRoleName: req.user.userRoleName,
                    info: results[0],
                    floor: results[1],
                    utilities: results[2],
                    alerts: results[3], // check if alert is softDeleted for Utilities Failure
                    aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            }
        }
    })
};

module.exports.postReviewAlert = function(req, res, next) {
    var alertToUpdate1;
    let redirectAPI; //API user
    let redirectEJS; //EJS user

    if(req.body.alertToUpdate == 0) //panic alert
        alertToUpdate1 = req.params.id;
    else
        alertToUpdate1 = req.body.alertToUpdate; //all other alerts


    async.waterfall([
        function (callback) {
            models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, tempAlert) {

                /***      ALERT ROAD      ***/
                redirectTo.redirectTo(req,res,tempAlert,'verify');

                callback(null, tempAlert);
            });
        },
        function (tempAlert, callback) {

            // Alert Request Assistance
            if (tempAlert.alertNameID == 26 ){

                models.Utilities.find({'utilityID': tempAlert.multiSelectionIDs}, function (err, utils) {
                    if (err)
                        console.log('err - ', err);
                    else {
                        models.AlertSentInfo.findById({'_id': alertToUpdate1}, function (err, alert) {
                            if(err){
                                console.log('err = ', err);
                            }else {
                                var arraySmecsAppToSent =[];
                                reqAsst.buildSmecsAppUsersArrToSendReqAss(alert, utils, tempAlert.reqAssOn, tempAlert.reqAssOff, arraySmecsAppToSent,'notify','update');

                            }
                        });
                    }
                });
            }
            callback(null, tempAlert);
        }

    ], function (err, tempAlert) {

        /***      ALERT ROAD      ***/
        redirectTo.redirectTo(req,res,tempAlert,'doNotRedirect');

    });
};
