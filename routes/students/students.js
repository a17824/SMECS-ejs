//Dependencies
var formidable = require('formidable');
var util = require('util');
var fs   = require('fs-extra');
var csv = require('../users/csv');
var models = require('../models');
var async = require("async");
var aclPermissions = require('../acl/aclPermissions');
var moment = require('moment');
var functions = require('../functions');

/* SHOW ALL STUDENTS. */
module.exports.show = function(req, res, next) {
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


    async.parallel([
        function(callback){
            models.Students.find().sort({"firstName":1}).exec(callback);
        },
        function(callback){aclPermissions.addStudent(req, res, callback);},   //aclPermissions addStudent
        function(callback){aclPermissions.addMultiStudent(req, res, callback);},   //aclPermissions addMultiStudent
        function(callback){aclPermissions.modifyStudent(req, res, callback);}, //aclPermissions modifyStudent
        function(callback){aclPermissions.deleteStudent(req, res, callback);}, //aclPermissions deleteStudent
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu


    ],function(err, results){
        //console.log(results[2]);
        res.render('students/showStudents',{
            title:'STUDENTS',
            students: results[0],
            aclAddStudent: results[1], //aclPermissions addStudent
            aclAddMultiStudent: results[2], //aclPermissions addMultiStudent
            aclModifyStudent: results[3],  //aclPermissions modifyStudent
            aclDeleteStudent: results[4],  //aclPermissions deleteStudent
            aclSideMenu: results[5],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};

/* ADD STUDENT. -------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.Users.find({'parentOf.0': { "$exists": true }, 'softDeleted': null }).sort({"firstName":1}).exec(callback);
        },
        function(callback){aclPermissions.addStudent(req, res, callback);},   //aclPermissions addStudent
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var student = {
            parentOf: []
        };
        res.render('students/addStudent',{
            title:'ADD STUDENT',
            users: results[0],
            student: student,
            aclAddStudent: results[1], //aclPermissions addStudent
            aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};
module.exports.addPost = function(req, res) {
    var newParentArray = req.body.parentOf;

    async.waterfall([
        function (callback) {
            var student = [];
            var addParentArray = [];
            if (typeof newParentArray !== 'undefined' && newParentArray.length > 0) {//if student has parents
                models.Users.find({'_id': newParentArray}, function (err, users) {
                    if (err) {
                        console.log('err = ', err);
                    } else {
                        for (var i = 0; i < users.length; i++) {
                            var user = {
                                _id: users[i]._id,
                                parentFirstName: users[i].firstName,
                                parentLastName: users[i].lastName
                            };
                            student.push(user);
                            addParentArray.push(users[i]._id);
                        }
                        console.log('"parentOf" updated successfully');
                        callback(null, student, addParentArray);
                    }
                });
            }else{
                callback(null, student, newParentArray);
            }
        }
    ], function (err, student,newParentArray) {

        var student1 = new models.Students({
            studentID: req.body.studentID,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            photo: req.body.photo,
            busRide: req.body.busRide,
            parentOf: student
        });
        if(student1.parentOf.length < 1){
            student1.parentOf = undefined;
        }
        var oldParentArray = [];
        student1.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                return res.status(409).send('showAlert')
            }else{
                updateParentInUserDocument(req, student1, newParentArray, oldParentArray);
                return res.send({redirect:'/students/showStudents'});
            }
        });
    });
};/* -------------------------------end of ADD STUDENT. */



//  ADD MULTIPLE STUDENTS--------------
module.exports.addMultiple = function (req, res){
    functions.aclSideMenu(req, res, function (acl) { //aclPermissions sideMenu
        res.render('students/addMultiStudents', {
            title: 'ADD MULTIPLE STUDENTS',
            aclSideMenu: acl,  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    });



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
            //-----------END of delete all Photos and other files in Student Photo folder before copy new photos

            saveBusTransportation (function (result, err) { //STEP 1/3
                var busTransportation = result;
                if(err){
                    console.log('err = ', err);
                }else {
                    //console.log('result = ', result); //callback('now is the time to run something else...')
                    removeStudentsAndCopyNewStudents (function (result, err) { //STEP 2/3
                        if(err){
                            console.log('err = ', err);
                        }else{
                            //console.log('result = ', result); //callback('now is the time to run something else...')
                            addDeleteStudentsParents(res,busTransportation); //STEP 3/3

                            setTimeout(function(){
                                res.redirect('/students/showStudents');
                            }, 5000);
                        }
                    }, temp_path, file_name, new_location);
                }
            });



        } else { // if no file is selected delete temp file
            console.log('no files added');
            //delete file from temp folder-------
            fs.unlink(temp_path, function (err) {
                if (err) {
                    console.log('Something went wrong');
                }
            });
            //------------------#end - unlink
            res.redirect('/students/showStudents');
        }
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
        function(callback){aclPermissions.modifyStudent(req, res, callback);}, //aclPermissions modifyStudent
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

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
            aclModifyStudent: results[2],  //aclPermissions modifyStudent
            aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
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
                                student.parentOf.push(user);
                                addParentArray.push(users[i]._id);
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
        student.studentID = req.body.studentID;
        student.firstName = req.body.firstName;
        student.lastName = req.body.lastName;
        student.busRide = req.body.busRide;
        student.photo = req.body.photo;
        student.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                return res.status(409).send('showAlert')
            }else{
                updateParentInUserDocument(req, student, newParentArray, oldParentArray);
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
        functions.aclSideMenu(req, res, function (acl) { //aclPermissions sideMenu
            res.render('students/showPhoto', {
                title: 'Student Photo', students: student,
                aclSideMenu: acl,  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        });
    });
};
// -----------------------------end show STUDENT photo

//--ADD or CHANGE STUDENT photo -------------------------------------
module.exports.addUpdatePhoto = function (req, res){
    models.Students.findById(req.params.id,function(error, student) {
        functions.aclSideMenu(req, res, function (acl) { //aclPermissions sideMenu
            res.render('students/addPhoto', {
                title: 'ADD PHOTO', student: student,
                aclSideMenu: acl,  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        });
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
                    if ((student.id + '_' + file_name != oldPhoto) && (oldPhoto != newStudent )) { //delete old photo if exists
                        fs.unlinkSync(new_location + oldPhoto);
                        console.log('successfully deleted ' + oldPhoto);
                    }
                    //if old photo doesn't exits or has been deleted, save new file
                    fs.copy(temp_path, new_location + student.id + '_' + file_name, function (err) { // save file
                        if (err) {
                            console.error(err);
                        } else {
                            student.photo = student.id + '_' + file_name; //save uploaded file name to user.photo
                            student.save();
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
    functions.aclSideMenu(req, res, function (acl) { //aclPermissions sideMenu
        res.render('students/addMultiImage', {
            title: 'ADD MULTIPLE PHOTOS',
            aclSideMenu: acl,  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    });
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
                    var flag = 0;
                    for(var x = 0; x < result.length; x++) {
                        if (err) {
                            console.log(err)
                        }
                        if (!result) {
                            console.log("No Student found");
                        }
                        if ( result[x].studentID == file_name_no_ext ) {
                            result[x].photo = result[x].id + '_' + file_name; //save uploaded file name to user.photo
                            result[x].save();
                            console.log("success! saved " + file_name);
                            fs.copySync(temp_path, new_location + result[x].id + '_' + file_name); // save file
                            break;
                        }
                        else {


                        }


                    }
                    if ( flag == 0 ) {
                        fs.unlinkSync(temp_path, function (err) { //delete file from temp folder (unlink) -------
                            if (err) {
                                console.log('Something went wrong deleting file from temp folder ');
                            }
                        });//------------------------------#end - unlink
                        flag = 1;
                    }

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
            if (arrayParentsToDelete.length < 1 ){
                console.log('No parents from Users collection to delete');
                callback(null);
            } else {
                models.Users.find({ '_id': arrayParentsToDelete }, function(err, users) {
                    if (err) {
                        console.log('error finding users to delete');
                    } else {
                        users.forEach(function (user) {

                            for(var z=0; z < user.parentOf.length; z++){
                                var index = z;
                                if(user.parentOf[z].studentID == parent.studentID){

                                    // If user has more than 1 child
                                    if(user.parentOf && user.parentOf.length > 1){
                                        user.parentOf.splice(index,1);
                                    }
                                    // If user only has 1 child and one only parent role
                                    if(user.parentOf && user.parentOf.length < 2 && user.userRoleID.length < 2){
                                        var whoDeleted = req.session.user.firstName + " " + req.session.user.lastName;
                                        var wrapped = moment(new Date());
                                        user.softDeleted = wrapped.format('YYYY-MM-DD, h:mm:ss a') + "  by " + whoDeleted;
                                    }
                                    // If user only has 1 child and more than one role
                                    if(user.parentOf && user.parentOf.length < 2 && user.userRoleID.length > 1){
                                        user.parentOf = undefined;
                                        updateUserRole(user);
                                    }
                                    user.save();
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



function removeStudentsAndCopyNewStudents (callback, temp_path, file_name, new_location) {

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




//Function for  MULTI STUDENTS -> add parents to Student Collection or delete parents from Users collection --
function addDeleteStudentsParents(res,busTransportation) {
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
                                                child.remove();
                                                //removes userRoleID and userRoleName and put user.parentOf = undefined;
                                                for (var z = 0; z < user.userRoleID.length; z++) {
                                                    var index = z;
                                                    if (user.userRoleID[z] == 98 ){
                                                        console.log('user.userRoleID before = ',user.userRoleID);
                                                        user.userRoleID.splice(index,1);
                                                        user.userRoleName.splice(index,1);
                                                        user.parent = false;
                                                        user.parentOf = undefined;
                                                        console.log('user.userRoleID after = ',user.userRoleID);
                                                        user.save(function (err) {
                                                            if (err) {
                                                                console.log('error removing student removed from user parentOf database = ');
                                                            } else {
                                                                console.log('2) successfully saved');
                                                            }
                                                        });
                                                    }
                                                }
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
                    console.log("InnerLoopFinished");
                    callback();
                });
            }, function (err) {
                console.log("OuterLoopFinished");
                restoreBusTransportation(busTransportation);
            });
        }
    });
}


function saveBusTransportation(callback) {

    models.Students.find({'busRide': {$eq: true} }, function (err, students) {
        if (err) {
            console.log('no students with "busTransportation found');
            callback('now is the time to run something else...');
        }else{
            var busTransportation =[];
            students.forEach(function (student){
                busTransportation.push(student.studentID);
            });
            callback(busTransportation);
        }
    });
}
function restoreBusTransportation(busTransportation) {
    models.Students.update({studentID: {$in: busTransportation}}, {busRide: true}, {multi: true}, function (err,students) {
        if (err) {
            console.log('no students were updated with "busTransportation"');
        }else{
            console.log('success updating Students with BusTransportation');
        }
    });
}