//Dependencies
var formidable = require('formidable');
var util = require('util');
var fs   = require('fs-extra');
var path = require('path');
var csv = require('./csv');
var models = require('./../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');


/* SHOW ALL STUDENTS. */
module.exports.show = function(req, res, next) {
/*
    models.Students.find(function(err, students) {
        //res.json(students);
        console.log("blu blu blu blu");
        res.render('students/showStudents', { title: 'STUDENTS', students: students });
    }).sort({"firstName":1});
*/
    async.parallel([
        function(callback){
            models.Students.find().sort({"firstName":1}).exec(callback);
        },
        function(callback){aclPermissions.addStudent(req, res, callback);},   //aclPermissions addStudent
        function(callback){aclPermissions.addMultiStudent(req, res, callback);},   //aclPermissions addMultiStudent
        function(callback){aclPermissions.modifyStudent(req, res, callback);}, //aclPermissions modifyStudent
        function(callback){aclPermissions.deleteStudent(req, res, callback);} //aclPermissions deleteStudent


    ],function(err, results){
        //console.log(results[2]);
        res.render('students/showStudents',{
            title:'STUDENTS',
            students: results[0],
            aclAddStudent: results[1], //aclPermissions addStudent
            aclAddMultiStudent: results[2], //aclPermissions addMultiStudent
            aclModifyStudent: results[3],  //aclPermissions modifyStudent
            aclDeleteStudent: results[4]  //aclPermissions deleteStudent

        });
    })
};

/* ADD STUDENT. -------------------------------*/
module.exports.add = function(req, res) {
    //res.render('students/addStudent', { title: 'ADD STUDENT'});

    async.parallel([
        function(callback){aclPermissions.addStudent(req, res, callback);}   //aclPermissions addStudent

    ],function(err, results){
        res.render('students/addStudent',{
            title:'ADD STUDENT',
            aclAddStudent: results[0] //aclPermissions addStudent
        });
    })
};
module.exports.addPost = function(req, res) {
    //console.log(req.body.roleID);
    var student1 = new models.Students({
        studentID: req.body.studentID,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        photo: req.body.photo
    });
    student1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            console.log("rrrrrrrrrrrrrrrrrrrrrrrrrr");
            return res.status(409).send('showAlert')
        }else{
            //console.log("11111111111111111111");
            return res.send({redirect:'/students/showStudents'})
        }
    });
};
/* -------------------------------end of ADD STUDENT. */

//  ADD MULTIPLE STUDENTS--------------
module.exports.addMultiple = function (req, res){
    res.render('students/addMultiStudents', { title: 'ADD MULTIPLE STUDENTS'});
};
module.exports.addMultiplePost = function (req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        console.log(util.inspect({fields: fields, files: files}));
    });
    form.on('end', function(fields, files) {
        /* Temporary location of our uploaded file */
        var temp_path = this.openedFiles[0].path;
        /* The file name of the uploaded file */
        var file_name = this.openedFiles[0].name;
        /* Location where we want to copy the uploaded file */
        var new_location = 'public/csvFiles/';

        if (this.openedFiles[0].name){ // if a file is selected do this

            //delete all Photos and other files in Student Photo folder before copy new photos
            if (this.openedFiles[0].name) {// if a file is selected do this
                var photos_location = 'public/photosStudents/';
                try { var filesToDelete = fs.readdirSync(photos_location); }
                catch(e) { return; }
                if (filesToDelete.length > 0)
                    for (var x = 0; x < filesToDelete.length; x++) {
                        var fileP = photos_location + filesToDelete[x];
                        if (fs.statSync(fileP).isFile())
                            fs.unlinkSync(fileP);
                        else
                            console.log("No files to Delete");
                    }
            } //-----------END of delete all Photos and other files in Student Photo folder before copy new photos


            //delete all old Students database
            models.Students.count(function(err, count) {

                if (count !== 0) {
                    models.Students.remove({}, function (err, numberRemoved) {
                        console.log("inside remove call back" + numberRemoved);
                    });
                }
                //if old Students database don't exits or has been deleted, then save new file
                fs.copy(temp_path, new_location + file_name, function (err) { // save file
                    if (err) {
                        console.error(err);
                    } else {
                        var csvHeaders = {
                            Students: {
                                headers: ['firstName', 'lastName', 'studentID', 'photo']
                            }
                        }
                        csv.importFile(new_location + file_name, csvHeaders.Students.headers, 'Students');

                    }
                    fs.unlink(temp_path, function (err) { //delete file from temp folder (unlink) -------
                        if (err) {
                            //return res.send(500, 'Something went wrong');
                        }
                    });//------------------------------#end - unlink
                    res.redirect('/students/showStudents');
                })

            });
            //--------end of ADD MULTI STUDENT

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
};
//-----------end ADD MULTIPLE STUDENTS

/* UPDATE STUDENTS. -------------------------------*/
module.exports.update = function(req, res) {
    async.parallel([
        function(callback){
            models.Students.findById(req.params.id).exec(callback);
        },
        function(callback){aclPermissions.modifyStudent(req, res, callback);} //aclPermissions modifyStudent

    ],function(err, results){
        res.render('students/updateStudent',{
            title:'Update Student',
            students: results[0],
            aclModifyStudent: results[1]  //aclPermissions modifyStudent
        });
    })
};
module.exports.updatePost = function(req, res) {
    var studentToUpdate1 = req.body.studentToUpdate;
    //console.log(req.body.userRoleID);
    models.Students.findById({'_id': studentToUpdate1}, function(err, student){
        student.studentID = req.body.studentID;
        student.firstName = req.body.firstName;
        student.lastName = req.body.lastName;
        student.photo = req.body.photo;
        student.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                console.log("rrrrrrrrrrrrrrrrrrrrrrrrrr");
                return res.status(409).send('showAlert')
            }else{
                //console.log("11111111111111111111");
                return res.send({redirect:'/students/showStudents'})
            }
        });
    });

};
/*---------------------------------------------------------------end of update students*/

/* DELETE STUDENT. */
module.exports.delete = function(req, res) {
    var studentToDelete = req.params.id;
    // delete photo before delete user----------------
    models.Students.findById({'_id': studentToDelete}, function(err, student) {
        var newStudent = "";
        var photo = student.photo;
        var path = './public/photosStudents/' + photo;
        console.log(photo);
        if (photo != newStudent) { //delete old photo if exists

            fs.access(path, function(err) {
                if (!err) {
                    console.log('mmmmmmmm');
                    fs.unlinkSync('./public/photosStudents/' + photo);
                    console.log('successfully deleted ' + photo);
                } else {
                    console.log('file not found: ' + photo);
                }
            });



        }// ------------end delete photo before delete user

        models.Students.remove({'_id': studentToDelete}, function(err) {
            //res.send((err === null) ? { msg: 'User not deleted' } : { msg:'error: ' + err });
            res.redirect('/students/showStudents');
            console.log('successfully deleted student');
        });
    })
};
/* ------------ end of DELETE STUDENT. */

// show STUDENT photo-------------------------------
module.exports.showPhoto = function(req, res) {
    models.Students.findById(req.params.id,function(error, student) {
        res.render('students/showPhoto', { title: 'Student Photo', students: student });
    });
};
// -----------------------------end show STUDENT photo

//--ADD or CHANGE STUDENT photo -------------------------------------
module.exports.addUpdatePhoto = function (req, res){
    models.Students.findById(req.params.id,function(error, student) {
        res.render('students/addPhoto', { title: 'ADD PHOTO', student: student });
    });
};
module.exports.addUpdatePhotoPost = function (req, res){
    var fields =[];
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        console.log(util.inspect({fields: fields, files: files}));
    });

    //save student id from field value to "fields"
    form.on('field', function (field, value) {
        //console.log(field);
        //console.log(value);
        fields[field] = value;

        form.on('end', function(fields, files) {
            /* Temporary location of our uploaded file */
            var temp_path = this.openedFiles[0].path;
            /* The file name of the uploaded file */
            var file_name = this.openedFiles[0].name;
            /* Location where we want to copy the uploaded file */
            var new_location = 'public/photosStudents/';

            if (this.openedFiles[0].name){ // if a file is selected do this
                models.Students.findById({'_id': field}, function(err, student){
                    var oldPhoto = student.photo;
                    var newStudent = "";
                    if ((file_name != oldPhoto) && (oldPhoto != newStudent )) { //delete old photo if exists
                        fs.unlinkSync(new_location + oldPhoto);
                        console.log('successfully deleted ' + oldPhoto);
                    }
                    //if old photo doesn't exits or has been deleted, save new file
                    fs.copy(temp_path, new_location + file_name, function (err) { // save file
                        if (err) {
                            console.error(err);
                        } else {
                            student.photo = file_name; //save uploaded file name to user.photo
                            student.save()
                            console.log("success! saved " + file_name);
                        }
                        fs.unlink(temp_path, function (err) { //delete file from temp folder (unlink) -------
                            if (err) {
                                //return res.send(500, 'Something went wrong');
                            }
                        });//------------------------------#end - unlink
                        res.redirect('/students/showStudents');
                    })
                });//--------end of student.photo
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
//-----------------------------------------end of ADD or CHANGE STUDENT photo


// ADD MULTIPLE PHOTOS AND DELETE ALL OLD PHOTOS IN STUDENTS PHOTOS FOLDER--------------
module.exports.addMultiplePhotos = function (req, res){
    res.render('students/addMultiImage', { title: 'ADD MULTIPLE PHOTOS'});
};

//var io = require('socket.io');
module.exports.addMultiplePhotosPost = function (req, res){

    models.Students.find(function (err, result) {

        var form = new formidable.IncomingForm();

        form.multiples = true;

        form.parse(req, function(err, fields, files) {
            //console.log(util.inspect({fields: fields, files: files}));
        });

        form.on('progress', function(bytesReceived, bytesExpected) {
            var percent_complete = (bytesReceived / bytesExpected) * 100;
            console.log(percent_complete.toFixed(2));
            //io.sockets.emit('uploadProgress', ((bytesReceived * 100)/bytesExpected));
        });

        form.on('end', function(fields, files) {
            var new_location = 'public/photosStudents/'; // Location where we want to copy the uploaded file

            //delete all Photos and other files in Student Photo folder before copy new photos
            if (this.openedFiles[0].name) {// if a file is selected do this
                try { var filesToDelete = fs.readdirSync(new_location); }
                catch(e) { return; }
                if (filesToDelete.length > 0)
                    for (var x = 0; x < filesToDelete.length; x++) {
                        var fileP = new_location + filesToDelete[x];
                        if (fs.statSync(fileP).isFile())
                            fs.unlinkSync(fileP);
                        else
                            console.log("No files to Delete");
                    }
            } //-----------END of delete all Photos and other files in Student Photo folder before copy new photos

            for(var i = 0; i < this.openedFiles.length; i++) {
                var temp_path = this.openedFiles[i].path; // Temporary location of our uploaded file
                var file_name = this.openedFiles[i].name; // The file name of the uploaded file

                var file_name_no_ext = file_name.replace(/\.[^/.]+$/, ""); // removes extension

                if (this.openedFiles[0].name) {// if a file is selected do this

                    fs.copySync(temp_path, new_location + file_name); // save file
                    fs.unlinkSync(temp_path, function (err) { //delete file from temp folder (unlink) -------
                        if (err) {
                            //return res.send(500, 'Something went wrong');
                        }
                    });//------------------------------#end - unlink
                }else { // if no file is selected delete temp file
                    console.log('no files added');
                    //delete file from temp folder-------
                    fs.unlink(temp_path, function (err) {
                        if (err) {
                            return res.send(500, 'Something went wrong');
                        }
                    });
                    //------------------#end - unlink
                }

                for(var x = 0; x < result.length; x++) {

                    if (err) {
                        console.log(err)
                    }

                    if (!result) {
                        //console.log(result);
                        console.log("No Student found");
                    }

                    if ( result[x].studentID == file_name_no_ext ) {
                        console.log('file_name = ' + file_name);
                        console.log('result[x].studentID = ' + result[x].studentID);
                        result[x].photo = file_name; //save uploaded file name to user.photo
                        result[x].save();
                        console.log("success! saved " + file_name);
                    }

                }

            }
        });
        res.redirect('/students/showStudents');

    });
};
//-----------end Batch Upload photos


// delete STUDENT photo------------------
module.exports.deletePhoto = function(req, res) {
    var new_location = 'public/photosStudents/';
    models.Students.findById({'_id': req.params.id}, function(err, student){
        var photoToDelete = student.photo;
        if (fs.existsSync(new_location + photoToDelete)) { //delete old photo if exists
            fs.unlinkSync(new_location + photoToDelete);
            console.log('successfully deleted ' + photoToDelete);
        }
        student.photo = "";
        student.save()
        res.redirect('/students/showStudents');
    });
};
//----------------end delete STUDENT photo
