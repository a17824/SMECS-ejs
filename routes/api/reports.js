var models = require('./../models');
var jwt = require('jsonwebtoken');
var moment = require('moment');

/* Send all alerts. -------------------------------*/
module.exports.reportsGet = function (req, res) {
    models.AlertSentInfo.find({}, function (err, alert) {
        res.json({
            success: 'true',
            alerts: alert
        });
    });
};

/* Send spevific alert info ------------------------*/
module.exports.alertInfoGet = function (req, res) {
    models.AlertSentInfo.findOne({
        '_id': req.params.id
    }, function (err, alert) {
        if (err) {
            res.json({
                success: 'false',
                message: 'Something went wrong'
            });
        } else {
            res.json({
                success: 'true',
                alertInfo: alert
            });
        }

    });
};

/* Send number of opened alerts. -------------------------------*/
module.exports.openAlertsGet = function (req, res) {
    models.AlertSentInfo.find({
        'status.statusString': 'open'
    }, function (err, alerts) {
        if (err) {
            res.json({
                success: 'false',
                message: 'Something went wrong'
            });
        } else {
            res.json({
                success: 'true',
                openAlerts: alerts.length
            });
        }
    });
};

/* Send procedure information -------------------------------*/
module.exports.procedureGet = function (req, res) {
    models.Alerts.findOne({
        'alertID': parseInt(req.params.id)
    }, function (err, alert) {
        if (err) {
            res.json({
                success: 'false',
                message: 'Something went wrong'
            });
        } else {
            res.json({
                success: 'true',
                procedure: alert.alertProcedure
            });
        }
    });
};

/* Send procedure information -------------------------------*/
module.exports.proceduresGet = function (req, res) {
    models.Alerts.find({}, function (err, alerts) {
        if (err) {
            res.json({
                success: 'false',
                message: 'Something went wrong'
            });
        } else {
            res.json({
                success: 'true',
                procedure: alerts
            });
        }
    });
};

/* Receive the receipt for message delivered -------------------------------*/
module.exports.alertReceiptPost = function (req, res) {
    var email = req.decoded.user.email;
    var alertID = req.body.alertID;
    console.log(email);
    var wrapped = moment(new Date());
    models.AlertSentInfo.findOneAndUpdate({
        '_id': alertID,
        'sentTo.email': email
    }, {
        $set: {
            'sentTo.$.received.receivedBoolean': true,
            'sentTo.$.received.receivedDate': wrapped.format('YYYY-MM-DD'),
            'sentTo.$.received.receivedTime': wrapped.format('h:mm:ss a')
        }
    }, {
        new: true
    }, function (err, alert) {
        if (err) {
            return res.json({
                success: false,
                message: 'Failed to locate user.'
            });
        } else {
            return res.json({
                success: true
            });
        }
    });
};

/* Receive the viewed for message delivered -------------------------------*/
module.exports.alertViewedPost = function (req, res) {
    var email = req.decoded.user.email;
    var alertID = req.body.alertID;
    console.log('alertID = ', alertID);

    var wrapped = moment(new Date());
    models.AlertSentInfo.findOneAndUpdate({
        '_id': alertID,
        'sentTo.email': email,
        //'sentTo.viewed.viewedBoolean': false //<-- here is my issue. It's not finding this.
    }, {
        $set: {
            'sentTo.$.viewed.viewedBoolean': true,
            'sentTo.$.viewed.viewedDate': wrapped.format('YYYY-MM-DD'),
            'sentTo.$.viewed.viewedTime': wrapped.format('h:mm:ss a')
        }
    }, {
        new: true
    }, function (err, alert) {
        if (err) {
            return res.json({
                success: false,
                message: 'Failed to locate user.'
            });
        } else {
            return res.json({
                success: true
            });
        }
    });
};

/* Receive the called 911 for message delivered -------------------------------*/
module.exports.alertCalled911 = function (req, res) {
    var email = req.decoded.email;
    var alertID = req.body.alertID;

    var wrapped = moment(new Date());
    models.AlertSentInfo.findOneAndUpdate({
        '_id': alertID,
        'sentTo.email': email,
        //'sentTo.called911.called911Boolean': false
    }, {
        $set: {
            'sentTo.$.called911.called911Boolean': true,
            'sentTo.$.called911.called911Date': wrapped.format('YYYY-MM-DD'),
            'sentTo.$.called911.called911Time': wrapped.format('h:mm:ss a')
        }
    }, {
        new: true
    }, function (err, alert) {
        if (err) {
            return res.json({
                success: false,
                message: 'Failed to locate user.'
            });
        } else {
            return res.json({
                success: true
            });
        }
    });
};

/* Receive the procedure completed for message delivered -------------------------------*/
module.exports.alertProcedureCompleted = function (req, res) {
    var email = req.decoded.user.email;
    var alertID = req.body.alertID;

    var wrapped = moment(new Date());
    models.AlertSentInfo.findOneAndUpdate({
        '_id': alertID,
        'sentTo.email': email,
        //'sentTo.procedureCompleted.boolean': false
    }, {
        $set: {
            'sentTo.$.procedureCompleted.boolean': true,
            'sentTo.$.procedureCompleted.date': wrapped.format('YYYY-MM-DD'),
            'sentTo.$.procedureCompleted.time': wrapped.format('h:mm:ss a')
        }
    }, {
        new: true
    }, function (err, alert) {
        if (err) {
            return res.json({
                success: false,
                message: 'Failed to locate user.'
            });
        } else {
            return res.json({
                success: true
            });
        }
    });
};

/* Receive the procedure completed for message delivered -------------------------------*/
module.exports.alertWeAreSafe = function (req, res) {
    var email = req.decoded.user.email;
    var alertID = req.body.alertID;

    var wrapped = moment(new Date());
    models.AlertSentInfo.findOneAndUpdate({
        '_id': alertID,
        'sentTo.email': email,
        //'sentTo.weAreSafe.boolean': false
    }, {
        $set: {
            'sentTo.$.weAreSafe.boolean': true,
            'sentTo.$.weAreSafe.date': wrapped.format('YYYY-MM-DD'),
            'sentTo.$.weAreSafe.time': wrapped.format('h:mm:ss a')
        }
    }, {
        new: true
    }, function (err, alert) {
        if (err) {
            return res.json({
                success: false,
                message: 'Failed to locate user.'
            });
        } else {
            return res.json({
                success: true
            });
        }
    });
};