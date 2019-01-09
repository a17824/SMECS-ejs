//Dependencies
var models = require('../models');
var async = require("async");
var functions = require('../functions');
var MobileDetect = require('mobile-detect');


/* SHOW Global Statistics. */
 module.exports.globalStats = function(req, res, next) {
        async.parallel([
            function(callback){
                models.UtilityUsers.find().exec(callback);
            },
            function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

        ],function(err, results){
            functions.redirectTabUsers(req, res, 'showUsers');
            functions.redirectTabBuildings(req, res, 'showBuilding');

            var iPad = false;
            var md = new MobileDetect(req.headers['user-agent']);
            if(md.is('iPad') == true)
                iPad = true;

            res.render('statistics/globalStats',{
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
        functions.redirectTabUsers(req, res, 'showUsers');
        functions.redirectTabBuildings(req, res, 'showBuilding');

        var iPad = false;
        var md = new MobileDetect(req.headers['user-agent']);
        if(md.is('iPad') == true)
            iPad = true;

        res.render('statistics/userStats',{
            userAuthEmail: req.user.email,
            users: results[0],
            iPad: iPad,
            aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};