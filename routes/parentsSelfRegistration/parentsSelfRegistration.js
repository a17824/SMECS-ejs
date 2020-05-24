//Dependencies
var async = require("async");
var models = require('../models');
var aclPermissions = require('../acl/aclPermissions');
var functions = require('./../functions');
var bcrypt = require('bcryptjs');
var MobileDetect = require('mobile-detect');

/* defaultForm parentsSelfRegistration. */
module.exports.defaultForm = function(req, res, next) {
    async.parallel([
        function(callback){
            models.ParentSelfRegistration.findById({'_id': '5ad41a6f06513e19ecf3bd5e'}).exec(callback);
        },
        function(callback){aclPermissions.showDeletedUsers(req, res, callback);},   //aclPermissions showDeletedUsers
        function(callback){aclPermissions.showUsers(req, res, callback);},          //aclPermissions showUsers
        function(callback){aclPermissions.addUsers(req, res, callback);},           //aclPermissions addUsers
        function(callback){aclPermissions.modifyUsers(req, res, callback);},        //aclPermissions modifyUsers
        function(callback){aclPermissions.deleteUsers(req, res, callback);},         //aclPermissions deleteUsers
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){

        res.render('parentsSelfRegistration/defaultForm',{
            title:'Parent self registration',
            selfRegistration: results[0],
            userAuthID: req.user.userPrivilegeID,
            aclShowDeletedUsers: results[1], //aclPermissions showDeletedUsers
            aclShowUsers: results[2], //aclPermissions showUsers
            aclAddUsers: results[3], //aclPermissions addUsers
            aclModifyUsers: results[4],  //aclPermissions modifyUsers
            aclDeleteUsers: results[5],  //aclPermissions deleteUsers
            aclSideMenu: results[6][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};

module.exports.defaultFormPost = function(req, res) {
    var selfRegistrationToUpdate = req.body.selfRegistrationToUpdate;
    var emailLowerCase = req.body.email.toLowerCase();
    var pin = req.body.pin;
    var text = req.body.text;

    models.ParentSelfRegistration.findById({'_id': selfRegistrationToUpdate}, function(err, parent){
        if (err) {
            console.log('POST - something wrong updating Parent Self Registration');
        }else{
            parent.email = emailLowerCase;
            parent.pin = pin;
            parent.text = text;

            //check if email already exit in USERS database
            models.Users.find({'email': emailLowerCase}, function (err, result) {
                if(result.length < 1){
                    console.log('parent self registration updated');
                    parent.save();
                    return res.send({redirect: '/users/showUsers'})
                }else{
                    console.log('user email already in use');
                    return res.status(409).send('showAlert')
                }
            });
        }
    });
};


/* registerParent parentsSelfRegistration. */
module.exports.registerParentStep1 = function(req, res, next) {
    async.waterfall([
        function (callback) {
            var userTemp = new models.UsersAddTemp({});
            userTemp.save(function (err) {
                if (err) {
                    console.log('Err - NOT SAVED ON DATABASE' + err);
                    return res.status(409).send('showAlert')
                }else{
                    var userID = userTemp._id;
                    callback(null, userID);
                }
            });
        }
    ], function (err, userID) {
        async.parallel([
            function(callback){
                models.Students.find().sort({"firstName":1}).exec(callback);
            },
            function(callback){
                models.Roles2.findOne({roleID: 98}).exec(callback);
            },function(callback){
                models.Privilege.findOne({privilegeID: 5}).exec(callback);
            },
            function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

        ],function(err, results){

            var iPad = false;
            var md = new MobileDetect(req.headers['user-agent']);
            if(md.is('iPad') == true)
                iPad = true;

            models.UsersAddTemp.findById(userID, function (err, user) {
                if (!user) {
                    console.log(err);
                    console.log('TTL EXPIRED');
                    req.flash('error_messages', 'Time expired. After clicking "Login" button, you have 10min to finish registration');
                    res.redirect('/login');
                }
                else {
                    res.render('parentsSelfRegistration/registerParentStep1', {
                        title: 'Parent registration',
                        users: user,
                        userTempID: userID,
                        iPad: iPad,
                        students: results[0],
                        roleID: results[1].roleID,
                        roleName: results[1].roleName,
                        privilege: results[2],
                        aclSideMenu: results[3][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                        userAuthName: req.user.firstName + ' ' + req.user.lastName,
                        userAuthPhoto: req.user.photo
                    });
                }
            });
        })

    });
};

module.exports.registerParentStep1Post = function(req, res) {
    var userToUpdate = req.body.userToUpdate;
    var emailLowerCase = req.body.email.toLowerCase();
    var roleID = [];
    var roleName = [];
    var privilegeID = req.body.privilegeID;
    var privilegeName = req.body.privilegeName;
    var hash = bcrypt.hashSync(req.body.pin, bcrypt.genSaltSync(10));
    var parentOf = req.body.parentOf;
    var parentOfFinal = [];
    var studentsWithParents = [];
    roleID.push(req.body.roleID);
    roleName.push(req.body.roleName);

    models.UsersAddTemp.findById({'_id': userToUpdate}, function (err0, tempUser) {
        if (!tempUser) {
            console.log(err0);
            console.log('TTL EXPIRED');
            req.flash('error_messages', 'Time expired. After clicking "Login" button, you have 10min to finish registration');
            res.send({redirect: '/login'});
        }
        else {
            models.Users.find({'email': emailLowerCase}, function (err, user) {
                if (err)
                    console.log('err = ', err);
                else {
                    if (user.length == 1) {
                        console.log('Email already in use. Please choose a different email');
                        return res.status(409).send('showAlert')
                    } else {
                        models.Students.find({'studentID': parentOf}, function (err, students) {
                            for (var i = 0; i < students.length; i++) {
                                var student = {
                                    _id: students[i]._id,
                                    studentID: students[i].studentID,
                                    studentFirstName: students[i].firstName,
                                    studentLastName: students[i].lastName,
                                    studentPhoto: students[i].photo
                                };
                                parentOfFinal.push(student);
                                studentsWithParents.push(students[i].studentID);
                            }
                            var user1 = new models.Users({
                                userRoleID: roleID,
                                userRoleName: roleName,
                                userPrivilegeID: privilegeID,
                                userPrivilegeName: privilegeName,
                                firstName: req.body.firstName,
                                lastName: req.body.lastName,
                                email: emailLowerCase,
                                pin: hash,
                                photo: '',
                                parentOf: parentOfFinal,
                                parent: true

                            });
                            user1.save(function (err) {
                                if (err) {
                                    console.log(err);
                                    return res.status(409).send('showAlert')
                                } else {
                                    console.log('"parentOf" added successfully');
                                    functions.addParentInStudentDocument(user1, studentsWithParents);
                                    return res.send({redirect: '/photos/choosePhoto/' + user1._id}) //needs to go to step2 to add photo
                                }
                            });
                        });
                    }
                }
            });
        }
    });
};

