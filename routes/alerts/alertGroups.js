//Dependencies
var models = require('./../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var functions = require('./../functions');
var buildIconsColorSound = require('./../../public/icons/js/icons');


/* ADD AlertGroups. -------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertsGroup.find(function(error, alertGroup) {

            }).exec(callback);
        },
        function(callback){buildIconsColorSound.soundBuild(function(sound){callback(null, sound);});},  //sounds
        function(callback){buildIconsColorSound.lightMode(function(lightMode){callback(null, lightMode);});},  //lightMode
        function(callback){aclPermissions.showAlertGroups(req, res, callback);}, //aclPermissions showAlertGroups
        function(callback){aclPermissions.addAlertGroup(req, res, callback);},  //aclPermissions addAlertGroup
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTabAlertGroups(req, res, 'showGroups');

        var arraySort = [];
        var array = [];

        var streamSort = models.AlertsGroup.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(arraySort);
        });

        var stream = models.AlertsGroup.find().sort({"sortID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.groupID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            console.log('array = ',array);
            res.render('alertsAndGroups/alertGroups/addGroups',{
                title:'Add Alert Group',
                arraySort: arraySort,
                array: array,
                userAuthID: req.user.userPrivilegeID,
                alertGroup: results[0],
                sounds: results[1],
                lightModes: results[2],
                aclShowAlertGroups: results[3],     //aclPermissions showAddAlertGroup
                aclAddAlertGroup: results[4],      //aclPermissions addAddAlertGroup
                aclSideMenu: results[5],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};
module.exports.addPost = function(req, res) {
    async.parallel([
        function(callback){buildIconsColorSound.groupColorExport(function(color){callback(null, color);});}  //get Group Colors

    ],function(err, results){
        var groupColor = results[0];
        var textValue = 'FFFFFF';
        getGroupTextColor(req.body.colorName, groupColor, textValue, function (result) {
           textValue = result;
        });

        var soundArray = req.body.sound.split(",").map(String);
        var soundID = parseInt(soundArray[0]);
        var soundType = soundArray[1];
        var soundName = soundArray[2];
        var soundMp3 = soundArray[3];
        var soundChannel = soundArray[4];

        var alertGroup1 = new models.AlertsGroup({
            groupID: req.body.alertGroupID,
            sortID: req.body.sortID,
            name: req.body.alertGroupName,
            icon: req.body.icon,
            color: {
                name: req.body.colorName,
                bgValue: req.body.bgValue,
                textValue: textValue
            },
            sound: {
                soundID: soundID,
                soundType: soundType,
                name: soundName,
                mp3: soundMp3,
                channel: soundChannel
            },
            light: {
                mode: req.body.lightModeType,
                colorRandom: req.body.lightColor
            }
        });
        alertGroup1.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                return res.status(409).send('showAlert')
            }else{
                return res.send({redirect:'/alertGroups/showAlertGroups'})
            }
        });
    });
};
/*-------------------------end of adding AlertGroups*/

/* UPDATE AlertGroups. -------------------------------*/
module.exports.update = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertsGroup.findById(req.params.id,function(error, alertGroup) {
            }).exec(callback);

        },
        function(callback){buildIconsColorSound.soundBuild(function(sound){callback(null, sound);});},  //sounds
        function(callback){buildIconsColorSound.lightMode(function(lightMode){callback(null, lightMode);});},  //lightMode
        function(callback){aclPermissions.modifyAlertGroup(req, res, callback);},  //aclPermissions modifyAlertGroup
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu


    ],function(err, results){
        var arraySort = [];
        var array = [];

        var streamSort = models.AlertsGroup.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(arraySort);
        });

        var stream = models.AlertsGroup.find().sort({"sortID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.groupID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed

            res.render('alertsAndGroups/alertGroups/updateGroups',{
                title:'Update Alert Group',
                userAuthID: req.user.userPrivilegeID,
                arraySort: arraySort,
                array: array,
                alertGroup: results[0],
                sounds: results[1],
                lightModes: results[2],
                aclModifyAlertGroup: results[3],      //aclPermissions modifyAlertGroup
                aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};
module.exports.updatePost = function(req, res) {

    async.parallel([
        function(callback){buildIconsColorSound.groupColorExport(function(color){callback(null, color);});}  //get Group Colors

    ],function(err, results){
        var groupColor = results[0];
        var textValue = 'FFFFFF';
        getGroupTextColor(req.body.colorName, groupColor, textValue, function (result) {
            textValue = result;
        });

        var alertGroupToUpdate1 = req.body.alertGroupToUpdate;

        var soundArray = req.body.sound.split(",").map(String);
        var soundID = parseInt(soundArray[0]);
        var soundType = soundArray[1];
        var soundName = soundArray[2];
        var soundMp3 = soundArray[3];
        var soundChannel = soundArray[4];


        models.AlertsGroup.findById({'_id': alertGroupToUpdate1}, function(err, alertGroup){

            alertGroup.groupID = req.body.groupID;
            alertGroup.name = req.body.name;
            alertGroup.sortID = req.body.sortID;
            alertGroup.color.name = req.body.colorName;
            alertGroup.color.bgValue = req.body.bgValue;
            alertGroup.color.textValue = textValue;
            alertGroup.icon = req.body.icon;
            alertGroup.sound.soundID = soundID;
            alertGroup.sound.soundType = soundType;
            alertGroup.sound.name = soundName;
            alertGroup.sound.mp3 = soundMp3;
            alertGroup.sound.channel = soundChannel;
            alertGroup.light.mode = req.body.lightModeType;
            alertGroup.light.colorRandom = req.body.lightColor;

            alertGroup.save(function (err) {
                if (err && (err.code === 11000 || err.code === 11001)) {
                    console.log(err);
                    return res.status(409).send('showAlert')
                }else{
                    //UPDATE Alerts Group_name & Group_id DATABASE--------
                    var alertToUpdate1 = req.body.oldAlertGroupID;
                    models.Alerts.find({}, function(err, alerts) {
                        if( err || !alerts) console.log("No alerts to update");
                        else alerts.forEach( function(alert) {
                            if (alert.group.groupID == alertToUpdate1){
                                alert.group.groupID = req.body.groupID;
                                alert.group.sortID = req.body.sortID;
                                alert.group.name = req.body.name;
                                alert.group.icon = req.body.icon;
                                alert.group.color.name = req.body.colorName;
                                alert.group.color.bgValue = req.body.bgValue;
                                alert.group.color.textValue = textValue;
                                alert.group.light.mode = req.body.lightModeType;
                                alert.group.light.colorRandom = req.body.lightColor;
                                alert.group.mp3 = soundMp3;
                                alert.group.soundChannel = soundChannel;

                                alert.save(function (err) {
                                    if (err && (err.code === 11000 || err.code === 11001)) {
                                        console.log(err);
                                        return res.status(409).send('showAlert')
                                    }else {
                                    }
                                });
                            }
                        });
                    });
                    //--------end UPDATE Alerts Group_name & Group_id Database
                    return res.send({redirect:'/alertGroups/showAlertGroups'})
                }
            });
        });
    });
};
/*-------------------------end of update AlertGroups*/

/* DELETE AlertGroups. */
module.exports.delete = function(req, res) {
    var alertGroupToDelete = req.params.id;
    models.AlertsGroup.findOne({'_id': alertGroupToDelete}, function(err, alertGroup) {
        models.Alerts.findOne({ 'group.groupID': alertGroup.groupID }, function (err, result) {
            if (err) { console.log(err) };

            if (result) {
                console.log("Alert Group NOT deleted");
                //return res.status(409).send(' ALERT! ' + alertGroup.name + ' Group not deleted because there are Alerts using this Alert Group. Please change the Alerts under this Alert Group to other Group and then delete this Alert Group.');
                req.flash('error_messages', ' Attention! ' + alertGroup.name + ' group was not deleted because there are Alerts using this Alert Group. <br> Please change the Alerts under this Alert Group to other Group and then delete this Alert Group.');
                res.redirect('/alertGroups/showAlertGroups');
            } else {
                models.AlertsGroup.remove({'_id': alertGroupToDelete}, function(err) {
                    //res.send((err === null) ? { msg: 'Role not deleted' } : { msg:'error: ' + err });
                    return res.redirect('/alertGroups/showAlertGroups');
                });
            }
        });
    });
};
/* ---- end of DELETE AlertGroups. */

function getGroupTextColor(colorName, groupColor, textValue, callback) {
    for (var i=0; i < groupColor.Data.length; i++) {
        if (colorName == groupColor.Data[i].ColorName ){
            textValue = groupColor.Data[i].ColorText;
            callback(textValue);
            break
        }
    }
}