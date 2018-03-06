//Dependencies
var formidable = require('formidable');
var util = require('util');
var fs   = require('fs-extra');
var path = require('path');
var csv = require('./csv');
var models = require('./../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var usersJs = require('./users.js');


/* SHOW ALL STUDENTS. */
module.exports.show = function(req, res, next) {
    //this should be after -> console.log("OuterLoopFinished");
    console.log('Process Finished');
    models.Students.find({'parentOf': {$size: 0}}, function (err, students) {
        students.forEach(function (student) {
            student.parentOf = undefined;
            student.save(function (err) {
                if (err) {
                    return res.status(409).send('showAlert')
                } else {
                    console.log('successfully removed empty parentOf array');
                }
            });

        });
    });
    //end of---- this should be after -> console.log("OuterLoopFinished");

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
    var parent = [];
    async.waterfall([
        function (callback) {
            var student1 = new models.Students({
                studentID: req.body.studentID,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                photo: req.body.photo,
                parentOf: parent
            });
            if(student1.parentOf.length < 1){
                student1.parentOf = undefined;
            }
            callback(null, student1);
        }
    ], function (err, student1) {
        student1.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                return res.status(409).send('showAlert')
            }else{
                return res.send({redirect:'/students/showStudents'});
            }
        });
    });
};/* -------------------------------end of ADD STUDENT. */



//  ADD MULTIPLE STUDENTS--------------
module.exports.addMultiple = function (req, res){
    res.render('students/addMultiStudents', { title: 'ADD MULTIPLE STUDENTS'});
};
module.exports.addMultiplePost = function (req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        //console.log(util.inspect({fields: fields, files: files}));
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

            function removeStudentsAndCopyNewStudents (callback) {
                //delete all old Students database
                models.Students.remove({}, function (err, numberRemoved) {
                    if (err) {
                        console.log('err = ', err);
                    } else {
                        //if old Students database don't exits or has been deleted, then save new file
                        fs.copy(temp_path, new_location + file_name, function (err) { // save file
                            if (err) {
                                console.error(err);
                            } else {
                                var csvHeaders = {
                                    Students: {
                                        headers: ['firstName', 'lastName', 'studentID', 'photo']
                                    }
                                };
                                csv.importFile(new_location + file_name, csvHeaders.Students.headers, 'Students');
                            }
                            fs.unlink(temp_path, function (err) { //delete file from temp folder (unlink) -------
                                if (err) {
                                    return res.send(500, 'Something went wrong');
                                }
                                callback('now is the time to run something else...');
                            });//------------------------------#end - unlink
                        });
                    }
                });
                //--------end of ADD MULTI STUDENT
            }
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
        removeStudentsAndCopyNewStudents (function (result, err) {
            if(err){
                console.log('err = ', err);
            }else{
                //console.log('result = ', result); //callback('now is the time to run something else...')
                addDeleteStudentsParents(res);
                setTimeout(function(){
                    res.redirect('/students/showStudents');
                }, 5000);
            }
        });
    });
    //-----------end ADD MULTIPLE STUDENTS
};



/* UPDATE STUDENTS. -------------------------------*/
module.exports.update = function(req, res) {
    async.parallel([
        function(callback){
            models.Students.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.Users.find({'parentOf.0': { "$exists": true }, 'softDeleted': null }).sort({"firstName":1}).exec(callback);
        },
        function(callback){aclPermissions.modifyStudent(req, res, callback);} //aclPermissions modifyStudent

    ],function(err, results){
        var parentsIdArray = [];
        results[0].parentOf.forEach(function (parent) {
            parentsIdArray.push(parent._id);
        });

        res.render('students/updateStudent',{
            title:'Update Student',
            students: results[0],
            users: results[1],
            parentsIdArray: parentsIdArray,//student that has parents. This array contains their parents ID (user._id)
            aclModifyStudent: results[2]  //aclPermissions modifyStudent
        });
    })
};
module.exports.updatePost = function(req, res) {
    var studentToUpdate1 = req.body.studentToUpdate;
    models.Students.findById({'_id': studentToUpdate1}, function(err, student){
        student.studentID = req.body.studentID;
        student.firstName = req.body.firstName;
        student.lastName = req.body.lastName;
        student.photo = req.body.photo;
        if(student.parentOf.length < 1){
            student.parentOf = undefined;
        }
        student.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                return res.status(409).send('showAlert')
            }else{
                updateParentInUserDocument(student);
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
                    fs.unlinkSync('./public/photosStudents/' + photo);
                    console.log('successfully deleted ' + photo);
                } else {
                    console.log('file not found: ' + photo);
                }
            });



        }// ------------end delete photo before delete user

        //If student has parent(s), deletes user(parentOf) from Users document ------------------------------
        if(student.parentOf.length > 0) {

            var arrayToDelete = [];
            for (var i = 0; i < student.parentOf.length; i++) {
                arrayToDelete.push(student.parentOf[i]._id)
            }
            //if user is only parent of this student, then deletes user
            models.Users.remove({'_id': arrayToDelete, 'parentOf.1': { "$exists": false }}, function(err) {
                if(err){
                    console.log('err - deleting user from Users document');
                }
                console.log('successfully deleted user from Users document');
            });
            //if user is parent of 2 or more studesnts, then delete only this student from User parentOf document
            models.Users.update({'_id': arrayToDelete, 'parentOf.1': { "$exists": true } }, {$pull: {"parentOf": {"_id": student._id}}}, {
                safe: true,
                multi: true
            }, function (err) {
                if (err) {
                    console.log('err - finding students from student._id');
                }
                console.log('successfully deleted parent from Users document');
            });
        }
        //----------end of If user is parent, deletes user(parentOf) from Student document --------------

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
        student.save();
        res.redirect('/students/showStudents');
    });
};
//----------------end delete STUDENT photo



//Function to add parents to Student Collection or delete parents from Users collection --------------------
function addDeleteStudentsParents(res) {
    models.Users.find({'parentOf.0': { "$exists": true } }, function (err, users) {
        if (err) {
            console.log('err - finding parents');
        }else{
            async.eachSeries(users, function (user, callback) { //loop through array
                var parent = {
                    _id: user._id,
                    parentFirstName: user.firstName,
                    parentLastName: user.lastName
                };
                async.eachSeries(user.parentOf, function (child, callback1) { //loop through array
                    if (!child) {
                        console.log('child undefined');
                    }else{
                        models.Students.findOneAndUpdate({'studentID': child.studentID},
                            {"$push": {"parentOf": parent}},
                            {"new": true},
                            function (err, foundStudent) {
                                console.log('0- foundStudent = ',foundStudent);
                                console.log('0- child.studentID) ' + child.studentID + ' ' + child.studentFirstName + ' ' + child.studentLastName);
                                if (err) {
                                    console.log('student not updated successfully');
                                    throw err;
                                } else {
                                    if (!foundStudent) { //if student doesn't exits, checks users collection
                                        if (user.userRoleID.length < 2 && user.parentOf.length < 2) { //delete user if user is parent of only 1 student and that student doesn't exits anymore.
                                            console.log('1) user ' + user.firstName + ' ' + user.lastName + ' removed from Users collection = ' );
                                            user.remove();
                                        }
                                        else {
                                            console.log('AAAAAAAAAAA');
                                            console.log('user.firstName = ',user.firstName );
                                            console.log('user.userRoleID.length = ',user.userRoleID.length );
                                            console.log('user.parentOf.length = ',user.parentOf.length );
                                            console.log('AAAAAAAAAAA');
                                            //if user has more than one role and has only one child -> removes parent role and child
                                            if (user.userRoleID.length > 1 && user.parentOf.length < 2) {
                                                console.log('2) BBBBBBBBBBBBBBBBBBBBBBB');
                                                child.remove();
                                                //removes userRoleID and userRoleName
                                                for (var z = 0; z < user.userRoleID.length; z++) {
                                                    console.log('2) cccccc');
                                                    var index = z;
                                                    if (user.userRoleID[z] == 98 ){
                                                        console.log('user.userRoleID before = ',user.userRoleID);
                                                        user.userRoleID.splice(index,1);
                                                        user.userRoleName.splice(index,1);
                                                        console.log('user.userRoleID after = ',user.userRoleID);
                                                        user.save(function (err) {
                                                            if (err) {
                                                                console.log('error removing student removed from user parentOf database = ');
                                                            } else {
                                                                console.log('2) successfully saved');
                                                            }
                                                        });
                                                    }
                                                    console.log('2) cccccc');
                                                }
                                                console.log('2) BBBBBBBBBBBBBBBBBBBBBBB');
                                            }else{ //if user is parent of more than 1 student deletes only the student that doesn't exists
                                                console.log('3) child ' + child.studentFirstName + ' ' + child.studentLastName +
                                                    ' removed from ' + user.firstName + ' ' + user.lastName + ' document');
                                                child.remove();
                                                user.save(function (err) {
                                                    if (err) {
                                                        console.log('error removing student removed from user parentOf database = ');
                                                    } else {
                                                        console.log('3) successfully saved');
                                                    }
                                                });
                                            }


                                        }
                                    }else{
                                        console.log('4) ' + user.firstName + ' ' + user.lastName + ' added to ' +
                                            child.studentFirstName + ' ' + child.studentLastName + ' as his/her parent.');
                                    }
                                }
                            });

                    }
                    callback1();
                },function (err) {
                    //console.log("InnerLoopFinished");
                    callback();
                });
            }, function (err) {
                console.log("OuterLoopFinished");
                //res.redirect('/students/showStudents');
            });
        }
    });
}
//Function to update user child in user document --------------------
function updateParentInUserDocument(student) {

    var parent = {
        studentID: student.studentID,
        studentFirstName: student.firstName,
        studentLastName: student.lastName
    };
    models.Users.find({'parentOf.studentID': student.studentID}, function (err, users) {
        if(err){
            console.log('user not updated successfully');
            throw err;
        }else {
            users.forEach(function (user) {
                for (var i = 0; i < user.parentOf.length; i++) {
                    if (user.parentOf[i].studentID == student.studentID) {
                        user.parentOf[i] = parent;
                        user.save(function (err) {
                            if (err) {
                                console.log('error updating user.parentOf document');
                            } else {
                                console.log('"parentOf" UPDATED successfully on USER database');
                            }
                        });
                    }
                }
            });
        }
    });
}
//-------------- end of Function to update user child in user document