//Dependencies
var models = require('./../../models');
var async = require("async");
var aclPermissions = require('./../../acl/aclPermissions');



//* SHOW REPORTS. */
module.exports.reportsAlerts = function(req, res, next) {
    async.parallel([
        function(callback){
            models.ReportsSent.find().exec(callback);
        },
        function(callback){aclPermissions.clearReports(req, res, callback);},          //aclPermissions clearReports
        function(callback){aclPermissions.deleteReports(req, res, callback);}       //aclPermissions deleteReports

    ],function(err, results){
        //console.log(results[2]);
        res.render('reports/showReports',{
            title: 'REPORTS SENT',
            reportSent: results[0],
            aclClearReports: results[1],           //aclPermissions clearReports
            aclDeleteReports: results[2]        //aclPermissions deleteReports
        });
    })
};


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