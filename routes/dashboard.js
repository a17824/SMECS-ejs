//Dependencies
var models = require('./models');
var async = require("async");
var functions = require('./functions');
var MobileDetect = require('mobile-detect');


/* SHOW DASHBOARD. */
 module.exports.show = function(req, res, next) {
        async.parallel([
            function(callback){
                models.UtilityUsers.find().exec(callback);
            },
            function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

        ],function(err, results){

            var iPad = false;
            var md = new MobileDetect(req.headers['user-agent']);
            if(md.is('iPad') == true)
                iPad = true;

            res.render('dashboard',{
                userAuthEmail: req.user.email,
                utilityUsers: results[0],
                iPad: iPad,
                aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
};


/* SHOW User Statistics. */
module.exports.userStats = function(req, res, next) {
    async.parallel([
        function(callback){
            models.Users.find().exec(callback);
        },
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){

        var iPad = false;
        var md = new MobileDetect(req.headers['user-agent']);
        if(md.is('iPad') == true)
            iPad = true;

        res.render('reports/userStats',{
            userAuthEmail: req.user.email,
            users: results[0],
            iPad: iPad,
            aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};