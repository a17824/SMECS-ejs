//Dependencies
var models = require('./../../../models');
var fs   = require('fs-extra');

/**
 * middleware for Express.
 *
 * This middleware will run all functions related to sending alerts
 *
 */

module.exports.saveStudentFile = function(req, res, tempAlert) {

    //copy student Photo from AlertSentTemp database to alertSentInfo database -----------------
    models.AlertSentTemp.findById(tempAlert._id,function(err, result) {
        if (err) {
            console.log(err)
        }
        if (!result) {
            console.log("No Student Photo found");
        }
        else {
            if (result.studentPhoto == '' || result.studentPhoto == 'photoNotAvailable.bmp' || tempAlert.studentPhoto == 'photoNotAvailable.bmp'){
                var src_location = 'public/photosNotAvailable/';
                var dst_location = 'public/alertSentInfo/studentsPhotos/';
                var src_File_name = 'photoNotAvailable.bmp';
                var dst_File_name = tempAlert._id + '_' + src_File_name;//file_name + alert ID

                fs.copy(src_location + src_File_name, dst_location + dst_File_name, function (err) { // copy student photo file to new directory
                    if (err) {
                        console.error(err);
                    } else {
                        console.log("success! saved " + src_File_name);
                    }
                });
            }
            else {
                var src_location = 'public/photosStudents/';
                var dst_location = 'public/alertSentInfo/studentsPhotos/';
                var src_File_name = result.studentPhoto;
                var dst_File_name = tempAlert._id + '_' + result.studentPhoto;//file_name + alert ID

                fs.copy(src_location + src_File_name, dst_location + dst_File_name, function (err) { // copy student photo file to new directory
                    if (err) {
                        console.error(err);
                    } else {
                        console.log("success! saved " + src_File_name);
                    }
                });
                /*
                console.log('111111111');
                console.log(tempAlert.studentPhoto);
                if (tempAlert.studentPhoto == tempAlert._id + '_' + 'photoNotAvailable.bmp') { //delete old photo if exists
                    fs.access(path, function(err) {
                        if (!err) {
                            fs.unlinkSync('./public/photosStudents/' + tempAlert.studentPhoto);
                            console.log('successfully deleted ' + tempAlert.studentPhoto);
                        } else {
                            console.log('file not found: ' + tempAlert.studentPhoto);
                        }
                    });
                }// ------------end delete photo before delete user
                */
            }
        }
    });
    //----------------- end of copy Student Photo from Student database to alertSentInfo database

};