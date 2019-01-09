//Dependencies
var models = require('./models');
var async = require("async");
var aclPermissions = require('./acl/aclPermissions');
let pushNotification = require('./alerts/sendingReceiving/pushNotification.js');

//REDIRECT TO PREVIOUS PAGE
module.exports.redirectPage = function(req, res, page) {
    models.Users.findOneAndUpdate({_id: req.user.id}, {$set:{redirect:page}}, {new: true}, function(err, user){
        if(err){
            console.log("Something wrong when updating user.redirect!");
        }
        else {
            if(user == null){
                models.ParentSelfRegistration.findOneAndUpdate({_id: req.user.id}, {$set:{redirect:page}}, {new: true}, function(err, parent){
                    if(err){
                        console.log("Something wrong when updating user.redirect!");
                    }
                    else {
                        console.log('successfully updated Parent user.redirect');
                    }
                });
            }
            else{
                console.log('successfully updated user.redirect');
            }

        }
    });
};

module.exports.redirectTabUsers = function(req, res, tab) {
    console.log('tab = ',req.body.tab);
    if(req.body.tab)
        tab = req.body.tab;

    models.Users.findOneAndUpdate({_id: req.user.id}, {$set:{redirectTabUsers:tab}}, {new: true}, function(err, user){
        if(err){
            console.log("Something wrong when updating user.redirect!");
        }
        else {
            console.log('successfully updated user.redirectTabUsers');
        }
    });
};

module.exports.redirectTabAlertGroups = function(req, res, tab) {
    if(req.body.tab)
        tab = req.body.tab;

    models.Users.findOneAndUpdate({_id: req.user.id}, {$set:{redirectTabAlertGroups:tab}}, {new: true}, function(err, user){
        if(err){
            console.log("Something wrong when updating user.redirect!");
        }
        else {
            console.log('successfully updated user.redirectTabAlertGroups');
        }
    });
};

module.exports.redirectTabBuildings = function(req, res, tab) {
    console.log('tab = ',req.body.tab);
    if(req.body.tab)
        tab = req.body.tab;

    models.Users.findOneAndUpdate({_id: req.user.id}, {$set:{redirectTabBuildings:tab}}, {new: true}, function(err, user){
        if(err){
            console.log("Something wrong when updating user.redirectTabBuildings!");
        }
        else {
            console.log('successfully updated user.redirectTabBuildings');
        }
    });
};

module.exports.redirectTabProcedure = function(req, res, tab) {
    console.log('tab = ',req.body.tab);
    if(req.body.tab)
        tab = req.body.tab;

    models.Users.findOneAndUpdate({_id: req.user.id}, {$set:{redirectTabProcedure:tab}}, {new: true}, function(err, user){
        if(err){
            console.log("Something wrong when updating user.redirectTabProcedure!");
        }
        else {
            console.log('successfully updated user.redirectTabProcedure');
        }
    });
};


module.exports.useIcons = function(req, res) {
    var iconType = req.body.iconType;
    var useIcons = req.body.useIcons;

    if(iconType == 'roles'){
        models.Icons.findOneAndUpdate({_id: '5afcab36dcba311ccc719b0a'}, {$set:{useRolesIcons:useIcons}}, {new: true}, function(err){
            if(err) console.log("Something wrong when updating useRolesIcons");});}
    if(iconType == 'privilege'){
        models.Icons.findOneAndUpdate({_id: '5afcab36dcba311ccc719b0a'}, {$set:{usePrivilegeIcons:useIcons}}, {new: true}, function(err){
            if(err) console.log("Something wrong when updating usePrivilegeIcons");});}
    if(iconType == 'groups'){
        models.Icons.findOneAndUpdate({_id: '5afcab36dcba311ccc719b0a'}, {$set:{useAlertGroupIcons:useIcons}}, {new: true}, function(err){
            if(err) console.log("Something wrong when updating useAlertGroupIcons");
            else  pushNotification.icons(icons.useAlertGroupIcons,'checkIcons');
        });
    }
    if(iconType == 'alerts'){
        models.Icons.findOneAndUpdate({_id: '5afcab36dcba311ccc719b0a'}, {$set:{useAlertsIcons:useIcons}}, {new: true}, function(err,icons){
            if(err) console.log("Something wrong when updating useAlertsIcons");
            else  pushNotification.icons(icons.useAlertsIcons,'checkIcons');
        });
    }
};



//SIDE MENU PERMISSIONS
module.exports.aclSideMenu = function(req, res, callback) {
    async.parallel([
        function(callback){aclPermissions.showUsers(req, res, callback);},              //aclPermissions showUsers
        function(callback){aclPermissions.showStudents(req, res, callback);},           //aclPermissions showStudents
        function(callback){aclPermissions.showReports(req, res, callback);},            //aclPermissions showAlertsReports
        function(callback){aclPermissions.showAlertGroups(req, res, callback);},        //aclPermissions showAlertGroups
        function(callback){aclPermissions.showAlerts(req, res, callback);},             //aclPermissions showAlerts
        function(callback){aclPermissions.showAlertsTable(req, res, callback);},        //aclPermissions showAlertsTable
        function(callback){aclPermissions.showRoles2(req, res, callback);},             //aclPermissions showRoles2
        function(callback){aclPermissions.showPrivilege(req, res, callback);},          //aclPermissions showPrivilege
        function(callback){aclPermissions.showPermissions(req, res, callback);},        //aclPermissions showPermissions
        function(callback){aclPermissions.showPermissionsTable(req, res, callback);},   //aclPermissions showPermissionsTable
        function(callback){aclPermissions.showFloors(req, res, callback);},             //aclPermissions showFloors
        function(callback){aclPermissions.showRooms(req, res, callback);},             //aclPermissions showRooms
        function(callback){aclPermissions.showUtilities(req, res, callback);},          //aclPermissions showUtilities
        function(callback){aclPermissions.showMedical(req, res, callback);},            //aclPermissions showMedical
        function(callback){aclPermissions.showPAUsers(req, res, callback);},            //aclPermissions showPAUsers
        function(callback){aclPermissions.showPAPreRecorded(req, res, callback);}

    ],function(err, results){

        var show = {
            users: results[0],
            students: results[1],
            reports: results[2],
            alertGroups: results[3],
            alerts: results[4],
            alertsTable: results[5],
            roles2: results[6],
            privilege: results[7],
            permissions: results[8],
            permissionsTable: results[9],
            floors: results[10],
            rooms: results[11],
            utilities: results[12],
            medical: results[13],
            pAUsers: results[14],
            pAPreRecorded: results[15]
        };
        callback(show);
    })
};



module.exports.addParentInStudentDocument = function(user, newParentsArray) {
    //save parent in Student database --------------------
    var parent = {
        _id: user._id,
        parentFirstName: user.firstName,
        parentLastName: user.lastName,
        parentPhoto: user.photo
    };

    //bulk1 if parent exists, updates parent array first name and last name
    //bulk2 if parent doesn't exists, add parent to array
    models.Students.bulkWrite([
        {
            updateMany: {
                filter: {
                    studentID: {$in: newParentsArray},
                    'parentOf._id': parent._id  //find in parentOf array for field _id
                },
                update: {
                    'parentOf.$.parentFirstName': parent.parentFirstName,   //update array position
                    'parentOf.$.parentLastName': parent.parentLastName
                }
            }
        },
        {
            updateMany: {
                filter: {
                    studentID: {$in: newParentsArray},  //find student with id = to newParentsArray'
                    'parentOf._id': {$ne: parent._id}   //if student already has that parent do not update
                },
                update: {
                    "$push": { "parentOf": parent }
                }
            }
        }
    ]).then(function(bulkWriteOpResult) {
        //console.log(bulkWriteOpResult);
    });
};

module.exports.addParentInUserDocument = function(student, newParentsArray) {
    //save parent in Student database --------------------
    var parent = {
        studentID: student.studentID,
        studentFirstName: student.firstName,
        studentLastName: student.lastName,
        studentPhoto: student.photo
    };

    models.Users.bulkWrite([
        {
            updateMany: {
                filter: {
                    _id: {$in: newParentsArray},
                    'parentOf.studentID': parent.studentID
                },
                update: {
                    'parentOf.$.studentID': parent.studentID,
                    'parentOf.$.studentFirstName': parent.studentFirstName,
                    'parentOf.$.studentLastName': parent.studentLastName
                }
            }
        },
        {
            updateMany: {
                filter: {
                    _id: {$in: newParentsArray},
                    'parentOf.studentID': {$ne: parent.studentID}   //if student already has that parent do not update
                },
                update: {
                    "$push": { "parentOf": parent }
                }
            }
        }
    ]).then(function(bulkWriteOpResult) {
        //console.log(bulkWriteOpResult);
    });
};


module.exports.alertTimeExpired = function(req, res) {
    console.log('TTL EXPIRED');
    if(req.decoded){ // run SMECS API
        res.json({
            success: false,
            message: 'Alert expired. After choosing alert, you have 10min to fill info and send alert',
            redirect: 'home'
        });

    }else{  // run SMECS EJS
        req.flash('error_messages', 'Alert expired. After choosing alert, you have 10min to fill info and send alert');
        //res.send({redirect: '/alerts/sending/chooseGroup'});
        res.redirect('/alerts/sending/chooseAlert');
    }
};