//Dependencies
var async = require("async");
var models = require('../models');
var aclPermissions = require('../acl/aclPermissions');
var savePhoto = require('../photos/addUpdatePhoto');
var functions = require('./../functions');
var bcrypt = require('bcryptjs');

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
        function(callback){aclPermissions.deleteUsers(req, res, callback);}         //aclPermissions deleteUsers


    ],function(err, results){

        res.render('parentsSelfRegistration/defaultForm',{
            title:'Parent self registration',
            selfRegistration: results[0],
            userAuthID: req.user.userPrivilegeID,
            aclShowDeletedUsers: results[1], //aclPermissions showDeletedUsers
            aclShowUsers: results[2], //aclPermissions showUsers
            aclAddUsers: results[3], //aclPermissions addUsers
            aclModifyUsers: results[4],  //aclPermissions modifyUsers
            aclDeleteUsers: results[5]  //aclPermissions deleteUsers
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
            /*
            function(callback){
                models.UsersAddTemp.findById(userID).exec(callback);
            },
            */
            function(callback){
                models.Students.find().sort({"firstName":1}).exec(callback);
            },
            function(callback){
                models.Roles2.find({roleID: 98}).sort({"firstName":1}).exec(callback);
            },function(callback){
                models.Privilege.find({privilegeID: 5}).sort({"firstName":1}).exec(callback);
            }


        ],function(err, results){
            models.UsersAddTemp.findById(userID, function (err, user) {

                res.render('parentsSelfRegistration/registerParentStep1',{
                    title:'Parent registration Step1',
                    users: user,
                    students: results[0],
                    role: results[1],
                    privilege: results[2]
                });
            });


        })

    });
};

module.exports.registerParentStep1Post = function(req, res) {
    var emailLowerCase = req.body.email.toLowerCase();
    var roleID = req.body.role.roleID;
    var roleName = req.body.role.roleName;
    var privilegeID = req.body.privilege.privilegeID;
    var privilegeName = req.body.privilege.privilegeName;
    var hash = bcrypt.hashSync(req.body.pin, bcrypt.genSaltSync(10));
    var parentOf = req.body.parentOf;
    var parentOfFinal = [];
    var studentsWithParents = [];

    models.Users.find({'email': emailLowerCase}, function (err, user) {
        if(err)
            console.log('err = ',err);
        else{
            console.log(user.length);
            console.log(user);
            if(user.length == 1){
                console.log('dddd');
                console.log('Email already in use. Please choose a different email');
                return res.status(409).send('showAlert')

            }else{
                models.Students.find({'studentID': parentOf}, function (err, students) {
                    for (var i=0; i < students.length; i++) {
                        var student = {
                            _id: students[i]._id,
                            studentID: students[i].studentID,
                            studentFirstName: students[i].firstName,
                            studentLastName: students[i].lastName
                        };
                        parentOfFinal.push(student);
                        studentsWithParents.push(students[i].studentID);
                    }
                    console.log('"parentOf" added successfully');

                    var user1 = new models.Users({
                        userRoleID: roleID,
                        userRoleName: roleName,
                        userPrivilegeID: privilegeID,
                        userPrivilegeName: privilegeName,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: emailLowerCase,
                        pin: hash,
                        parentOf: parentOfFinal,
                        parent: true

                    });
                    user1.save(function (err) {
                        if (err) {
                            console.log(err);
                            return res.status(409).send('showAlert')
                        }else{
                            functions.addParentInStudentDocument(user1, studentsWithParents);
                            return res.send({redirect:'/dashboard'}) //needs to go to step2 to add photo
                        }
                    });


                });




            }
        }


    });



};

