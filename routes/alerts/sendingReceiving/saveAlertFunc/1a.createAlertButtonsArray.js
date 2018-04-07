//Dependencies
var models = require('./../../../models');
var async = require("async");

module.exports.getRealTestAlerts = function(req, callback) {
    async.waterfall([
        function (cb) {
            var arrayAlerts = [];
            var typeAclAlert = 'AclAlertsReal';
            getArrays(req, typeAclAlert, function (arrayRealAlert) {
                typeAclAlert = 'AclAlertsTest';
                getArrays(req, typeAclAlert, function (arrayTestAlert) {
                    arrayAlerts = [arrayRealAlert, arrayTestAlert];
                    cb(null, arrayAlerts); // cb contains unsorted arrayAlerts
                });
            });

        }
    ], function (err, result) {
        //Sort array by alertID
        sortArrays(result[0]);
        sortArrays(result[1]);

        //end of Sort array by alertID
        callback(result); // this 'callback' is sending 'result' to 1.chooseAlert.js
    });
};

function getArrays(req, typeAclAlert, callback) {
    var arrayAlert = [];
    async.map(req.user.userRoleID, function (roleX, callback2) {
            //checkboxes that have an "s", not softDeleted and checkBox is "true": put them in array
            models[typeAclAlert].find({
                'alertSoftDeleted': false,
                'checkBoxID': {"$regex": "s" + roleX, "$options": "i"},
                'checkBoxValue': true
            }, callback2).sort({"alertTypeID": 1}).sort({"alertID": 1}).cursor();
        },
        function (err, data) {
            // comes here after all individual async calls have completed
            // check errors; array of results is in data
            data.forEach(function (alert) {
                for (var i = 0; i < alert.length; i++) {
                    //checks is alertID already exits. If Exits, remove duplicate
                    for (var u = 0; u < arrayAlert.length; u++) {
                        if (arrayAlert[u].alertID == alert[i].alertID) {
                            var index = arrayAlert.indexOf(arrayAlert[u]);
                            if (index > -1) {
                                arrayAlert.splice(index, 1);
                            }
                        }
                    }
                    //end of___ checks is alertID already exits. If Exits, remove duplicate

                    arrayAlert.push({
                        'groupID': alert[i].alertTypeID,
                        'alertID': alert[i].alertID,
                        'alertName': alert[i].alertName,
                        'alertColor': alert[i].alertTypeName
                    });
                }
            });
            callback(arrayAlert);
        });
}

function sortArrays(result) {
    var sortArray = result;
    sortArray.sort(function(a,b) {
        if (a.alertID < b.alertID)
            return -1;
        if (a.alertID > b.alertID)
            return 1;
        return 0;
    });
}