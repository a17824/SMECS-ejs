//Dependencies
var formidable = require('formidable');
var util = require('util');
var fs   = require('fs-extra');
var path = require('path');
var csv = require('./csv');
var models = require('./../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var moment = require('moment');

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
    var oldIfStudentHadParents = 0;
    var ifUserHasParents = 0;

    var studentToUpdate1 = req.body.studentToUpdate;
    var newParentArray = req.body.parentOf;

    async.waterfall([
        function (callback) {
            models.Students.findById({'_id': studentToUpdate1}, function(err, student){
                //Student check/add/update/delete Parents ---------------------
                if (typeof student.parentOf !== 'undefined' && student.parentOf.length > 0) {//if student had parents before this update
                    oldIfStudentHadParents = 1;
                }

                if (typeof newParentArray !== 'undefined' && newParentArray.length > 0) {//if student has parents
                    ifUserHasParents = 1;
                }
                var oldParentArray = [];
                var oldParentArrayStudentID =[];
                var addParentArray = [];
                if (ifUserHasParents == 1 || oldIfStudentHadParents == 1) {
                    if (typeof student.parentOf !== 'undefined' && student.parentOf.length > 0) {
                        // the array is defined and has at least one element
                        for (var i=0; i < student.parentOf.length; i++) {
                            oldParentArray.push(student.parentOf[i]._id);
                            oldParentArrayStudentID.push(student.parentOf[i]._id);
                        }
                    }
                    var parents = [];
                    if(ifUserHasParents == 0 && oldIfStudentHadParents == 1){
                        parents = oldParentArrayStudentID;
                    }else{
                        parents = newParentArray
                    }
                    student.parentOf = [];
                    models.Users.find({'_id': parents}, function (err, users) {
                        if(err){
                            console.log('err = ', err);
                        }else{
                            for (var i=0; i < users.length; i++) {
                                var user = {
                                    _id: users[i]._id,
                                    parentFirstName: users[i].firstName,
                                    parentLastName: users[i].lastName
                                };
                                console.log('users[i]');
                                //console.log(users[i]);

                                student.parentOf.push(user);
                                addParentArray.push(users[i]._id);

                                console.log('6666666 addParentArray');
                                //console.log(addParentArray);
                            }
                            if(ifUserHasParents == 0 && oldIfStudentHadParents == 1){
                                student.parentOf = undefined;
                            }
                            console.log('"parentOf" updated successfully');
                            callback(null, student, addParentArray, oldParentArray);
                        }
                    });
                }else{
                    student.parentOf = undefined;
                    callback(null, student, newParentArray, oldParentArray);
                }
                //--------------------- end of Student check/add/update/delete Parents
            });
        }
    ], function (err, student, addParentArray, oldParentArray) {
        console.log('333333333 newParentArray');

        student.studentID = req.body.studentID;
        student.firstName = req.body.firstName;
        student.lastName = req.body.lastName;
        student.photo = req.body.photo;
        student.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                return res.status(409).send('showAlert')
            }else{
                updateParentInUserDocument(req, student, newParentArray, oldParentArray);
                //addParentInUserDocument(req, student, newParentArray);
                //updateUserRole(req, newParentArray, oldParentArray);
                //updateParentInUserDocument(student);
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

        //If student has parent(s), deletes user(parentOf) from Users document  or deletes user------------------

        models.Users.find({'parentOf.studentID': student.studentID}, function(err, users) {
            if(err){
                console.log('err - deleting user from Users document');
            }
            users.forEach(function(user){
                if(user.parentOf && user.parentOf.length > 1){
                    for (var z = 0; z < user.parentOf.length; z++) {
                        if(user.parentOf[z].studentID == student.studentID){
                            user.parentOf.splice(z,1);
                            console.log('success - removing user child');
                            break;
                        }
                    }
                }

                if(user.parentOf && user.parentOf.length < 2 && user.userRoleID.length > 1){
                    for (var z = 0; z < user.parentOf.length; z++) {
                        if(user.parentOf[z].studentID == student.studentID){
                            user.parentOf = undefined;
                            updateUserRole(user);
                            console.log('success - removing user child');
                            break;
                        }
                    }
                }

                if(user.parentOf && user.parentOf.length < 2 && user.userRoleID.length < 2){
                    user.remove();
                    console.log('success - user removed');
                }
                user.save();
            });
        });
        //----------end of If user is parent, deletes user(parentOf) from Student document --------------

        models.Students.remove({'_id': studentToDelete}, function(err) {
            if(err){
                console.log('err - ',err);
            }
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

//Function to delete parent in Student database --------------------
function deleteParentInUserDocument(student, newParentArray, oldParentArray) {
    console.log('11111111newParentArray');
    //console.log(newParentArray);
    console.log('11111111oldParentArray');
    //console.log(oldParentArray);


}
//-------------- end of Function to delete parent in Student database

function updateParentInUserDocument(req, student, newParentArray, oldParentArray) {
    var parent = {
        studentID: student.studentID,
        studentFirstName: student.firstName,
        studentLastName: student.lastName
    };
    async.waterfall([
        function (callback) {

        //ADDING student to parent.of of User collection ---------
            models.Users.find({'_id': newParentArray}, function (err, users) {
                if (err) {
                    console.log('error finding users to add');
                } else {
                    users.forEach(function (user) {
                        var parentAlreadyExists = 0;
                        for(var z=0; z < user.parentOf.length; z++){
                            if(user.parentOf[z].studentID == parent.studentID){
                                parentAlreadyExists = 1;
                                break;
                            }
                        }
                        if(parentAlreadyExists == 0){
                            user.parentOf.push(parent);
                        }
                        user.save();
                    });
                }
                console.log('Finished -> adding student to parentOf document of User Collection');
                callback(null);
            });
            //--------end of ADDING student to parent.of of User collection

        },
        function (callback) {
            //Building arrayParentsToDelete ------
            var arrayParentsToDelete = [];
            var flagExists = 0;
            for (var i=0; i < oldParentArray.length; i++) {
                flagExists = 0;
                if(newParentArray){
                    for (var x=0; x < newParentArray.length; x++) {
                        if (newParentArray[x] == oldParentArray[i]){
                            flagExists = 1;
                            break;
                        }
                    }
                }
                if (flagExists == 0){
                    arrayParentsToDelete.push(oldParentArray[i]);
                }
            }
            //------ end of Building arrayParentsToDelete

            callback(null, arrayParentsToDelete);
        },
        function (arrayParentsToDelete, callback) {
            //DELETING student from parent.of of User collection -------
            console.log('arrayParentsToDelete = ',arrayParentsToDelete);
            if (arrayParentsToDelete.length < 1 ){
                console.log('No parents from Users collection to delete');
                callback(null);
            } else {
                console.log('B2 START)');
                models.Users.find({ '_id': arrayParentsToDelete }, function(err, users) {
                    if (err) {
                        console.log('error finding users to delete');
                    } else {
                        users.forEach(function (user) {
                            console.log('5)');
                            for(var z=0; z < user.parentOf.length; z++){
                                var index = z;
                                if(user.parentOf[z].studentID == parent.studentID){

                                    // If user has more than 1 child
                                    if(user.parentOf && user.parentOf.length > 1){
                                        console.log('7 start)',user.firstName);
                                        user.parentOf.splice(index,1);
                                        console.log('7 end)');
                                    }
                                    // If user only has 1 child and one only parent role
                                    if(user.parentOf && user.parentOf.length < 2 && user.userRoleID.length < 2){
                                        console.log('8 start)',user.firstName);
                                        var whoDeleted = req.session.user.firstName + " " + req.session.user.lastName;
                                        var wrapped = moment(new Date());
                                        user.softDeleted = wrapped.format('YYYY-MM-DD, h:mm:ss a') + "  by " + whoDeleted;
                                        console.log('8 end)');
                                    }
                                    // If user only has 1 child and more than one role
                                    if(user.parentOf && user.parentOf.length < 2 && user.userRoleID.length > 1){
                                        console.log('9 start)',user.firstName);
                                        user.parentOf = undefined;
                                        updateUserRole(user);
                                        console.log('9 end)');
                                    }



                                    console.log('before deleting - user.firstName = ',user.firstName);
                                    user.save();
                                    console.log('after deleting - user.firstName = ',user.firstName);
                                    break;
                                }
                            }
                        });
                    }
                    console.log('Finished -> deleting student to parentOf document of User Collection');
                    //callback2
                    callback(null);
                });
            }
            //end of DELETING student from parent.of of User collection -------
        },
        function (callback) {
            //UPDATE user role and softDeleted documents in User collection
            console.log('1-START role update)');
            callback(null);
        }
    ], function (err) {
        console.log('2-START role update)');
    });



}
function updateUserRole(user) {
    for (var z = 0; z < user.userRoleID.length; z++) {
        var index = z;
        if (user.userRoleID[z] == 98) {
            user.userRoleID.splice(index, 1);
            user.userRoleName.splice(index, 1);
            console.log('success - updating user role');
        }
    }
}


//Function for  MULTI STUDENTS -> add parents to Student Collection or delete parents from Users collection --
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
                                                        console.log('2) successfully saved');
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
/*
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
*/
//-------------- end of Function to update user child in user document