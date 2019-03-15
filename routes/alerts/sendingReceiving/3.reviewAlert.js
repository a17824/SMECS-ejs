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
            let flag = 'alertWithNoFloor';
            for (let i=0; i < results[0].alertRoad.length; i++) {
                if (results[0].alertRoad[i].redirectAPI === 'floor'){
                    flag = 'floor';
                    break
                }
            }

            if(req.decoded){ // run SMECS API
                res.json({
                    success: true,
                    userAuthGroupAlerts: results[4].userRoleName, //for Call911 button
                    info: results[0],
                    floor: results[1],
                    utilities: results[2],
                    results: results[3], // check if alert is softDeleted for Utilities Failure
                    flagFloor: flag
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
                    userAuthPhoto: req.user.photo,
                    flagFloor: flag
                });
            }
        }
    })
};

module.exports.postReviewAlert = function(req, res, next) {
    var alertToUpdate1 = req.body.alertToUpdate;

    models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, tempAlert) {
        if (!tempAlert) {
            functions.alertTimeExpired(req,res);
        }
        else {
            /****************************       ALERT ROAD       ****************************/
            /** functions needed here are: floor.saveFloorFile, student.updateStudentFile  **/
            redirectTo.redirectTo(req,res,tempAlert,'GETtoPOST');
        }
    });
};


