//Dependencies
var async = require("async");
var models = require('./../models');
var aclPermissions = require('./../acl/aclPermissions');
var functions = require('./../functions');

/* SHOW ALERT PERMISSIONS TABLE. ---------------------------------------------------*/
module.exports.showRealDrill = function(req, res) {
    var typeAclAlert = 'AclAlertsReal';
    var title = 'Who can send/receive alerts';
    showTable(req, res, typeAclAlert, title);
};



function showTable(req, res, typeAclAlert, title){
    async.parallel([
        function(callback){models.Roles2.count(function(err, count){}).exec(callback);
        },
        function(callback){
            models.Roles2.find().sort({"roleID":1}).exec(callback);
        },
        function(callback){
            models.AlertsGroup.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){
            models.Alerts.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){aclPermissions.showAlertsTable(req, res, callback);},   //aclPermissions showAlertsTable
        function(callback){aclPermissions.modifyAlertsTable(req, res, callback);},  //aclPermissions modifyAlertsTable
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectPage(req, res, 'showAlertsAndGroups');

        res.render('alerts/showAlertPermissionsTable',{
            roles2Count: results[0],
            roles2: results[1],
            alertGroup: results[2],
            alerts: results[3],
            aclShowAlertsTable: results[4],    //aclPermissions showPermissionsTable
            aclModifyAlertsTable: results[5],   //aclPermissions modifyAlertsTable
            aclSideMenu: results[6],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};


//saving ALERT PERMISSION Table checkBox value to AclAlerts database------------------------
module.exports.savePost = function(req, res) {


    var searchIDsCheckedRealSend = req.body.searchIDsCheckedRealSend;
    var searchIDsCheckedRealReceived = req.body.searchIDsCheckedRealReceived;
    var searchIDsCheckedDrillSend = req.body.searchIDsCheckedDrillSend;
    var searchIDsCheckedDrillReceived = req.body.searchIDsCheckedDrillReceived;


    //Build array Object of all checked checkboxes -------------------
    var arrTotal = []; //arrTotal[0] = "real send" checked checkboxes, arrTotal[1] = "real receive" checked checkboxes, ...
    var idsType;
    for ( var i=0 ; i < 4 ; i++ ) {
        if( i == 0)
            idsType = searchIDsCheckedRealSend;
        if( i == 1)
            idsType = searchIDsCheckedRealReceived;
        if( i == 2)
            idsType = searchIDsCheckedDrillSend;
        if( i == 3)
            idsType = searchIDsCheckedDrillReceived;

        var arrAlerts = [];
        var alertID = 0;
        var arrRoles = [];
        var obj;
        var splitCheckboxArray = [];

        if(idsType) { //at least one checkbox is checked
            for (var u = 0; u < idsType.length; u++) {
                splitCheckboxArray.push(idsType[u].split("-"));
            }
            ;

            for (var u = 0; u < splitCheckboxArray.length; u++) {
                alertID = splitCheckboxArray[u][0];
                arrRoles.push(splitCheckboxArray[u][1]);
                if (u == splitCheckboxArray.length - 1 || alertID !== splitCheckboxArray[u + 1][0]) {
                    obj = {
                        alertID: alertID,
                        arrRoles: arrRoles
                    };
                    arrAlerts.push(obj);
                    arrRoles = [];
                }
            }
        }
        arrTotal.push(arrAlerts);
    }
    // end of Build array Object of all checked checkboxes ---------------

    //Puts all checkboxes with value False or True
    models.Alerts.find({}, function(err, alerts){
        alerts.forEach(function (alert) {
            for (var a = 0; a < 4; a++) {
                if( a == 0){
                    alert.whoCanSendReceive.sendReal.forEach(function (type) {
                        writeCheckboxes(arrTotal[0], alert, type);
                    });
                }
                if( a == 1){
                    alert.whoCanSendReceive.receiveReal.forEach(function (type) {
                        writeCheckboxes(arrTotal[1], alert, type);
                    });
                }
                if( a == 2){
                    alert.whoCanSendReceive.sendDrill.forEach(function (type) {
                        writeCheckboxes(arrTotal[2], alert, type);
                    });
                }
                if( a == 3){
                    alert.whoCanSendReceive.receiveDrill.forEach(function (type) {
                        writeCheckboxes(arrTotal[3], alert, type);
                    });
                }
            }
            alert.save(function (err) {
                if (err) {
                    console.log('err - ',err);
                    return res.status(409).send('showAlert')
                } else {

                }
            });
        })
    });
    //end of Puts all checkboxes with value False or True

};

function writeCheckboxes(lines, alert, type){
    var flag = 0;
    lines.forEach(function (line) {
        for (var z = 0; z < line.arrRoles.length; z++) {
            if (line.alertID == alert.alertID && line.arrRoles[z] == type.roleID) {
                flag = 1;
                break
            }
        }
    });
    if (flag == 1)
        type.checkbox = true;
    else
        type.checkbox = false;
}

//-------------------------------------------end of saving ALERTS PERMISSION Table checkBox value to AclAlerts database
