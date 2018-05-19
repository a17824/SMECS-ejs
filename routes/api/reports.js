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
    var wrapped = moment(new Date());

    models.AlertSentInfo.findOne({'_id': alertID},  function (err, alert) {
            if (err) {
                return res.json({success: false, message: 'Failed to locate user.'});
            } else {
                for (var i = 0; i < alert.sentTo.length; i++) {
                    if(alert.sentTo[i].email == email ){
                        alert.sentTo[i].received.receivedBoolean = true;
                        alert.sentTo[i].received.receivedDate = wrapped.format('YYYY-MM-DD');
                        alert.sentTo[i].received.receivedTime = wrapped.format('h:mm:ss a');
                        alert.save();
                        res.json({
                            success: true
                        });
                        break
                    }
                }
            }
        }
    );
};

/* Receive the viewed for message delivered -------------------------------*/
module.exports.alertViewedPost = function (req, res) {
    var wrapped = moment(new Date());
    var email = req.decoded.user.email;
    var alertID = req.body.alertID;

    models.AlertSentInfo.findOne({'_id': alertID},  function (err, alert) {
            if (err) {
                return res.json({success: false, message: 'Failed to locate user.'});
            } else {
                for (var i = 0; i < alert.sentTo.length; i++) {

                    if(alert.sentTo[i].email == email && alert.sentTo[i].viewed.viewedBoolean == false ){
                        alert.sentTo[i].viewed.viewedBoolean = true;
                        alert.sentTo[i].viewed.viewedDate = wrapped.format('YYYY-MM-DD');
                        alert.sentTo[i].viewed.viewedTime = wrapped.format('h:mm:ss a');
                        alert.save();
                        res.json({
                            success: true
                        });
                        break
                    }
                }
            }
        }
    );
};

/* Receive the called 911 for message delivered -------------------------------*/
module.exports.alertCalled911 = function (req, res) {
    var email = req.decoded.email;
    var alertID = req.body.alertID;
    var wrapped = moment(new Date());

    models.AlertSentInfo.findOne({'_id': alertID},  function (err, alert) {
            if (err) {
                return res.json({success: false, message: 'Failed to locate user.'});
            } else {
                for (var i = 0; i < alert.sentTo.length; i++) {
                    if(alert.sentTo[i].email == email && alert.sentTo[i].called911.called911Boolean == false ){
                        alert.sentTo[i].called911.called911Boolean = true;
                        alert.sentTo[i].called911.called911Date = wrapped.format('YYYY-MM-DD');
                        alert.sentTo[i].called911.called911Time = wrapped.format('h:mm:ss a');
                        alert.save();
                        res.json({
                            success: true
                        });
                        break
                    }
                }
            }
        }
    );
};

/* Receive the procedure completed for message delivered -------------------------------*/
module.exports.alertProcedureCompleted = function (req, res) {
    var email = req.decoded.user.email;
    var alertID = req.body.alertID;
    var wrapped = moment(new Date());

    models.AlertSentInfo.findOne({'_id': alertID},  function (err, alert) {
            if (err) {
                return res.json({success: false, message: 'Failed to locate user.'});
            } else {
                for (var i = 0; i < alert.sentTo.length; i++) {
                    if(alert.sentTo[i].email == email && alert.sentTo[i].procedureCompleted.boolean == false ){
                        alert.sentTo[i].procedureCompleted.boolean = true;
                        alert.sentTo[i].procedureCompleted.date = wrapped.format('YYYY-MM-DD');
                        alert.sentTo[i].procedureCompleted.time = wrapped.format('h:mm:ss a');
                        alert.save();
                        res.json({
                            success: true
                        });
                        break
                    }
                }
            }
        }
    );
};

/* Receive the procedure completed for message delivered -------------------------------*/
module.exports.alertWeAreSafe = function (req, res) {
    var email = req.decoded.user.email;
    var alertID = req.body.alertID;
    var wrapped = moment(new Date());

    models.AlertSentInfo.findOne({'_id': alertID},  function (err, alert) {
            if (err) {
                return res.json({success: false, message: 'Failed to locate user.'});
            } else {
                for (var i = 0; i < alert.sentTo.length; i++) {
                    if(alert.sentTo[i].email == email && alert.sentTo[i].weAreSafe.boolean == false ){
                        alert.sentTo[i].weAreSafe.boolean = true;
                        alert.sentTo[i].weAreSafe.date = wrapped.format('YYYY-MM-DD');
                        alert.sentTo[i].weAreSafe.time = wrapped.format('h:mm:ss a');
                        alert.save();
                        res.json({
                            success: true
                        });
                        break
                    }
                }
            }
        }
    );
};