//Dependencies
var models = require('./../../../models');
var moment = require('moment');


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

    var alert1 = new models.AlertSentInfo({
        _id: tempAlert._id,
        group: {
            groupID: tempAlert.alertGroupID,
            name: tempAlert.alertGroupName,
            sound: tempAlert.groupSound,
            icon: tempAlert.groupIcon,
            color: {
                bgValue: tempAlert.groupColorBk,
                textValue: tempAlert.groupColorTx
            }
        },
        alert: {
            alertID: tempAlert.alertNameID,
            name: tempAlert.alertName,
            icon: tempAlert.alertIcon
        },
        sentBy: sentByApiEjs,
        sentDate: wrapped.format('YYYY-MM-DD'),
        sentTime: wrapped.format('h:mm:ss a'),
        sentRoleIDScope: tempAlert.sentRoleIDScope,
        sentRoleNameScope: tempAlert.sentRoleNameScope,
        sentTo: sentTo,
        requestProcedureCompleted: tempAlert.requestProcedureCompleted,
        requestWeAreSafe: tempAlert.requestWeAreSafe,
        requestINeedHelp: tempAlert.requestINeedHelp,
        request911Call: tempAlert.request911Call,
        whoCanCall911: tempAlert.whoCanCall911,
        note: tempAlert.note,
        testModeON: tempAlert.testModeON,
        floorName: tempAlert.floorName,
        floorPhoto: tempAlert._id + '_' + tempAlert.floorPhoto,
        sniperCoordinateX: tempAlert.sniperCoordinateX,
        sniperCoordinateY: tempAlert.sniperCoordinateY,
        medicalInjuredParties: tempAlert.medicalInjuredParties,
        dayClosed: tempAlert.dayClosed,
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
        sentSmecsAppUsersScope: tempAlert.sentSmecsAppUsersScope,
        latitude: tempAlert.latitude,
        longitude: tempAlert.longitude,
        mapBus: tempAlert.mapBus
    });
    alert1.save();
    callback(alert1)
};



module.exports.update = function(req, res, tempAlert, callback) {
    var wrapped = moment(new Date());

    var sentTo = [];
    tempAlert.sentTo.forEach(function (user) {
        var sentToArr = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
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


    models.AlertSentInfo.findById({'_id': tempAlert._id}, function (err, alert) {
        if (!alert) {
            console.log('SOMETHING WENT WRONG UPDATING AlertSentInfo');
        }
        else {
            alert.sentBy = sentByApiEjs;
            alert.sentRoleIDScope = tempAlert.sentRoleIDScope;
            alert.sentRoleNameScope = tempAlert.sentRoleNameScope;
            //sentTo: sentTo, // needs new var model ex: sentUpdateTo
            alert.note = tempAlert.note;
            alert.floorName = tempAlert.floorName;
            alert.floorPhoto = tempAlert._id + '_' + tempAlert.floorPhoto;
            alert.sniperCoordinateX = tempAlert.sniperCoordinateX;
            alert.sniperCoordinateY = tempAlert.sniperCoordinateY;
            alert.medicalInjuredParties = tempAlert.medicalInjuredParties;
            alert.dayClosed = tempAlert.dayClosed;
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
            alert.sentSmecsAppUsersScope = tempAlert.sentSmecsAppUsersScope;
            alert.latitude = tempAlert.latitude;
            alert.longitude = tempAlert.longitude;
            alert.mapBus = tempAlert.mapBus;
        }
        alert.save();
        callback(alert)
    });
};

