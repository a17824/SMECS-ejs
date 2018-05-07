var models = require('./../models');
var jwt = require('jsonwebtoken');
var config = require('./config');
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
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var email;
    var alertID = req.body.alertID;
    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) {
            return res.json({
                success: false,
                message: 'Failed to authenticate token.'
            });
        } else {
            email = decoded.user.email;
        }
    });
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
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var email;
    var alertID = req.body.alertID;
    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) {
            return res.json({
                success: false,
                message: 'Failed to authenticate token.'
            });
        } else {
            email = decoded.user.email;
        }
    });
    var wrapped = moment(new Date());
    models.AlertSentInfo.findOneAndUpdate({
        '_id': alertID,
        'sentTo.email': email
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