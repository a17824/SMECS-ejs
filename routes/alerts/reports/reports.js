//Dependencies
var models = require('./../../models');
var async = require("async");
var aclPermissions = require('./../../acl/aclPermissions');



//* SHOW REPORTS. */
module.exports.show = function(req, res, next) {
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