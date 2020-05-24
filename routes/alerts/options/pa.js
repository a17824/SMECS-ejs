//Dependencies
var async = require("async");
var fs   = require('fs-extra');
var path = require('path');
var models = require('./../../models');
var aclPermissions = require('./../../acl/aclPermissions');
var functions = require('../../functions');

/* SHOW Active RECEPTION USERS. */
module.exports.showReceptionUsers = function(req, res) {
    async.parallel([
        function(callback){
            models.Users.find().sort({"receptionPA":-1}).sort({"userRoleName":1}).sort({"firstName":1}).exec(callback);
        },
        function(callback){aclPermissions.modifyPAUser(req, res, callback);},        //aclPermissions modifyPAUser
        function(callback){aclPermissions.showPAPreRecorded(req, res, callback);},        //aclPermissions showPAPreRecorded
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTabUsers(req, res, 'showUsers');
        res.render('pa/showPaReceptionUsers',{
            title:'PA SYSTEM',
            users: results[0],
            aclModifyPAUser: results[1],  //aclPermissions modifyPAUser
            aclShowPAPreRecorded: results[2],  //aclPermissions showPAPreRecorded
            aclSideMenu: results[3][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};

//saving Reception checkBox value to Users database------------------------
module.exports.saveReceptionUsersPost = function(req, res) {
    var usersChecked = req.body.searchUsersChecked;
    var usersNotChecked = req.body.searchUsersNotChecked;

    if (usersChecked != null ){
        for (var i=0; i<usersChecked.length; i++) {
            models.Users.findOne({"email": {"$in": usersChecked[i]}}).exec(function (err, check) {
                check.receptionPA = true;
                check.save();
            });
        }
    }
    if (usersNotChecked != null){
        for (var i=0; i<usersNotChecked.length; i++) {
            models.Users.findOne({"email": {"$in": usersNotChecked[i]}}).exec(function (err, check) {
                check.receptionPA = false;
                check.save();
            });
        }
    }
};


/* SHOW Recorded Announcements. */
module.exports.showRecorded = function(req, res) {
    async.parallel([
        function(callback){
            models.PA_Recorded.find().sort({"active":-1}).sort({"titleName":1}).exec(callback);
        },
        function(callback){aclPermissions.showPAUsers(req, res, callback);},             //aclPermissions showPAUsers
        function(callback){aclPermissions.addPAPreRecorded(req, res, callback);},        //aclPermissions addPAPreRecorded
        function(callback){aclPermissions.modifyPAPreRecorded(req, res, callback);},     //aclPermissions modifyPAPreRecorded
        function(callback){aclPermissions.deletePAPreRecorded(req, res, callback);},     //aclPermissions deletePAPreRecorded
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTabUsers(req, res, 'showUsers');
        res.render('pa/showPaRecorded',{
            title:'PA SYSTEM',
            userAuthID: req.user.userPrivilegeID,
            recorded: results[0],
            showPAUsers: results[1],                //aclPermissions showPAUsers
            aclAddPAPreRecorded: results[2],        //aclPermissions addPAPreRecorded
            aclModifyPAPreRecorded: results[3],     //aclPermissions modifyPAPreRecorded
            aclDeletePAPreRecorded: results[4],      //aclPermissions deletePAPreRecorded
            aclSideMenu: results[5][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};

//saving Active checkBox value to Users database------------------------
module.exports.saveRecordedPost = function(req, res) {
    var activeChecked = req.body.searchActiveChecked;
    var activeNotChecked = req.body.searchActiveNotChecked;

    if (activeChecked != null ){
        for (var i=0; i<activeChecked.length; i++) {
            models.PA_Recorded.findOne({"email": {"$in": activeChecked[i]}}).exec(function (err, check) {
                check.active = true;
                check.save();
            });
        }
    }
    if (activeNotChecked != null){
        for (var i=0; i<activeNotChecked.length; i++) {
            models.PA_Recorded.findOne({"email": {"$in": activeNotChecked[i]}}).exec(function (err, check) {
                check.active = false;
                check.save();
            });
        }
    }
};


/* ADD ANNOUNCEMENT. ---------------------------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.Roles2.find().sort({"roleID":1}).exec(callback);
        },
        function(callback){
            models.Floors.find().sort({"privilegeID":1}).exec(callback);
        },
        function(callback){
            models.Room.find().sort({"privilegeID":1}).exec(callback);
        },
        function(callback){aclPermissions.addPAPreRecorded(req, res, callback);},        //aclPermissions addPAPreRecorded
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        //console.log(results[2]);
        res.render('pa/addAnnouncement',{
            title:'Add New Announcement',
            userAuthID: req.user.userPrivilegeID,
            roles: results[0],
            floors: results[1],
            rooms: results[2],
            aclAddPAPreRecorded: results[3],        //aclPermissions addPAPreRecorded
            aclSideMenu: results[4][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};

module.exports.addPost = function(req, res) {

    var user1 = new models.PA_Recorded({
        titleName: req.body.titleName,
        tileMp3: req.body.tileMp3,
        schedule: req.body.schedule,
        days: req.body.days,
        time: req.body.time,
        destination: req.body.destination,
        whoCanSend: req.body.whoCanSend

    });
    user1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            console.log("err - ",err);
            return res.status(409).send('showAlert')
        }else{
            return res.send({redirect:'/pa/showPaRecorded'})
        }
    });
};
/*-------------------------------------------end of adding announcement*/