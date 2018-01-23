//Dependencies
var models = require('./../models');


/**
 * STATIC values that can't be change:
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *                                      THIS JS FILE IS NOT BEING USED
 */





//sendLockdown ID = 3
module.exports.sendLockdown = function(req, res, callback) {
    var id = 3;
    models.AclAlerts.findOne({"checkBoxID": req.user.userRoleID+''+id}).exec(callback);
};

