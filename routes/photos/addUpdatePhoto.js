//Dependencies
var formidable = require('formidable');
var fs   = require('fs-extra');
var models = require('../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var functions = require('./../functions');

//--ADD or UPDATE user photo -------------------------------------
module.exports.addUpdatePhoto = function (req, res){
    async.parallel([
        //function(callback){models.Users.findById(req.params.id).exec(callback);},
        function(callback){aclPermissions.modifyUsers(req, res, callback);},   //aclPermissions modifyUsers
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});}, //aclPermissions sideMenu
        function(callback){aclPermissions.modifyStudent(req, res, callback);}   //aclPermissions modifyUsers

    ],function(err, results){

        if (req.session.user.userPrivilegeID) {         // if it is a user from "User" database
            var title = 'Add Photo';
        } else {                                        // if it is a user from "ParentSelfRegistration" database
            var title = 'Parent registration Step2';
        }

        if(req.session.user.redirect == 'showStudents'){ //if photo to update is from a Student
            var userType = 'Students';
            var aclType = results[2];

        }else {                                          //if photo to update is from a User
            var userType = 'Users';
            var aclType = results[0];
        }

        models[userType].findById(req.params.id, function (err, user) {
            res.render('photos/addPhoto',{
                title: title,
                user: user,
                userType: userType,
                aclModifyUsers: aclType, //aclPermissions modifyUsers
                aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        });

    })
};


module.exports.addUpdatePhotoPost = function (req, res){
    var locationType = 'public/photosUsers/'; //if photo is from a user document
    var userType = 'Users';
    if(req.user.redirect == 'showStudents'){    //if photo is from a student document
        locationType = 'public/photosStudents/';
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

            if (this.openedFiles[0].name){ // if a file is selected do this
                models[userType].findById({'_id': field}, function(err, user){
                    var oldPhoto = user.photo;
                    var newUser = "";



                    //check if old file exists in public\photosUsers
                    fs.stat(new_location + oldPhoto, function(err, stat) {
                        if(err == null) {
                            console.log('Old Photo File exists');
                            if (oldPhoto) {
                                if ((user.id + '_' + file_name != oldPhoto) && (oldPhoto != newUser)) { //delete old photo if exists
                                    fs.unlinkSync(new_location + oldPhoto);
                                    console.log('successfully deleted ' + oldPhoto);
                                }}

                        } else if(err.code == 'ENOENT') { // file does not exist


                        } else {
                            console.log('Some other error: ', err.code);
                        }
                    });


                    //check if new file exists in public\photosUsers
                    fs.stat(new_location + user.id + '_' + file_name, function(err, stat) {
                        if(err == null) {
                            console.log('File exists');
                            if(req.user.redirect == 'showUsers' ||
                                req.user.redirect == 'showParents' ||
                                req.user.redirect == 'showExternal')
                                res.redirect('/users/showUsers');
                            if(req.user.redirect == 'updateUser')
                                res.redirect('/users/updateUser/' + user.id);
                            if(req.user.redirect == 'showStudents')
                                res.redirect('/students/showStudents');

                        } else if(err.code == 'ENOENT') { // file does not exist

                            //save new file
                            fs.copy(temp_path, new_location + user.id + '_' + file_name, function (err) { // save file
                                if (err) {
                                    console.error(err);
                                } else {
                                    user.photo = user.id + '_' + file_name; //save uploaded file name to user.photo
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



                                    console.log("success! saved " + file_name);
                                }
                                fs.unlink(temp_path, function (err) { //delete file from temp folder (unlink) -------
                                    if (err) {
                                        //return res.send(500, 'Something went wrong');
                                    }
                                });//------------------------------#end - unlink
                                if(req.user.redirect == 'showUsers')
                                    res.redirect('/users/showUsers');
                                if(req.user.redirect == 'updateUser')
                                    res.redirect('/users/updateUser/' + user.id);
                                if(req.user.redirect == 'registerParent')
                                    res.redirect('/login');
                                if(req.user.redirect == 'showStudents')
                                    res.redirect('/students/showStudents');
                            });

                        } else {
                            console.log('Some other error: ', err.code);
                        }
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

        if(req.user.redirect == 'showUsers')
            res.redirect('/users/showUsers');
        if(req.user.redirect == 'updateUser')
            res.redirect('/users/updateUser/' + user.id);
        if(req.user.redirect == 'showStudents')
            res.redirect('/students/showStudents');
    });
};
//----------------end of DELETE PHOTO


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