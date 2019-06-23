var models = require('./../models');

module.exports.appSettingsGet = function (req, res) {
    models.Users.findOne({'email': req.decoded.user.email}, function (err, user) {
        if(err || !user){
            console.log('err - appSettingsGet = ',err);
        }else{
            res.json({
                success: 'true',
                groupSettings: user.appSettings.groupAlertsButtons,
                enableFingerprint: user.appSettings.enableFingerprint
            });
        }

    });
};

module.exports.appSettingsPost = function (req, res) {
    models.Users.findOne({'email': req.decoded.user.email}, function (err, user) {
        if(err || !user){
            console.log('err - appSettingsPost = ',err);
        }else{
            user.appSettings.groupAlertsButtons = req.body.groupAlertsButtons;
            user.appSettings.enableFingerprint = req.body.enableFingerprint;
            user.save();
            res.json({
                success: 'true'
            });
        }
    });
};

module.exports.updateUserInfo = function (req, res) {
    models.Users.findOne({'email': req.decoded.user.email}, function (err, user) {
        if(err || !user){
            console.log('err - updateUserInfo = ',err);
        }else{
            res.json({
                success: 'true',
                userRoleID: user.userRoleID,
                userRoleName: user.userRoleName,
                firstName: user.firstName,
                lastName: user.lastName,
                userPhoto: user.photo
            });
        }

    });
};