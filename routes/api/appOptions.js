var models = require('./../models');

module.exports.appSettingsGet = function (req, res) {
    models.Users.findOne({'email': req.decoded.user.email}, function (err, user) {
        res.json({
            success: 'true',
            groupSettings: user.appSettings.groupAlertsButtons
        });
    });
};

module.exports.appSettingsPost = function (req, res) {
    models.Users.findOne({'email': req.decoded.user.email}, function (err, user) {
        user.appSettings.groupAlertsButtons = req.body.groupAlertsButtons;
        user.save();
        res.json({
            success: 'true'
        });
    });
};