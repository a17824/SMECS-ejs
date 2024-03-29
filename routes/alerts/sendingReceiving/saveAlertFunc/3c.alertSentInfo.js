//Dependencies
var models = require('./../../../models');
var moment = require('moment');
let pushNotification = require('./../pushNotification.js');

/**
 * middleware for Express.
 *
 * This middleware will run all functions related to sending alerts
 *
 */

module.exports.create = function(req, res, tempAlert, callback) {
    var wrapped = moment(new Date());

    var sentTo = [];
    tempAlert.sentTo.forEach(function (user) {
        var sentToArr = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            photo: user.photo,
            pushToken: user.pushToken
        };
        sentTo.push(sentToArr);
    });
    let studentPhoto = undefined;
    if (tempAlert.alertWith.student) {
        studentPhoto = tempAlert._id + '_' + tempAlert.studentPhoto;
    }

    let sentByApiEjs;
    if (req.decoded)        // API user
        sentByApiEjs = req.decoded.user.firstName + " " + req.decoded.user.lastName;
    else
        sentByApiEjs = req.session.user.firstName + " " + req.session.user.lastName;



    let alert1 = new models.AlertSentInfo({
        _id: tempAlert._id,
        group: {
            groupID: tempAlert.alertGroupID,
            name: tempAlert.alertGroupName,
            sound: tempAlert.groupSound,
            soundChannel: tempAlert.groupSoundChannel,
            icon: tempAlert.groupIcon,
            color: {
                name: tempAlert.groupColorName,
                bgValue: tempAlert.groupColorBk,
                textValue: tempAlert.groupColorTx
            },
            light: tempAlert.groupLight
        },
        alert: {
            alertID: tempAlert.alertNameID,
            name: tempAlert.alertName,
            icon: tempAlert.alertIcon,
            light: tempAlert.light,
            lightSound: tempAlert.lightSound,

        },
        sentBy: sentByApiEjs,
        sentDate: wrapped.format('YYYY-MM-DD'),
        sentTime: wrapped.format('h:mm:ss a'),
        sentRoleIDScope: tempAlert.sentRoleIDScope,
        sentRoleNameScope: tempAlert.sentRoleNameScope,
        sentTo: sentTo,
        requestSendEmail: tempAlert.requestSendEmail,
        requestSendSMS: tempAlert.requestSendSMS,
        requestProcedureCompleted: tempAlert.requestProcedureCompleted,
        requestWeAreSafe: tempAlert.requestWeAreSafe,
        requestINeedHelp: tempAlert.requestINeedHelp,
        request911Call: tempAlert.request911Call,
        whoCanCall911: tempAlert.whoCanCall911,
        note: tempAlert.note,
        materialSpill: tempAlert.materialSpill,
        realDrillDemo: tempAlert.realDrillDemo,
        buildingID: tempAlert.buildingID,
        buildingName: tempAlert.buildingName,
        floorID: tempAlert.floorID,
        floorName: tempAlert.floorName,
        floorPhoto: tempAlert._id + '_' + tempAlert.floorPhoto,
        sniperCoordinateX: tempAlert.sniperCoordinateX,
        sniperCoordinateY: tempAlert.sniperCoordinateY,
        medicalInjuredParties: tempAlert.medicalInjuredParties,
        daysClosed: tempAlert.daysClosed,
        multiSelectionNames: tempAlert.multiSelectionNames,
        multiSelectionIDs: tempAlert.multiSelectionIDs,
        studentName: tempAlert.studentName,
        studentPhoto: studentPhoto,
        missingChildLastTimeSeen: tempAlert.missingChildLastTimeSeen,
        missingChildLastPlaceSeen: tempAlert.missingChildLastPlaceSeen,
        missingChildClothesWearing: tempAlert.missingChildClothesWearing,
        studentWithGunSeated: tempAlert.studentWithGunSeated,
        studentWithGunBehaviour: tempAlert.studentWithGunBehaviour,
        requestAssistance: tempAlert.requestAssistance,
        busAccidentNoInjuries : tempAlert.busAccidentNoInjuries,
        busMorningAfternoon: tempAlert.busMorningAfternoon,
        busDelayedAhead: tempAlert.busDelayedAhead,
        busTimeChanged: tempAlert.busTimeChanged,
        busTimeChangedEmail: tempAlert.busTimeChangedEmail,
        earlyDismissalDate: tempAlert.earlyDismissalDate,
        earlyDismissalTime: tempAlert.earlyDismissalTime,
        sentSmecsAppUsersScope: tempAlert.sentSmecsAppUsersScope,
        latitude: tempAlert.latitude,
        longitude: tempAlert.longitude,
        mapBus: tempAlert.mapBus,
        alertRoad: tempAlert.alertRoad,
        alertWith: tempAlert.alertWith
    });
    alert1.save();
    callback(alert1)
};



module.exports.update = function(req, res, tempAlert, callback) {

    models.AlertSentInfo.findById(tempAlert._id, function (err, alert) {
        if (!alert || err) {
            console.log('SOMETHING WENT WRONG UPDATING AlertSentInfo OR DEMO MODE WAS SELECTED TO SEND ALERT');
            //return res.send({redirect:'/alerts/sending/chooseGroup'})
            res.redirect('/alerts/sending/chooseGroup');
        }
        else {
            var wrapped = moment(new Date());
            var sentTo = [];
            tempAlert.sentTo.forEach(function (user) {
                var sentToArr = {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    photo: user.photo,
                    pushToken: user.pushToken
                };
                sentTo.push(sentToArr);
            });
            var studentPhoto = undefined;
            if (tempAlert.alertNameID == 4 ||
                tempAlert.alertNameID == 5 ||
                tempAlert.alertNameID == 16 ||
                tempAlert.alertNameID == 17 ||
                tempAlert.alertNameID == 19) {

                studentPhoto = tempAlert._id + '_' + tempAlert.studentPhoto;
            }

            var sentByApiEjs;
            if (req.decoded)        // API user
                sentByApiEjs = req.decoded.user.firstName + " " + req.decoded.user.lastName;
            else
                sentByApiEjs = req.session.user.firstName + " " + req.session.user.lastName;



            alert.sentBy = sentByApiEjs;
            alert.sentRoleIDScope = tempAlert.sentRoleIDScope;
            alert.sentRoleNameScope = tempAlert.sentRoleNameScope;
            //sentTo: sentTo, // needs new var model ex: sentUpdateTo

            // NOTES CHAT \\
            var htmlName = '<div class="lineSpaceP"><strong><span style="color:#800000">';
            if (typeof newNote == 'undefined' || newNote == '')
                newNote = '(skipped note)';

            if (req.decoded)        // API user
                if(alert.note)
                    alert.note += '<br><br class="lineSpaceBR">' + htmlName + req.decoded.user.firstName + ' ' + req.decoded.user.lastName + ' ' +  htmlTime + wrapped.format('h:mm:ss a') + htmlNote + newNote;
                else{
                    alert.note = tempAlert.note;
                }
            else {

                if(alert.note)
                    alert.note += '<br><br class="lineSpaceBR">' + tempAlert.note;
                else
                    alert.note = tempAlert.note;
            }
            // end of NOTES CHAT
            alert.materialSpill = tempAlert.materialSpill;
            alert.buildingID = tempAlert.buildingID;
            alert.buildingName = tempAlert.buildingName;
            alert.floorID = tempAlert.floorID;
            alert.floorName = tempAlert.floorName;
            alert.floorPhoto = tempAlert._id + '_' + tempAlert.floorPhoto;
            alert.sniperCoordinateX = tempAlert.sniperCoordinateX;
            alert.sniperCoordinateY = tempAlert.sniperCoordinateY;
            alert.medicalInjuredParties = tempAlert.medicalInjuredParties;
            alert.daysClosed = tempAlert.daysClosed;
            alert.multiSelectionNames = tempAlert.multiSelectionNames;
            alert.multiSelectionIDs = tempAlert.multiSelectionIDs;
            alert.studentName = tempAlert.studentName;
            alert.studentPhoto = studentPhoto;
            alert.missingChildLastTimeSeen = tempAlert.missingChildLastTimeSeen;
            alert.missingChildLastPlaceSeen = tempAlert.missingChildLastPlaceSeen;
            alert.missingChildClothesWearing = tempAlert.missingChildClothesWearing;
            alert.studentWithGunSeated = tempAlert.studentWithGunSeated;
            alert.studentWithGunBehaviour = tempAlert.studentWithGunBehaviour;
            alert.requestAssistance = tempAlert.requestAssistance;
            alert.busAccidentNoInjuries = tempAlert.busAccidentNoInjuries;
            alert.busMorningAfternoon = tempAlert.busMorningAfternoon;
            alert.busDelayedAhead = tempAlert.busDelayedAhead;
            alert.busTimeChanged = tempAlert.busTimeChanged;
            alert.busTimeChangedEmail = tempAlert.busTimeChangedEmail;
            alert.earlyDismissalDate = tempAlert.earlyDismissalDate;
            alert.earlyDismissalTime = tempAlert.earlyDismissalTime;
            alert.sentSmecsAppUsersScope = tempAlert.sentSmecsAppUsersScope;
            alert.latitude = tempAlert.latitude;
            alert.longitude = tempAlert.longitude;
            alert.mapBus = tempAlert.mapBus;
            alert.alertWith = tempAlert.alertWith
        }
        alert.save();
        callback(alert)
    });
};


