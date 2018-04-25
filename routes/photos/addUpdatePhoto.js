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
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){

        if (req.session.user.userPrivilegeID) {         // if it is a user from "User" database
            var title = 'Add Photo';
        } else {                                        // if it is a user from "ParentSelfRegistration" database
            var title = 'Parent registration Step2';
        }
        models.Users.findById(req.params.id, function (err, user) {
            console.log('user = ',user);
            res.render('photos/addPhoto',{
                title: title,
                user: user,
                aclModifyUsers: results[0], //aclPermissions modifyUsers
                aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        });
    })
};


module.exports.addUpdatePhotoPost = function (req, res){
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
            var new_location = 'public/photosUsers/';

            if (this.openedFiles[0].name){ // if a file is selected do this
                models.Users.findById({'_id': field}, function(err, user){
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
                            if(req.user.redirect == 'showUsers')
                                res.redirect('/users/showUsers');
                            if(req.user.redirect == 'updateUser')
                                res.redirect('/users/updateUser/' + user.id);
                        } else if(err.code == 'ENOENT') { // file does not exist

                            //save new file
                            fs.copy(temp_path, new_location + user.id + '_' + file_name, function (err) { // save file
                                if (err) {
                                    console.error(err);
                                } else {
                                    user.photo = user.id + '_' + file_name; //save uploaded file name to user.photo
                                    user.save();
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

module.exports.cleanOldPhotos = function (){
    async.parallel([
        function(callback){
            var arrayUsers = [];
            models.Users.find({},function(err,users){
                if(err) throw err;
                users.forEach(function(user){
                    arrayUsers.push(user._id)   ;
                });
                callback(null, arrayUsers);
            });
        },
        function(callback){
            var arrayPhotos = [];
            fs.readdir('./public/photosUsers/',function(err,files){
                if(err) throw err;
                files.forEach(function(file){
                    var field = file.split('_')[0];
                    arrayPhotos.push(field);
                });
                callback(null, arrayPhotos, files);
            });
        }
    ],function(err, results){
        var arrayUsers = results[0];
        var arrayPhotos = results[1][0];
        var files = results[1][1];

        var flagExists = 0;
        for (var i=0; i < arrayPhotos.length; i++) {
            flagExists = 0;
            for (var x=0; x < arrayUsers.length; x++) {
                if (arrayPhotos[i] == arrayUsers[x]){
                    flagExists = 1;
                    break;
                }
            }
            if (flagExists == 0){   //if enters inside this if, then its to delete the file
                files.forEach(function(file){
                    var field = file.split('_')[0];
                    if(field == arrayPhotos[i]) {
                        fs.unlinkSync('./public/photosUsers/' + file);  //delete file
                        console.log('successfully deleted ' + file);
                        }
                });
            }
        }
    });
};