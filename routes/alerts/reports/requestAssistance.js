//Dependencies
var models = require('./../../models');
var async = require("async");
var aclPermissions = require('./../../acl/aclPermissions');



//* SHOW REPORTS. */
module.exports.show = function(req, res, next) {
    async.parallel([
        function(callback){
            models.RequestAssistance.find().exec(callback);
        }

    ],function(err, results){
        //console.log(results[2]);
        res.render('reports/requestAssistance',{
            title: 'Requested Assistance',
            requestAssistance: results[0],
            userAuth: req.user

        });
    })
};