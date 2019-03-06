//Dependencies
var formidable = require('formidable');
var fs   = require('fs-extra');
var models = require('../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var functions = require('./../functions');
var path = require('path'); //to get file extension
var MobileDetect = require('mobile-detect');
let pushNotification = require('./../alerts/sendingReceiving/pushNotification.js');

//--ADD or UPDATE user photo -------------------------------------
module.exports.addUpdatePhoto = function (req, res){
    async.parallel([
        //function(callback){models.Users.findById(req.params.id).exec(callback);},
        function(callback){aclPermissions.modifyUsers(req, res, callback);},   //aclPermissions modifyUsers
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});}, //aclPermissions sideMenu
        function(callback){aclPermissions.modifyStudent(req, res, callback);}   //aclPermissions modifyUsers

    ],function(err, results){

        if (req.session.user.userRoleID) {         // if it is a user from "User" database
            var title = 'Add Photo';
        } else {                                        // if it is a user from "ParentSelfRegistration" database
            var title = 'Parent registration Step2';
        }

        if(req.session.user.redirect == 'showStudents'){ //if photo to update is from a Student
            var userType = 'Students';
            var aclType = results[2];

        }else {                                          //if photo to update is from a User
            var userType = 'Users';
            //var aclType = results[0];
        }

        var iPad = false;
        var md = new MobileDetect(req.headers['user-agent']);
        if(md.is('iPad') == true)
            iPad = true;

        models[userType].findById(req.params.id, function (err, user) {
            res.render('photos/choosePhoto',{
                title: title,
                userToChangePhoto: user,
                userType: userType,
                iPad: iPad,
                aclModifyUsers: aclType, //aclPermissions modifyUsers
                aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        });

    })
};


module.exports.addUpdatePhotoPost = function (req, res){
    var locationType = 'public/temp/photosUsers/'; //if photo is from a user document
    var userType = 'Users';
    if(req.user.redirect == 'showStudents'){    //if photo is from a student document
        locationType = 'public/temp/photosStudents/';
        userType = 'Students';
    }

    var fields =[];
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        //res.writeHead(200, {'content-type': 'text/plain'});
        //res.write('received upload:\n\n');
        //console.log(util.inspect({fields: fields, files: files}));
    });

    //save user id from field value to "fields"
    form.on('field', function (field, value) {
        fields[field] = value;

        form.on('end', function(fields, files) {
            /* Temporary location of our uploaded file */
            var temp_path = this.openedFiles[0].path;
            /* The file name of the uploaded file */
            var file_name = this.openedFiles[0].name;
            /* Location where we want to copy the uploaded file */
            var new_location = locationType;
            /* Get file extension */
            var ext = path.extname(file_name); //returns->'ex: .BMP'

            if (this.openedFiles[0].name){ // if a file is selected do this
                models[userType].findById({'_id': field}, function(err, user){
                    var oldPhoto = user.photo;
                    var newUser = "";



                    //delete all Photos and other files in Student Photo folder before copy new photos
                    try { var filesToDelete = fs.readdirSync(locationType); }
                    catch(e) { return; }
                    if (filesToDelete.length > 0)
                        for (var x = 0; x < filesToDelete.length; x++) {
                            var fileP = locationType + filesToDelete[x];
                            if (fs.statSync(fileP).isFile())
                                fs.unlinkSync(fileP);
                            else
                                console.log("No files to Delete");
                        }
                    //-----------END of delete all Photos and other files in Student Photo folder before copy new photos



                    //save new file
                    fs.copy(temp_path, new_location + user.id + ext, function (err) { // save file
                        if (err) {
                            console.error(err);
                        } else {

                            user.photoTemp = user.id + ext; //save uploaded file name to user.photo
                            user.save(function (err) {
                                if(err)
                                    console.log('err - ',err);
                                else{
                                    console.log("success! saved " + file_name);
                                }
                            });
                        }
                        fs.unlink(temp_path, function (err) { //delete file from temp folder (unlink) -------
                            if (err) {
                                //return res.send(500, 'Something went wrong');
                            }
                        });//------------------------------#end - unlink

                        res.redirect('/photos/cropPhoto/' + user._id);
                    });




                });//--------end of user.photo

            } else { // if no file is selected delete temp file
                console.log('no files added');
                //delete file from temp folder-------
                fs.unlink(temp_path, function (err) {
                    if (err) {
                        return res.send(500, 'Something went wrong');
                    }
                });
                //------------------#end - unlink
            }
        });
    });
};
//-----------------------------------------end ADD or CHANGE user photo


// DELETE PHOTO------------------
module.exports.deletePhoto = function(req, res) {
    var new_location = 'public/photosUsers/'; //if photo is from a user document
    var userType = 'Users';
    if(req.user.redirect == 'showStudents'){    //if photo is from a student document
        new_location = 'public/photosStudents/';
        userType = 'Students';
    }


    models[userType].findById({'_id': req.params.id}, function(err, user){
        var photoToDelete = user.photo;
        if (fs.existsSync(new_location + photoToDelete) && photoToDelete !== "") { //delete old photo if exists
            fs.unlinkSync(new_location + photoToDelete);
            console.log('successfully deleted ' + photoToDelete);
        }
        user.photo = "";
        user.save(function (err) {
            if(err)
                console.log('err - ',err);
            else{
                if(userType == 'Users' && user.parent)
                    updateParentPhotoInStudentsDocument(user); //update photo in 'Students' document 'parentOf' field
                if(userType == 'Students' && user.parentOf.length >= 1)
                    updateParentPhotoInUsersDocument(user); //update photo in 'Students' document 'parentOf' field
            }
        });

        if(req.user.redirect == 'showUsers') {
            pushNotification.notifyUser(user, 'updateUserInfo'); //update user info on App
            res.redirect('/users/showUsers');
        }

        if(req.user.redirect == 'updateUser') {
            pushNotification.notifyUser(user, 'updateUserInfo'); //update user info on App
            res.redirect('/users/updateUser/' + user.id);
        }

        if(req.user.redirect == 'showStudents')
            res.redirect('/students/showStudents');
    });
};
//----------------end of DELETE PHOTO



module.exports.cropPhoto = function (req, res){
    async.parallel([
        //function(callback){models.Users.findById(req.params.id).exec(callback);},
        function(callback){aclPermissions.modifyUsers(req, res, callback);},   //aclPermissions modifyUsers
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});}, //aclPermissions sideMenu
        function(callback){aclPermissions.modifyStudent(req, res, callback);}   //aclPermissions modifyUsers

    ],function(err, results){

        if (req.session.user.userRoleID) {         // if it is a user from "User" database
            var title = 'Add Photo';
        } else {                                        // if it is a user from "ParentSelfRegistration" database
            var title = 'Parent registration Step2';
        }

        let userType,aclType,folder;
        if(req.session.user.redirect == 'showStudents'){ //if photo to update is from a Student
            userType = 'Students';
            aclType = results[2];
            folder = 'photosStudents';

        }else {                                          //if photo to update is from a User
            userType = 'Users';
            aclType = results[0];
            folder = 'photosUsers';
        }

        var iPad = false;
        var md = new MobileDetect(req.headers['user-agent']);
        if(md.is('iPad') == true)
            iPad = true;


        models[userType].findById(req.params.id, function (err, user) {
            console.log('user = ',user);
            res.render('photos/cropPhoto',{
                title: title,
                userToChangePhoto: user,
                userType: userType,
                iPad: iPad,
                folder: folder,
                aclModifyUsers: aclType, //aclPermissions modifyUsers
                aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        });

    })
};

module.exports.cropPhotoPost = function (req, res){
    let locationType = 'public/photosUsers/'; //if photo is from a user document
    let userType = 'Users';

    if(req.user.redirect == 'showStudents'){    //if photo is from a student document
        locationType = 'public/photosStudents/';
        userType = 'Students';
    }

    var img = req.body.base64;
    var userID = req.body.userID;


    var data = img.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');

    models[userType].findById({'_id': userID}, function(err, user){

        fs.writeFile(locationType + user.photoTemp, buf, function (err) {
            if (err) {
                console.error(err);
            } else {
                user.photo = user.photoTemp; //save uploaded file name to user.photo
                user.photoTemp = undefined;
                user.save(function (err) {
                    if(err)
                        console.log('err - ',err);
                    else{

                        if(userType == 'Users' && user.parent)
                            updateParentPhotoInStudentsDocument(user); //update photo in 'Students' document 'parentOf' field
                        if(userType == 'Students' && user.parentOf.length >= 1)
                            updateParentPhotoInUsersDocument(user); //update photo in 'Users' document 'parentOf' field

                    }
                });
                if(req.user.userRoleID){
                if(req.user.redirect == 'showUsers') {
                    res.send({redirect: '/users/showUsers'});
                    pushNotification.notifyUser(user, 'updateUserInfo'); //update user info on App
                }

                if(req.user.redirect == 'updateUser') {
                    res.send({redirect: '/users/updateUser/' + user.id});
                    pushNotification.notifyUser(user, 'updateUserInfo'); //update user info on App
                }
                if(req.user.redirect == 'registerParent')
                    res.send({redirect: '/login'});
                if(req.user.redirect == 'showStudents')
                    res.send({redirect: '/students/showStudents'});
                } else {
                    res.send({redirect: '/loginParents'});
                    //res.render('login', {error: "Registration completed"});
                }
                console.log("success! saved " + user.photo);

            }
        });
    });


};



module.exports.cleanOldPhotos = function (){
    async.parallel([
        function(callback){
            var arrayUsers = [];
            models.Users.find({},function(err,users){
                if(err) throw err;
                users.forEach(function(user){
                    if(user.photo !== '')
                        arrayUsers.push(user.photo)   ;
                });
                callback(null, arrayUsers);
            });
        },
        function(callback){
            fs.readdir('./public/photosUsers/',function(err,files){
                if(err) throw err;
                callback(null, files);
            });
        }
    ],function(err, results){
        var arrayUsersWithPhoto = results[0];
        var files = results[1];

        var diff = files.filter(function(x) { return arrayUsersWithPhoto.indexOf(x) < 0 });

        diff.forEach(function(fileToDelete){
            fs.unlinkSync('./public/photosUsers/' + fileToDelete);  //delete file
            console.log('successfully deleted ' + fileToDelete);
        });
    });
};


function updateParentPhotoInStudentsDocument(user){
    var studentIds = [];
    user.parentOf.forEach(function(student){
        studentIds.push(student.studentID);
    });

    models.Students.update({studentID: {$in: studentIds}, 'parentOf._id': user._id}, {'parentOf.$.parentPhoto': user.photo}, {multi: true}, function (err, user) {
        if(err)
            console.log('err - ',err);
        else{
            console.log('success updating photo in student parentOf');
        }
    });
};

function updateParentPhotoInUsersDocument(student){
    var parentIds = [];
    student.parentOf.forEach(function(user){
        parentIds.push(user._id);
    });

    models.Users.update({_id: {$in: parentIds}, 'parentOf.studentID': student.studentID}, {'parentOf.$.studentPhoto': student.photo}, {multi: true}, function (err, user) {
        if(err)
            console.log('err - ',err);
        else{
            console.log('success updating photo in user parentOf');
        }
    });
};