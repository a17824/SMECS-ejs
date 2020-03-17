//Dependencies
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');

var backup = require('./backupRestore');
var functions = require('../functions');

//MANUAL BACKUP Wait Page
module.exports.inProgressBackup = function(req, res) {
    async.parallel([
        function(callback){aclPermissions.addRoles2(req, res, callback);},   //aclPermissions addRoles2
        function(callback){aclPermissions.modifyRoles2(req, res, callback);}, //aclPermissions modifyRoles2
        function(callback){aclPermissions.deleteRoles2(req, res, callback);}, //aclPermissions deleteRoles2
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        res.render('backupRestore/inProgressBackup',{
            title:'Backup',
            message: 'Please wait. Backup in progress... you will be redirected when backup is finished',
            userAuthID: req.user.userPrivilegeID,
            aclAddRoles2: results[0], //aclPermissions addRoles2
            aclModifyRoles2: results[1],  //aclPermissions modifyRoles2
            aclDeleteRoles2: results[2],  //aclPermissions deleteRoles2
            aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });

    })
};


//MANUAL BACKUP
module.exports.manualBackupPost = function(req, res) {

    var spawn = require('child_process').spawn,
        ls    = spawn('cmd.exe', ["/c", `backup\\SMECS_manual_backup.bat`],{env: process.env});
    backup.backup(ls, 'manualBackup', function (result,err) {   //manual backup
        if(err) console.log('autoBackup err = ',err);
        else {
            let message;
            if(result === 0){
                message = "Backup finished successfully";
                console.log('manual backup successful!');
            }
            else {
                message = "There was a problem with the backup";
                console.log('manual backup FAILED')
            }
            res.send({redirect: '/backupResp/' + message});
        }
    });
};

//MANUAL BACKUP
module.exports.backupResp = function(req, res) {

    async.parallel([
        function(callback){aclPermissions.addRoles2(req, res, callback);},   //aclPermissions addRoles2
        function(callback){aclPermissions.modifyRoles2(req, res, callback);}, //aclPermissions modifyRoles2
        function(callback){aclPermissions.deleteRoles2(req, res, callback);}, //aclPermissions deleteRoles2
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){

        functions.redirectTabUsers(req, res, 'showUsers');
        functions.redirectTabBuildings(req, res, 'showBuilding');

        console.log('req.params.message = ',req.params.message);
        res.render('backupRestore/backup',{
            title:'Backup',
            message: req.params.message,
            userAuthID: req.user.userPrivilegeID,
            aclAddRoles2: results[0], //aclPermissions addRoles2
            aclModifyRoles2: results[1],  //aclPermissions modifyRoles2
            aclDeleteRoles2: results[2],  //aclPermissions deleteRoles2
            aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};



//AUTO & MANUAL BACKUP
module.exports.backup = function(ls, backupType, callback) {
    let code2 = 1;
    ls.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });
    ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });
    ls.on('exit', function (code) {
        code2 = code;
        console.log('child process exited with code ' + code);
        if(backupType === 'manualBackup')
            callback(code2);
        else
            callback('autoBackup');
    });
};
