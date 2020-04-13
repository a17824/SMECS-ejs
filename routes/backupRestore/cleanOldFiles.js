//Dependencies
var fs   = require('fs-extra');
var models = require('../models');
var async = require("async");



module.exports.cleanOldUserPhotos = function (){
    async.parallel([
        function(callback){
            var arrayUsers = [];
            models.Users.find({},function(err,users){
                if(err) throw err;
                users.forEach(function(user){
                    if(user.photo !== '')
                        arrayUsers.push(user.photo);
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


module.exports.cleanOldStudentPhotos = function (){
    async.parallel([
        function(callback){
            var arrayUsers = [];
            models.Students.find({},function(err,users){
                if(err) throw err;
                users.forEach(function(user){
                    if(user.photo !== '')
                        arrayUsers.push(user.photo);
                });
                callback(null, arrayUsers);
            });
        },
        function(callback){
            fs.readdir('./public/photosStudents/',function(err,files){
                if(err) throw err;
                callback(null, files);
            });
        }
    ],function(err, results){
        var arrayUsersWithPhoto = results[0];
        var files = results[1];

        var diff = files.filter(function(x) { return arrayUsersWithPhoto.indexOf(x) < 0 });

        diff.forEach(function(fileToDelete){
            fs.unlinkSync('./public/photosStudents/' + fileToDelete);  //delete file
            console.log('successfully deleted ' + fileToDelete);
        });
    });
};

module.exports.cleanOldAlertSentInfoFloors = function (){
    async.parallel([
        function(callback){
            let arrayAlerts = [];
            models.AlertSentInfo.find({},function(err,alerts){
                if(err) throw err;
                alerts.forEach(function(alert){
                    arrayAlerts.push(alert.id);
                });
                callback(null, arrayAlerts);
            });
        },
        function(callback){
            fs.readdir('./public/alertSentInfo/floorsPhotos/',function(err,files){
                if(err) throw err;
                callback(null, files);
            });
        },

    ],function(err, results){
        let arrayAlertsIds = results[0];
        let filesFloorsPhotos = results[1];
        let arrayFloorPhotosIds = [];
        filesFloorsPhotos.forEach(function (file) {
            let arrSplit = file.split("_");
            arrayFloorPhotosIds.push(arrSplit[0])
        });

        let diff = arrayFloorPhotosIds.filter(function(x) { return arrayAlertsIds.indexOf(x) < 0 });


        //rejoin remaining file name to "fileToDelete "
        let arrayFileToDeleteCompletedName = [];
        diff.forEach(function(fileToDelete){
            filesFloorsPhotos.forEach(function (file) {
                let arrSplit = file.split("_");
                if(arrSplit[0] === fileToDelete){
                    arrayFileToDeleteCompletedName.push(file);
                }
            });
        });

        //delete files
        arrayFileToDeleteCompletedName.forEach(function(fileToDelete){
            fs.unlinkSync('./public/alertSentInfo/floorsPhotos/' + fileToDelete);  //delete file
            console.log('successfully deleted ' + fileToDelete);
        });
    });
};

module.exports.cleanOldAlertSentInfoStudents = function (){
    console.log('cleanOldAlertSentInfoStudents');
    async.parallel([
        function(callback){
            let arrayAlerts = [];
            models.AlertSentInfo.find({},function(err,alerts){
                if(err) throw err;
                alerts.forEach(function(alert){
                    arrayAlerts.push(alert.id);
                });
                callback(null, arrayAlerts);
            });
        },
        function(callback){
            fs.readdir('./public/alertSentInfo/studentsPhotos/',function(err,files){
                if(err) throw err;
                callback(null, files);
            });
        }

    ],function(err, results){
        let arrayAlertsIds = results[0];
        let filesStudentsPhotos = results[1];
        let arrayStudentsPhotosIds = [];
        filesStudentsPhotos.forEach(function (file) {
            let arrSplit = file.split("_");
            arrayStudentsPhotosIds.push(arrSplit[0])
        });

        let diff = arrayStudentsPhotosIds.filter(function(x) { return arrayAlertsIds.indexOf(x) < 0 });

        //rejoin remaining file name to "fileToDelete "
        let arrayFileToDeleteCompletedName = [];
        diff.forEach(function(fileToDelete){
            filesStudentsPhotos.forEach(function (file) {
                let arrSplit = file.split("_");
                if(arrSplit[0] === fileToDelete){
                    arrayFileToDeleteCompletedName.push(file);
                }
            });
        });


        uniqArray(arrayFileToDeleteCompletedName,function (newArray,err) { // //remove array duplicates
            if(err || !newArray || newArray < 1) console.log('newArray err = ',err);
            else {
                //delete files
                newArray.forEach(function(fileToDelete){
                    fs.unlinkSync('./public/alertSentInfo/studentsPhotos/' + fileToDelete);  //delete file
                    console.log('successfully deleted ' + fileToDelete);
                });
                //end of delete files
            }
        });

        //end of remove array duplicates



    });
};

function uniqArray(arr, callback){ // remove array duplicates
    var uniq = arr.reduce(function(a,b){
        if (a.indexOf(b) < 0 ) a.push(b);
        return a;
    },[]);
    callback(uniq)
}