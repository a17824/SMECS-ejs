//Dependencies
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var backup = require('./backupRestore');
var functions = require('../functions');
var clean = require('../backupRestore/cleanOldFiles');
var models = require('../models');

//MANUAL BACKUP Wait Page
module.exports.inProgressBackup = function(req, res) {
    async.parallel([
        function(callback){aclPermissions.addRoles2(req, res, callback);},   //aclPermissions addRoles2
        function(callback){aclPermissions.modifyRoles2(req, res, callback);}, //aclPermissions modifyRoles2
        function(callback){aclPermissions.deleteRoles2(req, res, callback);}, //aclPermissions deleteRoles2
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        let type = req.params.type; //type can be 'backup' or '[directory name to restore]'
        let message = 'Please wait. Restore in progress... you will be redirected when restore is finished';
        if(type === 'backup'){
            type = 'backup';
            message = 'Please wait. Backup in progress... you will be redirected when backup is finished';
        }

        res.render('backupRestore/inProgressBackup',{
            title:'Backup',
            message: message,
            type: type,
            userAuthID: req.user.userPrivilegeID,
            aclAddRoles2: results[0], //aclPermissions addRoles2
            aclModifyRoles2: results[1],  //aclPermissions modifyRoles2
            aclDeleteRoles2: results[2],  //aclPermissions deleteRoles2
            aclSideMenu: results[3][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });

    })
};


//MANUAL BACKUP
module.exports.manualBackupPost = function(req, res) {
    var spawn = require('child_process').spawn,
        ls    = spawn('cmd.exe', ["/c", `backup\\SMECS_manual_backup.bat`],{env: process.env});
    backup.backupRestore(ls, 'manualBackup', function (result,err) {   //manual backup
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
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){

        functions.redirectTabUsers(req, res, 'showUsers');
        functions.redirectTabBuildings(req, res, 'showBuilding');

        res.render('backupRestore/backup',{
            title:'Backup',
            message: req.params.message,
            userAuthID: req.user.userPrivilegeID,
            aclAddRoles2: results[0], //aclPermissions addRoles2
            aclModifyRoles2: results[1],  //aclPermissions modifyRoles2
            aclDeleteRoles2: results[2],  //aclPermissions deleteRoles2
            aclSideMenu: results[3][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};



//AUTO & MANUAL BACKUP & RESTORE
module.exports.backupRestore = function(ls, backupType, callback) {
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
        if(backupType === 'autoBackup' || backupType === 'manualBackup' || backupType === 'restore')
            callback(code2);
        else
            callback('failed');
    });
};


//Show Backups
module.exports.showBackups = function(req, res, next) {

    async.parallel([
        function(callback){aclPermissions.addRoles2(req, res, callback);},   //aclPermissions addRoles2
        function(callback){aclPermissions.modifyRoles2(req, res, callback);}, //aclPermissions modifyRoles2
        function(callback){aclPermissions.deleteRoles2(req, res, callback);}, //aclPermissions deleteRoles2
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTabUsers(req, res, 'showUsers');
        functions.redirectTabBuildings(req, res, 'showBuilding');

        const testFolder = './backup/_database/';
        const fs = require('fs');

        let arrayDirectories = [];
        fs.readdir(testFolder, (err, files) => {
            files.forEach(file => {
                arrayDirectories.push(file);
            });

            let str = arrayDirectories.toString();
            let arraySplit = str.split("_").join(',').split(',');

            let arrayBackups = [];
            for(let x = 0; x < arraySplit.length; x+=3) {
                let replacedTime = arraySplit[x+1].replace(/-/g, ':');
                let backup = {
                    backupDate: arraySplit[x],
                    backupTime: replacedTime,
                    backupType: arraySplit[x+2],
                    backupFullName: arraySplit[x] + '_' + arraySplit[x+1] + '_' + arraySplit[x+2],
                };
                arrayBackups.push(backup);
            }

            res.render('backupRestore/showBackups',{
                title:'Restore Backup',
                userAuthID: req.user.userPrivilegeID,
                backups: arrayBackups,
                aclAddRoles2: results[0], //aclPermissions addRoles2
                aclModifyRoles2: results[1],  //aclPermissions modifyRoles2
                aclDeleteRoles2: results[2],  //aclPermissions deleteRoles2
                aclSideMenu: results[3][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        });

    })
};


//Restore database Backups
module.exports.restoreBackupPost = function(req, res) {
    let backupToRestore = req.body.directoryName;

    backup.savePushTokens(function (result4,err4) { //Before restore, saves users pushTokens. result3 contains users pushTokens before restore
        if(err4)console.log('err4 - ',err4);
        else {
            //Start restore process
            var spawn = require('child_process').spawn,
                ls    = spawn('cmd.exe', ["/c", `backup\\SMECS_1restoreDatabase.bat`,backupToRestore],{env: process.env});
            backup.backupRestore(ls, 'restore', function (result,err) {   //restore DATABASE
                if(err) console.log('restore database err = ',err);
                else {
                    let message;
                    if(result === 0){
                        savePushTokensToRestoredDatabase(result4);  //replace users pushTokens to restored database
                        backup.restoreFolders(function (result2,err2) { //restore FOLDERS
                            if(err) console.log('restore folders err = ',err2);
                            else {
                                let message2;
                                if(result2 === 0){
                                    console.log('Restore folders successful!');
                                    message2 = "Restore finished successfully";
                                    clean.cleanOldUserPhotos(); //delete old Users photos
                                    clean.cleanOldStudentPhotos(); //delete old Users photos
                                    clean.cleanOldAlertSentInfoFloors(); //delete old AlertSentInfoFloors photos
                                    clean.cleanOldAlertSentInfoStudents(); //delete old AlertSentInfoStudents photos
                                }
                                else {
                                    message2 = "There was a problem restoring folders backup";
                                    console.log('restore folders backup FAILED');
                                }
                                res.send({redirect: '/backupResp/' + message2});
                            }
                        });
                    }
                    else {
                        message = "There was a problem restoring database backup";
                        console.log('restore database backup FAILED');
                        res.send({redirect: '/backupResp/' + message});
                    }
                }
            });
        }
    });
};

//AUTO & MANUAL BACKUP & RESTORE
module.exports.restoreFolders = function(callback) {
    var spawn2 = require('child_process').spawn,
        ls2    = spawn2('cmd.exe', ["/c", `backup\\SMECS_2restoreFolders.bat`],{env: process.env});
    backup.backupRestore(ls2, 'restore', function (result2,err) {   //manual backup
        if(err) console.log('restore err = ',err);
        else callback(result2);

    });
};

//AUTO & MANUAL BACKUP & RESTORE
module.exports.savePushTokens = function(callback) {
    console.log('savePushTokens');
    models.Users.find({}, function (err, users) {
        if (err) {
            console.log('err = ', err);
        }
        else {
            let arrayOfUsersWithPushTokens = [];
            users.forEach(function (user, idx2, array2) {
                if(user.pushToken.length >= 1){
                    let userTokens = {
                        _id: user._id,
                        pushToken: user.pushToken
                    };
                    arrayOfUsersWithPushTokens.push(userTokens);
                }
                if (idx2 === array2.length - 1) {
                    callback(arrayOfUsersWithPushTokens)
                }
            });
        }
    });
};
function savePushTokensToRestoredDatabase(arrayOfUsersWithPushTokens){
    console.log('savePushTokensToRestoredDatabase');
    models.Users.find({}, function (err, users) {
        if (err) {
            console.log('err = ', err);
        }
        else {
            users.forEach(function (user) {

                console.log('arrayOfUsersWithPushTokens= ',arrayOfUsersWithPushTokens);

                let flagUserFound = 0;
                for (let i = 0; i < arrayOfUsersWithPushTokens.length; ++i) {
                    let userID = user._id.toString();
                    let userInArray = arrayOfUsersWithPushTokens[i]._id.toString();
                    console.log('userID -- ',userID);
                    console.log('userInArray -- ',userInArray);
                    if(userID === userInArray){
                        user.pushToken = arrayOfUsersWithPushTokens[i].pushToken;
                        flagUserFound = 1;
                        break
                    }
                }
                if(flagUserFound === 0){
                    user.pushToken = undefined;
                }
                user.save(function (err2) {
                    if(err){console.log('err saving user pushTokens = ',err2);}
                    else {console.log('Success replacing user pushTokens user: ' + user.firstName + ' ' + user.lastName);console.log('user.pushTokenZ = ',user.pushToken);}
                });
            });
        }
    });
}