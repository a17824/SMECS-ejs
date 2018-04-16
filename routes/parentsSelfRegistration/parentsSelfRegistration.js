//Dependencies
var async = require("async");
var models = require('../models');
var aclPermissions = require('../acl/aclPermissions');

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

    models.ParentSelfRegistration.findById({'_id': selfRegistrationToUpdate}, function(err, parent){
        if (err) {
            console.log('POST - something wrong updating Parent Self Registration');
        }else{
            parent.email = emailLowerCase;
            parent.pin = pin; //req.body.pin;

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
module.exports.registerParent = function(req, res, next) {
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
            function(callback){aclPermissions.showDeletedUsers(req, res, callback);},   //aclPermissions showDeletedUsers
            function(callback){aclPermissions.showUsers(req, res, callback);},          //aclPermissions showUsers
            function(callback){aclPermissions.addUsers(req, res, callback);},           //aclPermissions addUsers
            function(callback){aclPermissions.modifyUsers(req, res, callback);},        //aclPermissions modifyUsers
            function(callback){aclPermissions.deleteUsers(req, res, callback);}         //aclPermissions deleteUsers


        ],function(err, results){
            models.UsersAddTemp.findById({'_id': userID}, function (err, user) {
                res.render('parentsSelfRegistration/registerParent',{
                    title:'Parent registration',
                    users: user,
                    students: results[0],
                    aclShowDeletedUsers: results[1], //aclPermissions showDeletedUsers
                    aclShowUsers: results[2], //aclPermissions showUsers
                    aclAddUsers: results[3], //aclPermissions addUsers
                    aclModifyUsers: results[4],  //aclPermissions modifyUsers
                    aclDeleteUsers: results[5]  //aclPermissions deleteUsers
                });
            });


        })

    });
};

module.exports.registerParentPost = function(req, res) {
    var selfRegistrationToUpdate = req.body.selfRegistrationToUpdate;
    var emailLowerCase = req.body.email.toLowerCase();
    var pin = req.body.pin;

    models.ParentSelfRegistration.findById({'_id': selfRegistrationToUpdate}, function(err, parent){
        if (err) {
            console.log('POST - something wrong updating Parent Self Registration');
        }else{
            parent.email = emailLowerCase;
            parent.pin = pin; //req.body.pin;

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