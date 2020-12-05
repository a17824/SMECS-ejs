//Dependencies
var models = require('./../../models');
var async = require("async");
var aclPermissions = require('./../../acl/aclPermissions');
var updateNotes = require('../sendingReceiving/5.updates');
var moment = require('moment');
var pushNotification = require('./../sendingReceiving/pushNotification.js');
var functions = require('../../functions');
var MobileDetect = require('mobile-detect');
let reportsApi = require('./../../api/reports.js');
let reportsEJS = require('./reports.js');
let canReqAssFunc = require('./../sendingReceiving/4.receivedAlert.js');
let reqButtons = require('./../sendingReceiving/saveAlertFunc/2_3_4.reqAssButtons');


//* SHOW REPORTS. */
module.exports.homeReports = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertSentInfo.find({autoAlert: false}).sort({"_id":-1}).exec(callback);
        },
        function(callback){aclPermissions.clearReports(req, res, callback);},          //aclPermissions clearReports
        function(callback){aclPermissions.deleteReports(req, res, callback);},       //aclPermissions deleteReports
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        //default tabs to show
        functions.redirectTabUsers(req, res, 'showUsers');
        functions.redirectTabAlertGroups(req, res, 'showGroups');
        functions.redirectTabBuildings(req, res, 'showBuilding');
        functions.redirectTabProcedure(req, res, 'showGeneral');
        functions.redirectTabLightsPanicButtons(req, res, 'showLights');
        //end of default tabs to show

        let page = 'home-reports/home-reports';

        let md = new MobileDetect(req.headers['user-agent']);

        if(md.is('iPad') == true)
            page = 'home-reports/home-mobReports';

        if(!results[3][1])   //if user has no permissions, redirect to his profile
            res.redirect('/users/showUsers');

        else{
            res.render(page,{
                title: 'Reports',
                reportSent: results[0],
                aclClearReports: results[1],           //aclPermissions clearReports
                aclDeleteReports: results[2],        //aclPermissions deleteReports
                aclSideMenu: results[3][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        }

    })
};

//* SHOW REPORTS Archived. */
module.exports.reportsArchived = function(req, res, next) {
    async.parallel([
        function(callback){
            models.AlertSentInfo.find({autoAlert: false}).sort({"_id":-1}).sort({"sentTime":-1}).exec(callback);
        },
        function(callback){aclPermissions.clearReports(req, res, callback);},          //aclPermissions clearReports
        function(callback){aclPermissions.deleteReports(req, res, callback);},       //aclPermissions deleteReports
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        res.render('home-reports/archivedReports',{
            title: 'Reports Archived',
            reportSent: results[0],
            aclClearReports: results[1],           //aclPermissions clearReports
            aclDeleteReports: results[2],        //aclPermissions deleteReports
            aclSideMenu: results[3][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};

//* SHOW REPORTS Archived. */
module.exports.reportsTrash = function(req, res, next) {
    async.parallel([
        function(callback){
            models.AlertSentInfo.find({autoAlert: false}).sort({"_id":-1}).sort({"sentTime":-1}).exec(callback);
        },
        function(callback){aclPermissions.clearReports(req, res, callback);},          //aclPermissions clearReports
        function(callback){aclPermissions.deleteReports(req, res, callback);},       //aclPermissions deleteReports
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        res.render('home-reports/trashReports',{
            title: 'Trash',
            reportSent: results[0],
            aclClearReports: results[1],           //aclPermissions clearReports
            aclDeleteReports: results[2],        //aclPermissions deleteReports
            aclSideMenu: results[3][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};

/* REOPEN ALERT */
module.exports.updateStatusReopen = function(req, res) {

    let alertsClosed = [];
    let alertsReopend = [];
    let reOpenAlert = true;
    let reopenNote = req.body.note;

    models.AlertSentInfo.find({'_id': req.body.alertId}, function(err, alerts){//check if Request Assistance is softDeleted
        if(err || !alerts) console.log("No AlertInfo found");
        else{
            alerts[0].status.statusString = 'open';
            alerts[0].status.statusClosedDate = undefined;
            alerts[0].status.statusClosedTime = undefined;

            //reset users view/received/procedure completed
            alerts[0].sentTo.forEach(function (user) {

                user.received.receivedBoolean = false;
                user.received.receivedDate = undefined;
                user.received.receivedTime = undefined;
                user.received.timeDif = undefined;

                user.viewed.viewedBoolean = false;
                user.viewed.viewedDate = undefined;
                user.viewed.viewedTime = undefined;
                user.viewed.timeDif = undefined;

                user.procedureCompleted.boolean = false;
                user.procedureCompleted.date = undefined;
                user.procedureCompleted.time = undefined;
                user.procedureCompleted.timeDif = undefined;

                user.weAreSafe.boolean = false;
                user.weAreSafe.date = undefined;
                user.weAreSafe.time = undefined;
                user.weAreSafe.timeDif = undefined;

                user.called911.boolean = false;
                user.called911.date = undefined;
                user.called911.time = undefined;
                user.called911.timeDif = undefined;

                user.iNeedHelp.boolean = false;
                user.iNeedHelp.date = undefined;
                user.iNeedHelp.time = undefined;
                user.iNeedHelp.timeDif = undefined;
                user.iNeedHelp.helpers = undefined;
            });

            updateNotes.postUpdateNotes(req, res, 'closeReopenAlerts', alerts[0]._id, reopenNote);

            alerts[0].save(function(err) {
                if (err)
                    console.log('err = ', err);
                else
                    console.log('success - Alert status changed to ' + alerts[0].status.statusString);
            });

            //this info will be require for the popup window in app to say which alerts were reopen
            let alertIdName = {
                id: alerts[0]._id,
                name: alerts[0].alert.name
            };
            alertsReopend.push(alertIdName);

            /*****  CALL HERE NOTIFICATION API  *****/
            pushNotification.updateBadge(alerts,reOpenAlert,alertsClosed,alertsReopend);
            return res.send({redirect: '/reports/homeReports'});
        }
    });
};

//CLOSE ALERTS
module.exports.updateStatus = function(req, res) {
    console.log('1111111111111111111WWWWWWWWWWWWWWWWWWWW');
    let statusToChange = req.body.searchIDsChecked;
    let closedNote = req.body.note;
    let wrapped = moment(new Date());

    let alertsClosed = [];
    let alertsReopend = [];

    models.AlertSentInfo.find({$or: [{'_id': statusToChange}, {'parent': statusToChange}]},function (err, alerts) {
        if (err) {
            console.log('err - changing Alert STATUS');
        } else {
            let reOpenAlert = false;
            alerts.forEach(function(alert){
                if (alert.status.statusString == 'open') {
                    alert.status.statusString = 'closed';
                    alert.status.statusClosedDate = wrapped.format('YYYY-MM-DD');
                    alert.status.statusClosedTime = wrapped.format('h:mm:ss a');

                    //this info will be require for the popup window in app if user is updating alert that was closed
                    let alertIdName = {
                        id: alert._id,
                        name: alert.alert.name
                    };
                    alertsClosed.push(alertIdName);

                } else {
                    alert.status.statusString = 'open';
                    alert.status.statusClosedDate = undefined;
                    alert.status.statusClosedTime = undefined;
                    reOpenAlert = true;

                    //this info will be require for the popup window in app to say which alerts were reopen
                    let alertIdName = {
                        id: alert._id,
                        name: alert.alert.name
                    };
                    alertsReopend.push(alertIdName);
                }

                updateNotes.postUpdateNotes(req, res, 'closeReopenAlerts', alert._id, closedNote);

                alert.save(function(err) {
                    if (err)
                        console.log('err = ', err);
                    else
                        console.log('success - Alert status changed to ' + alert.status.statusString);
                });

            });
            /*****  CALL HERE NOTIFICATION API  *****/
            pushNotification.updateBadge(alerts,reOpenAlert,alertsClosed,alertsReopend);
            return res.send({redirect: '/reports/homeReports'});
        }
    })
};
/* ------------ end of SoftDeleted USERS. */

/* Move Alerts to Archive. */
module.exports.moveToArchiveInboxTrash = function(req, res) {

    var statusToChange = req.body.searchIDsChecked;
    var action = req.body.action;
    var page = req.body.page;

    models.AlertSentInfo.find({$or: [{'_id': statusToChange}, {'parent': statusToChange}]}, function (err, alerts) {
        if (err) {
            console.log('err - changing Alert to Archive or Inbox');
        } else {
            alerts.forEach(function(alert){

                if (action == 'inbox'){
                    alert.archived = false;
                    if (page == '/reports/showTrashReports'){
                        alert.softDeletedBy = null;
                        alert.softDeletedDate = null;
                        alert.softDeletedTime = null;
                        alert.expirationDate = undefined;
                    }
                }
                if (action == 'archive') {
                    alert.archived = true;
                    if (page == '/reports/showTrashReports'){
                        alert.softDeletedBy = null;
                        alert.softDeletedDate = null;
                        alert.softDeletedTime = null;
                        alert.expirationDate = undefined;

                        let alertIdName = {
                            id: alert._id,
                            name: alert.alert.name
                        };
                    }
                }
                if (action == 'trash') {
                    var wrapped = moment(new Date());
                    alert.archived = false;
                    alert.softDeletedBy = req.session.user.firstName + " " + req.session.user.lastName;
                    alert.softDeletedDate = wrapped.format('YYYY-MM-DD');
                    alert.softDeletedTime = wrapped.format('h:mm:ss');
                    alert.expirationDate = new Date(Date.now() + ( 30 * 24 * 3600 * 1000)); //( 'days' * 24 * 3600 * 1000) milliseconds

                    let alertIdName = {
                        id: alert._id,
                        name: alert.alert.name
                    };
                }
                alert.save();
            });
            /*****  CALL HERE NOTIFICATION API  *****/
            pushNotification.updateClosedAlertsPage();
            return res.send({redirect: page});
        }
    })
};
/* ------------ end of Move Alerts to Archive. */


module.exports.reportsDetails = function(req, res) {
    let classNames;
    if(req.params.fromWhere === 'reportsPage') //reportsPage
        classNames = 'panel-collapse collapse';
    else //helpersPage
        classNames = 'panel-collapse collapse in';

    async.parallel([
        function(callback){models.AlertSentInfo.findById(req.params.id).exec(callback);},
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        if(err || !results) console.log('reportsDetails: something wrong with results. err - ', err);
        else {
            if (!req.decoded)       // EJS user
                reportsApi.receivedViewedAlert(req, results[0]); //mark alert as been received and viewed

            let page = 'home-reports/reportDetails';
            if(req.params.id == '5b1e96f26e727c382cbce097')
                page = 'home-reports/reportDetailsSim';
            if(req.params.id == '5b1eb1d86e727c382cbce0a6')
                page = 'home-reports/reportDetailsSimAllGreen';



            //HTML TAGS (classNames, hide show 911, Gauges, Accordions Procedure, Safe, Help
            let alertWith911 = 'hideThis';
            let showProcedure = 'hideThis';
            let showSafe = 'hideThis';
            let showHelp = 'hideThis';
            let flagCount = 0;
            let pageColSize = 'col-md-12 col-sm-12 col-xs-12';     // 1 Gauges
            let pageColSize2 = 'col-md-6 col-sm-6 col-xs-6';    // last Gauge

            if(results[0].request911Call)
                alertWith911 = 'showThis';

            if(results[0].requestProcedureCompleted){
                showProcedure = 'showThis';
                flagCount++;
            }
            if(results[0].requestWeAreSafe){
                showSafe = 'showThis';
                flagCount++;
            }
            if(results[0].requestINeedHelp){
                showHelp = 'showThis';
            }
            if(flagCount == 1){ // 2 Gauges
                pageColSize = 'col-md-6 col-sm-6 col-xs-6';
                pageColSize2 = 'col-md-6 col-sm-6 col-xs-6';
            }

            if(flagCount == 2){ // 3 Gauges
                pageColSize = 'col-md-4 col-sm-4 col-xs-6';
                pageColSize2 = 'col-md-4 col-sm-4 col-xs-6';
                //pageColSize = 'col-md-3 col-sm-3 col-xs-6';    // 4 Gauges
                //pageColSize2 = 'col-md-3 col-sm-3 col-xs-6';   // 4 Gauges
            }
            //end of hide show Gauges Accordions Procedure, Safe, Help

            //Alert with Lights, Sound, Emails, TextMessage (if changes are made to icons, 1.chooseAlert.js need to be change as well)
            let lights = '187.png';
            let lightTitle = 'This alert does not use Lights in classrooms';
            let sound = '178.png';
            let soundTitle = 'This alert does not play Sound in classrooms';
            let emails = '188.png';
            let emailsTitle = 'This alert does not send Emails';
            let textMessages = '192.png';
            let TextMessagesTitle = 'This alert does not send text messages';

            if(results[0].alert.light){
                lights = '53.png';
                lightTitle = 'This alert uses Lights in classrooms to make people aware that an alert was sent';
            }
            if(results[0].alert.lightSound){
                sound = '179.png';
                soundTitle = 'This alert plays Sound in classrooms to make people aware that an alert was sent';
            }
            if(results[0].requestSendEmail){
                emails = '180.png';
                emailsTitle = 'This alert sends Emails';
            }
            if(results[0].requestSendSMS){
                textMessages = '190.png';
                TextMessagesTitle = 'This alert sends text messages';
            }

            //end of Alert with Lights, Sound, Emails, TextMessage

            let htmlTags = {
                classNames: classNames,
                alertWith911: alertWith911,
                showProcedure: showProcedure,
                showSafe: showSafe,
                showHelp: showHelp,
                pageColSize: pageColSize,
                pageColSize2: pageColSize2,
                notCompletedReceived: 'SMECS APP NOT INSTALLED',
                icons: {
                    lights: lights,
                    lightTitle: lightTitle,
                    sound: sound,
                    soundTitle: soundTitle,
                    emails: emails,
                    emailsTitle: emailsTitle,
                    textMessages: textMessages,
                    TextMessagesTitle: TextMessagesTitle
                }
            };

            let canRequestAssistance = false;
            let arraySituations =[];
            let disableReqButton = true;

            if(results[0].alert.alertID == 14 || results[0].alert.alertID == 26) {
                canReqAssFunc.canRequestAssistanceFunction(req, res, results[0], canRequestAssistance, function (result2) {
                    canRequestAssistance = result2;
                    reqButtons.reportDetails(arraySituations, results[0], disableReqButton, function (result3) {
                        disableReqButton = result3;
                        getRenderJson();
                    });

                });
            }
            else {
                getRenderJson();
            }

            function getRenderJson() {
                reportsEJS.totalNumbers(req, results[0], function (result, err) {
                    if (err) console.log('totalNumbers err - ',err);
                    else {
                        res.render(page, {
                            title: 'REPORTS SENT',
                            userAuthID: req.user.userPrivilegeID,
                            report: results[0],
                            aclSideMenu: results[1][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                            userAuthName: req.user.firstName + ' ' + req.user.lastName,
                            userAuthPhoto: req.user.photo,
                            total: result,
                            canRequestAssistance: canRequestAssistance,
                            arraySituations: arraySituations,
                            disableReqButton: disableReqButton,
                            htmlTags: htmlTags
                        });
                    }
                });
            }
        }
    })
};



module.exports.totalNumbers = function(req, alert, callback) {
    let total = {
        sentToAll: [],
        sentToNoPushToken: [],
        sentToWithPushToken: [],
        sentToAllNumber: Number,
        sentToWithPushTokenNumber: Number,
        sentToNoPushTokenNumber: Number,
        receivedBy: [],
        notReceivedBy: [],
        notReceivedNumber: Number,
        viewedBy: [],
        notViewedBy: [],
        viewedNumber: Number,
        notViewedNumber: Number,
        procedureDoneBy: [],
        notProcedureDoneBy: [],
        procedureDoneNumber: Number,
        notProcedureDoneNumber: Number,
        iNeedHelp: [],
        notWeAreSafe: [],
        weAreSafeNumber: Number,
        notWeAreSafeNumber: Number,
        weAreSafe: [],
        notINeedHelp: [],
        iNeedHelpNumber: Number,
        notINeedHelpNumber: Number,
        completedAllStepsBy: [],
        notCompletedAllStepsBy: [],
        completedAllStepsNumber: Number,
        notCompletedAllStepsNumber: Number,
        called911By: [],
        notCalled911By: [],
        called911Number: Number,
        notCalled911Number: Number,
    };


    //How many users with pushToken, NoPushToken  Alert was sent
    alert.sentTo.forEach(function (user) {
        if(user.pushToken.length > 0)
            total.sentToWithPushToken.push(user);
        else
            total.sentToNoPushToken.push(user);
        total.sentToAll.push(user);
    });
    total.sentToAllNumber = total.sentToAll.length;
    total.sentToWithPushTokenNumber = total.sentToWithPushToken.length;
    total.sentToNoPushTokenNumber = total.sentToNoPushToken.length;
    //end of How many users with pushToken Alert was sent


    //How many users Received Alert
    alert.sentTo.forEach(function (user) {
        if( user.pushToken.length > 0){
            if(user.received.receivedBoolean)
                total.receivedBy.push(user);
            else
                total.notReceivedBy.push(user);
        }
    });
    total.receivedNumber = total.receivedBy.length;
    total.notReceivedNumber = total.sentToWithPushTokenNumber - total.receivedNumber;
    //end of How many users Received Alert

    //How many users Viewed Alert
    if(typeof req.decoded === "undefined" && req.user.userPrivilegeID === 1){
        alert.sentTo.forEach(function (user) {
            if( user.pushToken.length > 0 && user.received.receivedBoolean) {
                if (user.viewed.viewedBoolean) {
                    total.viewedBy.push(user);
                }

                else
                    total.notViewedBy.push(user);
            }
        });
        total.viewedNumber = total.viewedBy.length;
        total.notViewedNumber = total.notViewedBy.length;
    }
    else {
        alert.sentTo.forEach(function (user) {
            if( user.pushToken.length > 0) {
                if (user.viewed.viewedBoolean) {
                    total.viewedBy.push(user);
                }

                else
                    total.notViewedBy.push(user);
            }
        });
        total.viewedNumber = total.viewedBy.length;
        total.notViewedNumber = total.notViewedBy.length;
    }
    //end of How many users Viewed Alert


    //How many users completed Procedure
    alert.sentTo.forEach(function (user) {
        if( user.pushToken.length > 0 && user.received.receivedBoolean && user.viewed.viewedBoolean) {
            if (user.procedureCompleted.boolean){
                total.procedureDoneBy.push(user);
            }
            else{
                total.notProcedureDoneBy.push(user);
            }
        }
    });
    total.procedureDoneNumber = total.procedureDoneBy.length;
    total.notProcedureDoneNumber = total.notProcedureDoneBy.length;
    //end of How many users completed Procedure


    //How many users WeAreSafe
    alert.sentTo.forEach(function (user) {
        if( user.pushToken.length > 0 && user.received.receivedBoolean && user.viewed.viewedBoolean) {
            if (user.weAreSafe.boolean)
                total.weAreSafe.push(user);
            else {
                total.notWeAreSafe.push(user);
            }
        }
    });
    total.weAreSafeNumber = total.weAreSafe.length;
    total.notWeAreSafeNumber = total.notWeAreSafe.length;
    //end of How many users WeAreSafe


    //How many users iNeedHelp
    alert.sentTo.forEach(function (user) {
        if( user.pushToken.length > 0 && user.received.receivedBoolean && user.viewed.viewedBoolean) {
            if(user.iNeedHelp.boolean)
                total.iNeedHelp.push(user);
            else{
                total.notINeedHelp.push(user);
            }
        }
    });
    total.iNeedHelpNumber = total.iNeedHelp.length;
    total.notINeedHelpNumber = total.notINeedHelp.length;
    //console.log('total.iNeedHelpNumber = ',total.iNeedHelpNumber);
    //console.log('total.iNeedHelp = ',total.iNeedHelp);
    //end of How many users iNeedHelp

    //How many users CompleteAllSteps Alert
    alert.sentTo.forEach(function (user) {
        if( user.pushToken.length > 0) {
            if(alert.requestProcedureCompleted && alert.requestWeAreSafe) {
                if (user.received.receivedBoolean && user.viewed.viewedBoolean && user.procedureCompleted.boolean && user.weAreSafe.boolean) {
                    total.completedAllStepsBy.push(user);
                }

                else
                    total.notCompletedAllStepsBy.push(user);

            }
            else {
                if(alert.requestProcedureCompleted && !alert.requestWeAreSafe) {
                    if (user.received.receivedBoolean && user.viewed.viewedBoolean && user.procedureCompleted.boolean) {
                        total.completedAllStepsBy.push(user);
                    }
                    else
                        total.notCompletedAllStepsBy.push(user);
                }
                if(!alert.requestProcedureCompleted && alert.requestWeAreSafe) {
                    if (user.received.receivedBoolean && user.viewed.viewedBoolean && user.weAreSafe.boolean) {
                        total.completedAllStepsBy.push(user);
                    }
                    else
                        total.notCompletedAllStepsBy.push(user);
                }
                if(!alert.requestProcedureCompleted && !alert.requestWeAreSafe) {
                    if (user.received.receivedBoolean && user.viewed.viewedBoolean) {
                        total.completedAllStepsBy.push(user);
                    }
                    else
                        total.notCompletedAllStepsBy.push(user);
                }

            }
        }
    });
    total.completedAllStepsNumber = total.completedAllStepsBy.length;
    total.notCompletedAllStepsNumber = total.notCompletedAllStepsBy.length;
    //end of How many users CompleteAllSteps Alert


    //How many users Called911
    alert.sentTo.forEach(function (user) {
        if( user.pushToken.length > 0 && user.received.receivedBoolean && user.viewed.viewedBoolean) {
            if (user.called911.boolean) {
                total.called911By.push(user);
            }

            else
                total.notCalled911By.push(user);
        }
    });
    total.called911Number = total.called911By.length;
    total.notCalled911Number = total.notCalled911By.length;
    //end of How many users Called911

    callback(total)
};

