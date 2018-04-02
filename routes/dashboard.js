//Dependencies
var models = require('./models');
var async = require("async");
var functions = require('./functions');



/* SHOW DASHBOARD. */
module.exports.show = function(req, res, next) {
        async.parallel([
            function(callback){
                models.UtilityUsers.find().exec(callback);
            },
            function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

        ],function(err, results){
            res.render('dashboard',{
                userAuthEmail: req.user.email,
                utilityUsers: results[0],
                aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo,
            });
        })
};
