//Dependencies
var async = require("async");
var models = require('./../models');
var aclPermissions = require('./../acl/aclPermissions');
var functions = require('./../functions');


/* SHOW PERMISSIONS TABLE. ---------------------------------------------------*/
module.exports.show = function(req, res) {

    async.parallel([
        function(callback){models.Privilege.count(function(err, count){}).exec(callback);
        },
        function(callback){
            models.Privilege.find().sort({"privilegeID":1}).exec(callback);
        },
        function(callback){
            models.PermissionsGroup.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){
            models.Permissions.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){                                                             //pass all checkbox database to ejs
            models.AclPermissions.find().exec(callback);
        },
        function(callback){aclPermissions.showPermissionsTable(req, res, callback);},   //aclPermissions showPermissionsTable
        function(callback){aclPermissions.modifyPermissionsTable(req, res, callback);},  //aclPermissions modifyPermissionsTable
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        if (results[5].checkBoxValue == false) {
            console.log(err);
            console.log('No Permission');
            req.flash('error_messages', 'No permission to show "Permissions Table page" ');
            res.redirect('/dashboard');
        }
        else {
            functions.redirectTabUsers(req, res, 'showUsers');
            res.render('permissions/showPermissionsTable', {
                title: 'Permissions Table',
                userAuthID: req.user.userPrivilegeID,
                privilegeCount: results[0],
                privilege: results[1],
                permissionsGroup: results[2],
                permissions: results[3],
                aclPermissions: results[4],             //pass all checkbox database to ejs
                aclShowPermissionsTable: results[5],    //aclPermissions showPermissionsTable
                aclModifyPermissionsTable: results[6],        //aclPermissions modifyPermissionsTable
                aclSideMenu: results[7][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        }
    })
};

//saving PERMISSION Table checkBox value to AclPremissions database------------------------
module.exports.savePost = function(req, res) {

    let searchIDsChecked = req.body.searchIDsChecked;
    let searchIDsNotChecked = req.body.searchIDsNotChecked;

    if (searchIDsChecked === 'restore'){ //reset to default permissions
        searchIDsChecked = [11,21,31,12,22,13,23,15,25,16,26,163,263,14,24,165,265,365,465,565,164,264,364,464,564,17,
            27,37,18,28,38,19,29,39,110,210,310,111,211,311,166,266,366,112,212,312,113,213,114,214,314,115,215,116,216,
            316,416,117,217,118,218,119,219,120,220,320,420,121,221,122,222,322,123,223,124,224,324,125,225,325,126,226,
            326,127,128,129,130,131,231,331,132,232,133,233,134,234,135,136,137,138,139,239,339,140,240,141,241,341,142,
            242,342,143,243,343,144,244,344,156,256,356,456,157,257,357,158,258,358,458,159,259,359,145,245,345,146,246,
            346,147,247,347,148,248,348,149,249,349,150,250,350,151,251,351,152,252,352,153,253,353,154,254,354,155,255,
            355,455,160,260,360,161,261,361,162,262,362];

        searchIDsNotChecked = [41,51,32,42,52,33,43,53,35,45,55,36,46,56,363,463,563,34,44,54,47,57,48,58,49,59,410,510,
            411,511,466,566,412,512,313,413,513,414,514,315,415,515,516,317,417,517,318,418,518,319,419,519,520,321,421,
            521,422,522,323,423,523,424,524,425,525,426,526,227,327,427,527,228,328,428,528,229,329,429,529,230,330,430,
            530,431,531,332,432,532,333,433,533,334,434,534,235,335,435,535,236,336,436,536,237,337,437,537,238,338,438,
            538,439,539,340,440,540,441,541,442,542,443,543,444,544,556,457,557,558,459,559,445,545,446,546,447,547,448,
            548,449,549,450,550,451,551,452,552,453,553,454,554,555,460,560,461,561,462,562];
    }

    if (searchIDsChecked != null ){
        for (var i=0; i<searchIDsChecked.length; i++) {
            models.AclPermissions.findOne({"checkBoxID": {"$in": searchIDsChecked[i]}}).exec(function (err, check) {
                check.checkBoxValue = true;
                check.save();
            });
        }
    }
    if (searchIDsNotChecked != null){
        for (var i=0; i<searchIDsNotChecked.length; i++) {
            models.AclPermissions.findOne({"checkBoxID": {"$in": searchIDsNotChecked[i]}}).exec(function (err, check) {
                check.checkBoxValue = false;
                check.save();
            });
        }
    }
};

//-------------------------------------------end of saving PERMISSION Table checkBox value to AclPremissions database