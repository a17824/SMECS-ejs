//Dependencies
var models = require('./../../models');
var async = require("async");
var whoReceiveAlert = require('./saveAlertFunc/1b.createRolesUsersScope.js');
var buildAlertButtonsArray = require('./saveAlertFunc/1a.createAlertButtonsArray.js');
//var aclPermissions = require('./aclPermissions');



/* Choose Alert. -------------------------------*/
module.exports.show = function(req, res) {
    async.parallel([
        function(callback){
            models.Alerts.find().sort({"sortID":1}).sort({"sortID":1}).exec(callback);
        },
        function(callback){
            buildAlertButtonsArray.getRealTestAlerts(req,function(arrayAlerts) {
                callback(null, arrayAlerts);
            });
        }
    ],function(err, results){
        res.render('alerts/sending/chooseAlert',{
            title:'Choose Alert',
            userAuthPrivilegeID: req.user.userPrivilegeID,
            userAuthRoleID: req.user.userRoleID[0],
            alerts: results[0],
            aclReal: results[1][0],
            aclTest: results[1][1]
        });
    })
};

module.exports.showPost = function(req, res) {

    async.waterfall([
        function (callback) {
            models.Alerts.find({'alertID': req.body.alertID}, function (err, alert) {
                if(err){
                    console.log('err = ', alert );
                }else{
                    var placeholderNote;
                    if (req.body.alertID == 2){placeholderNote = 'ex: Stranger is on my classroom and refuses to leave';}
                    if (req.body.alertID == 3){placeholderNote = 'ex: Many people will be working on the corridors. Please follow the procedure for Lockdown';}
                    if (req.body.alertID == 4){placeholderNote = 'ex: Anna said he went to pick food';}
                    if (req.body.alertID == 5){placeholderNote = 'ex: gun is in his pants, left front pocket';}
                    if (req.body.alertID == 6){placeholderNote = 'ex: Corrosives and Flammable spill at lab';}
                    if (req.body.alertID == 7){placeholderNote = 'ex: there is a strange strong smell on the entire building';}
                    if (req.body.alertID == 8){placeholderNote = 'ex: the caller said bomb will detonate in 5 hours';}
                    if (req.body.alertID == 9){placeholderNote = 'ex: bomb is located behind door of classroom 12';}
                    if (req.body.alertID == 10){placeholderNote = 'ex: computer is on fire. Students are safe';}
                    if (req.body.alertID == 11){placeholderNote = 'ex: powder leaking from package';}
                    if (req.body.alertID == 12){placeholderNote = 'ex: SUV crash against us. No students got hurt';}
                    if (req.body.alertID == 13){placeholderNote = 'ex: road power pole broken. Don\'t use any school front door';}
                    if (req.body.alertID == 14 || req.body.alertID == 26 ){placeholderNote = 'ex: water is dark and smells gas on 1 floor';}
                    if (req.body.alertID == 15){placeholderNote = 'ex: gun is under student desk. It\'s first desk of second row';}
                    if (req.body.alertID == 16){placeholderNote = 'ex: student selling drugs in the restroom';}
                    if (req.body.alertID == 17){placeholderNote = 'ex: Mary is saying she saw Tom trying to cut his wrist';}
                    if (req.body.alertID == 18){placeholderNote = 'ex: Emma and Peter felt in stairs. Emma loss consciousness and Peter head is bleeding';}
                    if (req.body.alertID == 19){placeholderNote = 'ex: Charlotte cut her wrist';}
                    if (req.body.alertID == 20){placeholderNote = 'ex: Media are here because of Arthur incident.';}
                    if (req.body.alertID == 21){placeholderNote = 'ex: remember to not touch anything and put yellow tape around area.';}
                    if (req.body.alertID == 22){placeholderNote = 'ex: .';}
                    if (req.body.alertID == 23){placeholderNote = 'ex: Multiple students fighting.';}
                    if (req.body.alertID == 27){placeholderNote = 'ex: early dismissal.';}

                    var alertTemp1 = new models.AlertSentTemp({
                        alertGroupID: req.body.alertGroupID, //first time running IntelliJ gives error of 'Cannot read property 'alertTypeID' of undefined'
                        alertGroupName: req.body.alertGroupName,
                        alertNameID: req.body.alertID,
                        alertName: req.body.alertName,
                        testModeON: req.body.testModeON,
                        request911Call: alert[0].alertRequest911Call,
                        whoCanCall911: alert[0].whoCanCall911,
                        placeholderNote: placeholderNote
                    });
                    alertTemp1.save();
                    callback(null, alertTemp1);
                }
            });
        },
        function (alertTemp1, callback) {
            whoReceiveAlert.getUsersToReceiveAlert(req, res, alertTemp1); //save SCOPES to database
            callback(null, alertTemp1);
        }

    ], function (err, alertTemp1) {

        if (req.body.alertID == 2 ||
            req.body.alertID == 6 ||
            req.body.alertID == 7 ||
            req.body.alertID == 9 ||
            req.body.alertID == 10 ||
            req.body.alertID == 11 ||
            req.body.alertID == 15 ||
            req.body.alertID == 23 ) {

            return res.send({redirect: '/alerts/sending/floor/' + alertTemp1._id})
        }
        if (req.body.alertID == 3 ||
            req.body.alertID == 8 ||
            req.body.alertID == 12 ||
            req.body.alertID == 13 ||
            req.body.alertID == 20 ||
            req.body.alertID == 21 ||
            req.body.alertID == 22 ||
            req.body.alertID == 27 ) {
            return res.send({redirect: '/alerts/sending/notes/' + alertTemp1._id})
        }
        if (req.body.alertID == 4 ||
            req.body.alertID == 5 ||
            req.body.alertID == 16 ||
            req.body.alertID == 17 ||
            req.body.alertID == 19 ) {

            return res.send({redirect: '/alerts/sending/student/' + alertTemp1._id})
        }
        if (req.body.alertID == 14 ||
            req.body.alertID == 18 ||
            req.body.alertID == 26 ) {

            return res.send({redirect: '/alerts/sending/multiSelection/' + alertTemp1._id})
        }
    });
};
/*-------------------------end of choosing Alerts*/
