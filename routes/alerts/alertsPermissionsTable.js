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
        function(callback){                                                             //pass all checkbox database to ejs
            models.AclAlertsReal.find().exec(callback);
        },
        function(callback){                                                             //pass all checkbox database to ejs
            models.AclAlertsTest.find().exec(callback);
        },
        function(callback){aclPermissions.showAlertsTable(req, res, callback);},   //aclPermissions showAlertsTable
        function(callback){aclPermissions.modifyAlertsTable(req, res, callback);},  //aclPermissions modifyAlertsTable
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectPage(req, res, 'showAlertsAndGroups');

        res.render('alerts/showAlertPermissionsTable-new',{
            roles2Count: results[0],
            roles2: results[1],
            alertGroup: results[2],
            alert: results[3],
            real: results[4],
            drill: results[5],
            //typeAclAlert: 'AclAlertsReal', // to delete with new bootstrap page
            aclShowAlertsTable: results[6],    //aclPermissions showPermissionsTable
            aclModifyAlertsTable: results[7],   //aclPermissions modifyAlertsTable
            aclSideMenu: results[8],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};


//saving ALERT PERMISSION Table checkBox value to AclAlerts database------------------------
module.exports.savePost = function(req, res) {
    //console.log(req.body); //Output=> like { searchID: 'Array of checked checkbox' }

    var searchIDsCheckedReal = req.body.searchIDsCheckedReal;
    var searchIDsNotCheckedReal = req.body.searchIDsNotCheckedReal;
    var searchIDsCheckedDrill = req.body.searchIDsCheckedDrill;
    var searchIDsNotCheckedDrill = req.body.searchIDsNotCheckedDrill;

    console.log('searchIDsCheckedReal = ' + searchIDsCheckedReal);
    console.log('searchIDsNotCheckedReal = ' + searchIDsNotCheckedReal);
    console.log('searchIDsCheckedDrill = ' + searchIDsCheckedDrill);
    console.log('searchIDsNotCheckedDrill = ' + searchIDsNotCheckedDrill);


    models.AclAlertsReal.bulkWrite([
        {
            updateMany: {
                filter: {
                    checkBoxID: {$in: searchIDsCheckedReal}
                },
                update: {
                    checkBoxValue: true
                }
            }
        },
        {
            updateMany: {
                filter: {
                    checkBoxID: {$in: searchIDsNotCheckedReal}
                },
                update: {
                    checkBoxValue: false
                }
            }
        }
    ]).then(function(bulkWriteOpResult) {
        //console.log(bulkWriteOpResult);
    });


    models.AclAlertsTest.bulkWrite([
        {
            updateMany: {
                filter: {
                    checkBoxID: {$in: searchIDsCheckedDrill}
                },
                update: {
                    checkBoxValue: true
                }
            }
        },
        {
            updateMany: {
                filter: {
                    checkBoxID: {$in: searchIDsNotCheckedDrill}
                },
                update: {
                    checkBoxValue: false
                }
            }
        }
    ]).then(function(bulkWriteOpResult) {
        //console.log(bulkWriteOpResult);
    });

    //res.redirect(200, '/reports/homeReports');
};

//-------------------------------------------end of saving ALERTS PERMISSION Table checkBox value to AclAlerts database