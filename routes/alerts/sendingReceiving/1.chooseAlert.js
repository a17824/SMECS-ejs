//Dependencies
var models = require('./../../models');
var async = require("async");
var whoReceiveAlert = require('./saveAlertFunc/1b.createRolesUsersScope.js');
var buildAlertButtonsArray = require('./saveAlertFunc/1a.createAlertButtonsArray.js');
var functions = require('./../../functions');





/* Choose Group. -------------------------------*/
module.exports.showGroups = function(req, res) {
    if(req.decoded) { // run SMECS API
        models.Users.findOne({'email': req.decoded.user.email}, function (err, user) {
            if (user.appSettings.groupAlertsButtons == false) {//Groups Buttons OFF ----------
                res.json({
                    success: true,
                    redirect: 'chooseAlert'
                });
            } else {    //Groups Buttons ON

                showGroups2();
            }
        });
    }
    else{   // run SMECS EJS -----------------

        if(req.user.appSettings.groupAlertsButtons == false)    //Groups Buttons OFF
            res.redirect('/alerts/sending/chooseAlert');
        else {  //Groups Buttons ON
            showGroups2();
        }
    }


    function showGroups2() {
        async.parallel([
            function(callback){
                buildAlertButtonsArray.getRealTestAlerts(req,function(arrayAlerts) {
                    callback(null, arrayAlerts);
                });
            },
            function(callback) {
                if(req.decoded)   //API user
                    callback(null, 'API');
                else    //EJS user
                    functions.aclSideMenu(req, res, function (acl) {callback(null, acl);}); //aclPermissions sideMenu
            }


        ],function(err, results){

            var real = results[0][0];
            var test = results[0][1];



            var arrayGroupsReal = [];
            var groupReal = 99999;
            for (var i=0; i < real.length; i++ ){
                if(real[i].groupID !== groupReal) {
                    groupReal = real[i].groupID;
                    var arrGroupObjReal = {
                        groupID: real[i].groupID,
                        sortID: real[i].sortID,
                        name: real[i].name,
                        alertColor: real[i].alertColor,
                        alertColorValue: real[i].alertColorValue
                    };
                    arrayGroupsReal.push(arrGroupObjReal);
                }
            }
            var arrayGroupsTest = [];
            var groupTest = 99999;
            for (var x=0; x < test.length; x++ ){
                if(test[x].groupID !== groupTest) {
                    groupTest = test[x].groupID;
                    var arrGroupObjTest = {
                        sortID: test[x].sortID,
                        groupID: test[x].groupID,
                        name: test[x].name,
                        alertColor: test[x].alertColor,
                        alertColorValue: test[x].alertColorValue
                    };
                    arrayGroupsTest.push(arrGroupObjTest);
                }
            }

            if(req.decoded){ // run SMECS API
                res.json({
                    success: true,
                    aclReal: arrayGroupsReal,
                    aclTest: arrayGroupsTest

                });

            }else{  // run SMECS EJS
                functions.redirectTabUsers(req, res, 'showUsers');
                res.render('alerts/sending/chooseGroup',{
                    title:'Choose Alert',
                    aclReal: arrayGroupsReal,
                    aclTest: arrayGroupsTest,
                    aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            }
        })
    }
};

module.exports.showGroupsPost = function(req, res) {
    var alertTemp1 = new models.AlertSentTemp({
        alertGroupID: req.body.alertGroupID, //first time running IntelliJ gives error of 'Cannot read property 'groupID' of undefined'
        alertGroupName: req.body.alertGroupName,
        testModeON: req.body.testModeON
    });
    alertTemp1.save();

    if(req.decoded){ // run SMECS API
        res.json({
            success: true,
            redirect: 'chooseGroupAlert',
            _id: alertTemp1._id
        });
    }else{  // run SMECS EJS
        return res.send({redirect: '/alerts/sending/chooseGroupAlert/' + alertTemp1._id})
    }
};


/* Choose Alert. -------------------------------*/
module.exports.showAlerts = function(req, res) {
    async.parallel([
        function(callback){
            buildAlertButtonsArray.getRealTestAlerts(req,function(arrayAlerts) {
                callback(null, arrayAlerts);
            });
        },
        function(callback) {
            if(req.decoded)   //API
                callback(null, 'API');
            else    //EJS
                functions.aclSideMenu(req, res, function (acl) {callback(null, acl);}); //aclPermissions sideMenu
        }

    ],function(err, results){
        if(req.params.id){ //----------------------- Groups Buttons ON ----------------------------------
            models.AlertSentTemp.findById(req.params.id, function (err, alert) {
                if(err)
                    console.log('err - ',err);
                else{
                    if (!alert) {
                        functions.alertTimeExpired(req,res);
                    }
                    else {
                        var real = results[0][0];
                        var test = results[0][1];

                        var arrayAlertsReal = [];
                        for (var x=0; x < real.length; x++ ){
                            if(real[x].groupID == alert.alertGroupID) {
                                arrayAlertsReal.push(real[x]);
                            }
                        }
                        var arrayAlertsTest = [];
                        for (var x=0; x < test.length; x++ ){
                            if(test[x].groupID == alert.alertGroupID) {
                                arrayAlertsTest.push(test[x]);
                            }
                        }

                        if(req.decoded){ //API user
                            res.json({
                                success: true,
                                alert: alert,
                                aclReal: arrayAlertsReal,
                                aclTest: arrayAlertsTest
                            });
                        }else{  //EJS user
                            res.render('alerts/sending/chooseAlert',{   //Groups Buttons ON
                                title:'Choose Alert',
                                alert: alert,
                                aclReal: arrayAlertsReal,
                                aclTest: arrayAlertsTest,
                                aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                                userAuthPhoto: req.user.photo
                            });
                        }



                    }
                }
            })
        }else { //---------------- Groups Buttons OFF --------------------
            var alert = {
                'id': 0
            };

            if(req.decoded){ // run SMECS API
                res.json({
                    success: true,
                    alert: alert,
                    testModeOnArrayReal: results[0][0],
                    testModeOnArrayTest: results[0][1]

                });

            }else{  // run SMECS EJS
                functions.redirectTabUsers(req, res, 'showUsers');
                res.render('alerts/sending/chooseAlert',{
                    title:'Choose Alert',
                    alert: alert,
                    aclReal: results[0][0],
                    aclTest: results[0][1],
                    aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            }

        }
    })
};

module.exports.showAlertsPost = function(req, res) {
    var redirectAPI; //API user
    var redirectEJS; //EJS user

    async.waterfall([
        function (callback) {
            models.Alerts.find({'alertID': req.body.alertID}, function (err, alert) {
                if(err){
                    console.log('err chooseAlert post line 522 = ', alert );
                }else{
                    var placeholderNote,
                        placeholderMissingChildLastPlaceSeen,
                        placeholderMissingChildClothesWearing,
                        placeholderStudentWithGunSeated,
                        placeholderStudentWithGunBehaviour,
                        placeholderEvacuateWhereTo;

                    if (req.body.alertID == 2){placeholderNote = 'ex: Stranger is on my classroom and refuses to leave';}
                    if (req.body.alertID == 3){placeholderNote = 'ex: Many people will be working on the corridors. Please follow the procedure for Lockdown';}
                    if (req.body.alertID == 4){
                        placeholderNote = 'ex: Anna said he went to pick food';
                        placeholderMissingChildLastPlaceSeen = 'ex: Gym';
                        placeholderMissingChildClothesWearing = 'ex: School uniform';}
                    if (req.body.alertID == 5){
                        placeholderNote = 'ex: gun is in his pants, left front pocket';
                        placeholderStudentWithGunSeated = 'ex: Second row, second seat from left';
                        placeholderStudentWithGunBehaviour = 'ex: Normal';}
                    if (req.body.alertID == 6){placeholderNote = 'ex: Corrosives and Flammable spill at lab';}
                    if (req.body.alertID == 7){
                        placeholderNote = 'ex: there is a strange strong smell on the entire building';
                        placeholderEvacuateWhereTo = 'ex: church';}
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
                    if (req.body.alertID == 29){placeholderNote = 'ex: flood.';}


                    if(req.body.alertToUpdate == 0){    //Groups Buttons OFF
                        var alertTemp1 = new models.AlertSentTemp({
                            alertGroupID: req.body.alertGroupID,
                            alertGroupName: req.body.alertGroupName,
                            alertNameID: req.body.alertID,
                            alertName: req.body.alertName,
                            testModeON: req.body.testModeON,
                            requestProcedureCompleted: alert[0].alertRequestProcedureCompleted,
                            requestWeAreSafe: alert[0].alertRequestWeAreSafe,
                            requestINeedHelp: alert[0].alertRequestForINeedHelp,
                            request911Call: alert[0].alertRequest911Call,
                            whoCanCall911: alert[0].whoCanCall911,
                            placeholderNote: placeholderNote,
                            placeholderMissingChildLastPlaceSeen: placeholderMissingChildLastPlaceSeen,
                            placeholderMissingChildClothesWearing: placeholderMissingChildClothesWearing,
                            placeholderStudentWithGunSeated: placeholderStudentWithGunSeated,
                            placeholderStudentWithGunBehaviour: placeholderStudentWithGunBehaviour,
                            placeholderEvacuateWhereTo: placeholderEvacuateWhereTo,
                            groupSound: alert[0].mp3
                        });
                        alertTemp1.save();
                        callback(null, alertTemp1);

                    }
                    else{   //Groups Buttons ON
                        var alertToUpdate1 = req.body.alertToUpdate;
                        models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, alertTemp) {
                            if(err)
                                console.log('err - ',err);
                            else {
                                if (!alertTemp) {
                                    functions.alertTimeExpired(req,res);
                                }
                                else {
                                    alertTemp.alertNameID = req.body.alertID;
                                    alertTemp.alertName = req.body.alertName;
                                    alertTemp.requestProcedureCompleted = alert[0].alertRequestProcedureCompleted;
                                    alertTemp.requestWeAreSafe = alert[0].alertRequestWeAreSafe;
                                    alertTemp.requestINeedHelp = alert[0].alertRequestForINeedHelp;
                                    alertTemp.request911Call = alert[0].alertRequest911Call;
                                    alertTemp.whoCanCall911 = alert[0].whoCanCall911;
                                    alertTemp.placeholderNote = placeholderNote;
                                    alertTemp.groupSound = alert[0].mp3;

                                    alertTemp.save();
                                    callback(null, alertTemp);
                                }
                            }
                        })
                    }

                }
            });
        }
    ], function (err, alertTemp1) {
        whoReceiveAlert.getUsersToReceiveAlert(req, res, alertTemp1, function (result,err) {
            if(err){
                console.log('err = ', err);
            }else {
                var alertTemp1 = result;
                if(alertTemp1.sentRoleIDScope < 1){
                    console.log('No scopes or users to send this alert');
                }else {
                    if (req.body.alertID == 1 ) {
                        redirectAPI = 'panic';
                        redirectEJS = '/alerts/sending/panic/' + alertTemp1._id;

                    }

                    if (req.body.alertID == 2 ||
                        req.body.alertID == 6 ||
                        req.body.alertID == 7 ||
                        req.body.alertID == 9 ||
                        req.body.alertID == 10 ||
                        req.body.alertID == 11 ||
                        req.body.alertID == 15 ||
                        req.body.alertID == 23 ||
                        req.body.alertID == 26) {

                        redirectAPI = 'floor';
                        redirectEJS = '/alerts/sending/floor/' + alertTemp1._id;
                    }

                    if (req.body.alertID == 3 ||
                        req.body.alertID == 8 ||
                        req.body.alertID == 12 ||
                        req.body.alertID == 13 ||
                        req.body.alertID == 20 ||
                        req.body.alertID == 21 ||
                        req.body.alertID == 22 ||
                        req.body.alertID == 27 ) {

                        redirectAPI = 'notes';
                        redirectEJS = '/alerts/sending/notes/' + alertTemp1._id;
                    }

                    if (req.body.alertID == 4 ||
                        req.body.alertID == 5 ||
                        req.body.alertID == 16 ||
                        req.body.alertID == 17 ||
                        req.body.alertID == 19 ) {

                        redirectAPI = 'student';
                        redirectEJS = '/alerts/sending/student/' + alertTemp1._id;
                    }

                    if (req.body.alertID == 14 ||
                        req.body.alertID == 18 ||
                        req.body.alertID == 26 ||
                        req.body.alertID == 29 ) {

                        redirectAPI = 'multiSelection';
                        redirectEJS = '/alerts/sending/multiSelection/' + alertTemp1._id;
                    }

                    if(req.decoded){ // run SMECS API
                        res.json({
                            success: true,
                            redirect: redirectAPI,
                            _id: alertTemp1._id
                        });
                    }else{  // run SMECS EJS
                        if (req.body.alertID == 1 )
                            return res.redirect(307, redirectEJS);
                        else
                            return res.send({redirect: redirectEJS})
                    }
                }
            }
        });
    });

};
/*-------------------------end of choosing Alerts*/
