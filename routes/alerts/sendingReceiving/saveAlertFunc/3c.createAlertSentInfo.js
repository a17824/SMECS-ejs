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
    if (tempAlert.alertNameID == 26 ) { //Request Repair Assistance

        var alert1 = new models.AlertSentInfo({
            _id: tempAlert._id,
            sentBy: req.session.user.firstName + " " + req.session.user.lastName,
            sentTime: wrapped.format('YYYY-MM-DD, h:mm:ss a'),
            alertGroupID: tempAlert.alertGroupID,
            alertGroupName: tempAlert.alertGroupName,
            alertNameID: tempAlert.alertNameID,
            alertName: tempAlert.alertName,
            request911Call: tempAlert.request911Call,

            note: tempAlert.note,
            testModeON: tempAlert.testModeON


        });
    } else {
        var alert1 = new models.AlertSentInfo({
            _id: tempAlert._id,
            sentBy: req.session.user.firstName + " " + req.session.user.lastName,
            sentTime: wrapped.format('YYYY-MM-DD, h:mm:ss a'),
            alertGroupID: tempAlert.alertGroupID,
            alertGroupName: tempAlert.alertGroupName,
            alertNameID: tempAlert.alertNameID,
            alertName: tempAlert.alertName,
            sentRoleIDScope: tempAlert.sentRoleIDScope,
            sentRoleNameScope: tempAlert.sentRoleNameScope,
            sentUsersScope: tempAlert.sentUsersScope,
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
            studentPhoto: tempAlert._id + '_' + tempAlert.studentPhoto,
            missingChildLastTimeSeen: tempAlert.missingChildLastTimeSeen,
            missingChildLastPlaceSeen: tempAlert.missingChildLastPlaceSeen,
            missingChildClothesWearing: tempAlert.missingChildClothesWearing,
            studentWithGunSeated: tempAlert.studentWithGunSeated,
            studentWithGunBehaviour: tempAlert.studentWithGunBehaviour,
            evacuateWhereTo: tempAlert.evacuateWhereTo

        });
    }
    alert1.save();
};


