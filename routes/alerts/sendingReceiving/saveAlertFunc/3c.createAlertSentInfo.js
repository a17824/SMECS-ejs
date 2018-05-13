//Dependencies
var models = require('./../../../models');
var moment = require('moment');


/**
 * middleware for Express.
 *
 * This middleware will run all functions related to sending alerts
 *
 */

module.exports.alertSentInfo = function(req, res, tempAlert) {
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
        sentBy: sentByApiEjs,
        sentTime: wrapped.format('YYYY-MM-DD, h:mm:ss a'),
        alertGroupID: tempAlert.alertGroupID,
        alertGroupName: tempAlert.alertGroupName,
        alertNameID: tempAlert.alertNameID,
        alertName: tempAlert.alertName,
        sentRoleIDScope: tempAlert.sentRoleIDScope,
        sentRoleNameScope: tempAlert.sentRoleNameScope,
        sentTo: sentTo,
        requestProcedureCompleted: tempAlert.requestProcedureCompleted,
        requestWeAreSafe: tempAlert.requestWeAreSafe,
        request911Call: tempAlert.request911Call,
        whoCanCall911: tempAlert.whoCanCall911,
        note: tempAlert.note,
        testModeON: tempAlert.testModeON,
        floorName: tempAlert.floorName,
        floorPhoto: tempAlert.floorPhoto,
        sniperCoordinateX: tempAlert.sniperCoordinateX,
        sniperCoordinateY: tempAlert.sniperCoordinateY,
        medicalInjuredParties: tempAlert.medicalInjuredParties,
        multiSelectionNames: tempAlert.multiSelectionNames,
        multiSelectionIDs: tempAlert.multiSelectionIDs,
        studentName: tempAlert.studentName,
        studentPhoto: studentPhoto,
        missingChildLastTimeSeen: tempAlert.missingChildLastTimeSeen,
        missingChildLastPlaceSeen: tempAlert.missingChildLastPlaceSeen,
        missingChildClothesWearing: tempAlert.missingChildClothesWearing,
        studentWithGunSeated: tempAlert.studentWithGunSeated,
        studentWithGunBehaviour: tempAlert.studentWithGunBehaviour,
        evacuateWhereTo: tempAlert.evacuateWhereTo,
        requestAssistance: tempAlert.requestAssistance,
        busAccidentNoInjuries : tempAlert.busAccidentNoInjuries,
        busMorningAfternoon: tempAlert.busMorningAfternoon,
        busDelayedAhead: tempAlert.busDelayedAhead,
        busTimeChanged: tempAlert.busTimeChanged,
        busTimeChangedEmail: tempAlert.busTimeChangedEmail,
        sentSmecsAppUsersScope: tempAlert.sentSmecsAppUsersScope,
        latitude: tempAlert.latitude,
        longitude: tempAlert.longitude

    });
    alert1.save();



};


