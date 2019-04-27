var models = require('./../models');
var moment = require('moment');
let pushNotification = require('./../alerts/sendingReceiving/pushNotification.js');
let timeDifFunc = require('./reports.js');

/* Send all alerts. -------------------------------*/
module.exports.reportsGet = function (req, res) {
    models.AlertSentInfo.find({'status.statusString': "open"}, function (err, alert) {
        if (err || !alert){
            console.log('no open alerts found. err - ',err);
            res.json({
                success: 'false',
                message: 'Something went wrong'
            })
        }
        else {
            res.json({
                success: 'true',
                alerts: alert,
                openAlerts: alert.length
            });
        }
    });
};

/* Send spevific alert info ------------------------*/
module.exports.alertInfoGet = function (req, res) {
    models.AlertSentInfo.findOne({'_id': req.params.id}, function (err, alert) {
        if (err || !alert){
            console.log('no alerts found. err - ',err);
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
/*
module.exports.openAlertsGet = function (req, res) {
    models.AlertSentInfo.find({'status.statusString': 'open'}, function (err, alerts) {
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
*/
/* Send procedure information -------------------------------*/
module.exports.procedureGet = function (req, res) {
    models.Alerts.findOne({
        'alertID': parseInt(req.params.id)
    }, function (err, alert) {
        if (err || !alert){
            console.log('alert NOT found. err - ',err);
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
        if (err || !alert){
            console.log('no alerts found. err - ',err);
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
    let email;
    if(req.decoded)
        email = req.decoded.user.email;
    else
        email = req.user.email;

    let wrapped = moment(new Date());

    models.AlertSentInfo.findOne({'_id': req.body.alertID},  function (err, alert) {
            if (err || !alert){
                console.log('alertNot found. err - ',err);
                return res.json({success: false, message: 'Failed to locate user.'});
            } else {
                for (var i = 0; i < alert.sentTo.length; i++) {
                    if(alert.sentTo[i].email == email ){
                        alert.sentTo[i].received.receivedBoolean = true;
                        alert.sentTo[i].received.receivedDate = wrapped.format('YYYY-MM-DD');
                        alert.sentTo[i].received.receivedTime = wrapped.format('h:mm:ss a');
                        alert.save();
                        /*****  CALL HERE NOTIFICATION API  *****/
                        pushNotification.refreshAlertInfo(alert, 'refreshAlertInfo');

                        if(req.decoded)
                            //res.json({success: true});

                        break
                    }
                }
            }
        }
    );
};

module.exports.receivedViewedAlert = function (req, alert) { //EJS
    let email;
    if(req.decoded)
        email = req.decoded.user.email;
    else
        email = req.user.email;

    let wrapped = moment(new Date());
    for (var i = 0; i < alert.sentTo.length; i++) {
        if(alert.sentTo[i].email == email && alert.sentTo[i].viewed.viewedBoolean == false ){
            if(alert.sentTo[i].received.receivedBoolean == false ){
                alert.sentTo[i].received.receivedBoolean = true;
                alert.sentTo[i].received.receivedDate = wrapped.format('YYYY-MM-DD');
                alert.sentTo[i].received.receivedTime = wrapped.format('h:mm:ss a');

                //time user took to receive alert
                timeDifFunc.timeDif(alert.sentDate, alert.sentTime, alert.sentTo[i].received.receivedDate, alert.sentTo[i].received.receivedTime,function (result,err) {
                    if(err || !result) console.log('timeDif err = ',err);
                    else {
                        alert.sentTo[i].received.timeDif = result;
                    }
                });
            }
            alert.sentTo[i].viewed.viewedBoolean = true;
            alert.sentTo[i].viewed.viewedDate = wrapped.format('YYYY-MM-DD');
            alert.sentTo[i].viewed.viewedTime = wrapped.format('h:mm:ss a');

            //time user took to view alert after receiving alert
            timeDifFunc.timeDif(alert.sentTo[i].received.receivedDate, alert.sentTo[i].received.receivedTime, alert.sentTo[i].viewed.viewedDate, alert.sentTo[i].viewed.viewedTime,function (result,err) {
                if(err || !result) console.log('timeDif err = ',err);
                else {
                    alert.sentTo[i].viewed.timeDif = result;
                    console.log('alert.sentTo[i].received.timeDif = ',alert.sentTo[i].received.timeDif);
                    alert.save();
                    /*****  CALL HERE NOTIFICATION API  *****/
                    pushNotification.refreshAlertInfo(alert, 'refreshAlertInfo');
                }
            });
            break
        }
    }

};
/* end of Receive the viewed for message delivered -------------------------------*/


/* Receive the called 911 for message delivered -------------------------------*/
module.exports.alertCalled911 = function (req, res) {
    var email = req.decoded.email;
    var alertID = req.body.alertID;
    var wrapped = moment(new Date());

    models.AlertSentInfo.findOne({'_id': alertID},  function (err, alert) {
            if (err || !alert){
                console.log('alert not found. err - ',err);
                return res.json({success: false, message: 'Failed to locate user.'});
            } else {
                for (var i = 0; i < alert.sentTo.length; i++) {
                    if(alert.sentTo[i].email == email && alert.sentTo[i].called911.called911Boolean == false ){
                        alert.sentTo[i].called911.called911Boolean = true;
                        alert.sentTo[i].called911.called911Date = wrapped.format('YYYY-MM-DD');
                        alert.sentTo[i].called911.called911Time = wrapped.format('h:mm:ss a');

                        //time user took to call911 after viewing alert
                        timeDifFunc.timeDif(alert.sentTo[i].viewed.viewedDate, alert.sentTo[i].viewed.viewedTime, alert.sentTo[i].called911.called911Date, alert.sentTo[i].called911.called911Time,function (result,err) {
                            if(err || !result) console.log('timeDif err = ',err);
                            else {
                                alert.sentTo[i].called911.timeDif = result;
                                alert.save();
                                /*****  CALL HERE NOTIFICATION API  *****/
                                pushNotification.refreshAlertInfo(alert, 'refreshAlertInfo');
                            }
                        });

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

module.exports.timeDif = function (startDate, startTime, endDate, endTime, callback) {
    let dateStart = moment.utc(startDate, "YYYY-MM-DD");
    let dateEnd = moment.utc(endDate, "YYYY-MM-DD");
    let dateDif = moment.duration(dateEnd.diff(dateStart));

    let timeStart = moment.utc(startTime, "HH:mm:ss a");
    let timeEnd = moment.utc(endTime, "HH:mm:ss a");
    let timeDif = moment.duration(timeEnd.diff(timeStart));

    let final = '';

    if(dateDif._data.years == 0){
        if(dateDif._data.months == 0){
            if(dateDif._data.days == 0){
                if(timeDif._data.hours == 0){
                    if(timeDif._data.minutes == 0){
                        final = '+' + timeDif._data.seconds + ' sec';
                    }else {
                        final = '+' + timeDif._data.minutes + ' min';
                    }
                }else {
                    final = '+' + timeDif._data.hours + ' hours';
                }
            }else {
                final = '+' + dateDif._data.days + ' days';
            }
        }else {
            final = '+' + dateDif._data.months + ' months';
        }
    }else {
        final = '+' + dateDif._data.years + ' years';
    }
    //console.log('timeDif = ',final);
    callback(final);
};