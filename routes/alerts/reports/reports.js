//Dependencies
var models = require('./../../models');
var async = require("async");
var aclPermissions = require('./../../acl/aclPermissions');
var moment = require('moment');


//* SHOW REPORTS. */
module.exports.reportsAlerts = function(req, res, next) {
    async.parallel([
        function(callback){
            models.AlertSentInfo.find().exec(callback);
        },
        function(callback){aclPermissions.clearReports(req, res, callback);},          //aclPermissions clearReports
        function(callback){aclPermissions.deleteReports(req, res, callback);}       //aclPermissions deleteReports

    ],function(err, results){
        res.render('reports/showReports',{
            title: 'REPORTS SENT',
            reportSent: results[0],
            aclClearReports: results[1],           //aclPermissions clearReports
            aclDeleteReports: results[2]        //aclPermissions deleteReports
        });
    })
};

/* Update STATUS Report. */
module.exports.updateStatus = function(req, res) {
    var statusToChange = req.params.id;
    var wrapped = moment(new Date());
    models.AlertSentInfo.findById({'_id': statusToChange}, function(err, alert){
        if(err){
            console.log('err - changing Alert STATUS');
        }else{

            if(alert.status.statusString == 'open'){
                alert.status.statusString = 'closed';
                alert.status.statusClosedDate = wrapped.format('YYYY-MM-DD');
                alert.status.statusClosedTime = wrapped.format('h:mm:ss a');
            }else {
                alert.status.statusString = 'open';
                alert.status.statusClosedDate = undefined;
                alert.status.statusClosedTime = undefined;
            }
            console.log('success - Alert status changed to ' + alert.status.statusString);
        }
        alert.save();
        res.redirect('/reports/showReports');
    })
};
/* ------------ end of SoftDeleted USERS. */




module.exports.reportsUsers = function(req, res, next) {
    async.parallel([
        function(callback){
            models.ReportsSent.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.ReportsReceived.find().sort({"scope":1}).sort({"to":1}).exec(callback);
        }
    ],function(err, results){
        res.render('reports/showReportsReceived',{
            title:'REPORTS RECEIVED',
            reportSent: results[0],
            reportReceived: results[1]
        });
    })
};


module.exports.reportsDetails = function(req, res, next) {
    models.ReportsSent.findById(req.params.id,function(error, details) {
        console.log(details);
        res.render('reports/showReportsDetails', { title: 'Alert Details', details: details });
    });
};