//Dependencies
var async = require("async");
var models = require('./../models');
var aclPermissions = require('./../acl/aclPermissions');
var functions = require('./../functions');

/* SHOW ALERT PERMISSIONS TABLE. ---------------------------------------------------*/
module.exports.showReal = function(req, res) {
    var typeAclAlert = 'AclAlertsReal';
    var title = 'Who can send/receive alerts';
    showTable(req, res, typeAclAlert, title);
};

module.exports.showTest = function(req, res) {
    var typeAclAlert = 'AclAlertsTest';
    var title = 'Who can send/receive TEST alerts';
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
        function(callback){                                                             //pass all checkbox database to ejs
            models[typeAclAlert].find().exec(callback);
        },
        function(callback){aclPermissions.showAlertsTable(req, res, callback);},   //aclPermissions showAlertsTable
        function(callback){aclPermissions.modifyAlertsTable(req, res, callback);},  //aclPermissions modifyAlertsTable
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTabUsers(req, res, 'showUsers');
        res.render('alerts/showAlertPermissionsTable',{
            title: title,
            roles2Count: results[0],
            roles2: results[1],
            alertGroup: results[2],
            alert: results[3],
            aclAlerts: results[4],                  //pass all checkbox database to ejs
            typeAclAlert: typeAclAlert,
            aclShowAlertsTable: results[5],    //aclPermissions showPermissionsTable
            aclModifyAlertsTable: results[6],   //aclPermissions modifyAlertsTable
            aclSideMenu: results[7],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};


//saving ALERT PERMISSION Table checkBox value to AclAlerts database------------------------
module.exports.savePost = function(req, res) {
    //console.log(req.body); //Output=> like { searchID: 'Array of checked checkbox' }
    //console.log(req.body.searchID); // to get array of checked checkbox
    var searchIDsChecked = req.body.searchIDsChecked;
    var searchIDsNotChecked = req.body.searchIDsNotChecked;
    var typeAclAlert = req.body.typeAclAlert;
    //console.log('searchIDsChecked' + typeAclAlert);
    //console.log(searchIDsChecked);
    if (searchIDsChecked != null ){
        for (var i=0; i<searchIDsChecked.length; i++) {
            models[typeAclAlert].findOne({"checkBoxID": {"$in": searchIDsChecked[i]}}).exec(function (err, check) {
                if(err){
                    console.log('111');
                }else{
                    if(check){
                        check.checkBoxValue = true;
                        check.save();
                    }else{
                        console.log('333');
                    }

                }
            });
        }
    }
    if (searchIDsNotChecked != null){
        for (var i=0; i<searchIDsNotChecked.length; i++) {
            models[typeAclAlert].findOne({"checkBoxID": {"$in": searchIDsNotChecked[i]}}).exec(function (err, check) {
                if(err){
                    console.log('111');
                }else{
                    if(check){
                        check.checkBoxValue = false;
                        check.save();
                    }else{
                        console.log('333');
                    }

                }
            });
        }
    }

    res.redirect(200, '/dashboard');
};

//-------------------------------------------end of saving ALERTS PERMISSION Table checkBox value to AclAlerts database