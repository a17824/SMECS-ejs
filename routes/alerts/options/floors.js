//Dependencies
var formidable = require('formidable');
var util = require('util');
var fs   = require('fs-extra');
var path = require('path');
var models = require('./../../models');
var async = require("async");
var aclPermissions = require('./../../acl/aclPermissions');
var functions = require('./../../functions');


/* SHOW FLOORS. */
module.exports.show = function(req, res, next) {
    async.parallel([
        function(callback){
            models.Floors.find().sort({"floorID":1}).exec(callback);
        },
        function(callback){aclPermissions.showFloors(req, res, callback);},         //aclPermissions showFloors
        function(callback){aclPermissions.addFloor(req, res, callback);},           //aclPermissions addFloor
        function(callback){aclPermissions.modifyFloor(req, res, callback);},        //aclPermissions modifyFloor
        function(callback){aclPermissions.deleteFloor(req, res, callback);},         //aclPermissions deleteFloor
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTab(req, res, 'showUsers');
        res.render('floors/showFloors',{
            title:'FLOORS',
            userAuthID: req.user.userPrivilegeID,
            floors: results[0],
            aclShowFloors: results[1],      //aclPermissions showFloors
            aclAddFloor: results[2],      //aclPermissions addFloor
            aclModifyFloor: results[3],   //aclPermissions modifyFloor
            aclDeleteFloor: results[4],    //aclPermissions deleteFloor
            aclSideMenu: results[5],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};

/* ADD Floor. -------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.Floors.find(function(error, floor) {

            }).exec(callback);
        },
        function(callback){aclPermissions.addFloor(req, res, callback);},  //aclPermissions addFloor
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var array = [];
        var stream = models.Floors.find().sort({"floorID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.floorID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('floors/addFloor',{
                title:'Add Floor',
                array: array,
                userAuthID: req.user.userPrivilegeID,
                floor: results[0],
                aclAddFloor: results[1],      //aclPermissions addFloor
                aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};
module.exports.addPost = function(req, res) {
    //console.log(req.body.roleID);
    var floor1 = new models.Floors({
        floorID: req.body.floorID,
        floorName: req.body.floorName,
        floorPlan: req.body.floorPlan
    });
    floor1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            console.log("err - ",err);
            return res.status(409).send('showAlert')
        }else{
            return res.send({redirect:'/floors/showFloors'})
        }
    });
};
/* -------------------------------end of ADD FLOOR. */


/* UPDATE FLOOR. -------------------------------*/
module.exports.update = function(req, res) {
    async.parallel([
        function(callback){
            models.Floors.findById(req.params.id,function(error, floor) {

            }).exec(callback);
        },
        function(callback){aclPermissions.showFloors(req, res, callback);},  //aclPermissions showFloors
        function(callback){aclPermissions.modifyFloor(req, res, callback);},  //aclPermissions modifyFloor
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var array = [];
        var stream = models.Floors.find().sort({"floorID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.floorID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('floors/updateFloor',{
                title:'Update Floor',
                userAuthID: req.user.userPrivilegeID,
                array: array,
                floor: results[0],
                aclShowFloors: results[1],      //aclPermissions showFloors
                aclModifyFloor: results[2],      //aclPermissions modifyFloor
                aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};
module.exports.updatePost = function(req, res) {
    var floorToUpdate1 = req.body.floorToUpdate;
    //console.log(req.body.userRoleID);
    models.Floors.findById({'_id': floorToUpdate1}, function(err, floor){
        floor.floorID = req.body.floorID;
        floor.floorName = req.body.floorName;
        floor.floorPlan = req.body.floorPlan;
        floor.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                console.log("err - ",err);
                return res.status(409).send('showAlert')
            }else{
                //UPDATE Room floorName & floorID DATABASE--------
                var floorToUpdate1 = req.body.oldFloorID;
                models.Room.find({}, function(err, rooms) {
                    if( err || !rooms) console.log("No Permission rooms found");
                    else rooms.forEach( function(room) {
                        if (room.floorID == floorToUpdate1){
                            room.floorID = req.body.floorID;
                            room.floorName = req.body.floorName;
                            room.save();
                            console.log("saved");
                        }
                    });
                });
                //end of UPDATE Room floorName & floorID DATABASE--------

                return res.send({redirect:'/floors/showFloors'})
            }
        });
    });

};
/*---------------------------------------------------------------end of update floors*/

/* DELETE FLOOR. */
module.exports.delete = function(req, res) {
    var floorToDelete = req.params.id;
    models.Floors.findById({'_id': floorToDelete}, function(err, floor) {
        //check if there are Rooms using this Floor
        models.Room.findOne({ floorID: floor.floorID }, function (err, result) {
            if (err) { console.log(err) };

            if (result) {
                console.log("Floor NOT deleted");
                return res.status(409).send(' ALERT! ' + alertGroup.alertTypeName + ' Floor not deleted because there are Rooms using this Floor. Please remove the Rooms using this Floor and then delete this Floor.')
            }
            //end of check if there are Rooms using this Floor

            else {
                // delete photo before delete floor----------------
                var newFloor = "";
                var floorPlan = floor.floorPlan;
                console.log(floor);
                if (floorPlan != newFloor) { //delete old floorPlan if exists
                    fs.unlinkSync('./public/floorPlans/' + floorPlan);
                    console.log('successfully deleted ' + floorPlan);
                }
                // ------------end delete floorPlan before delete floor

                models.Floors.remove({'_id': floorToDelete}, function(err) {
                    //res.send((err === null) ? { msg: 'Floor not deleted' } : { msg:'error: ' + err });
                    res.redirect('/floors/showFloors');
                });

            }
        });
    })
};
/* ------------ end of DELETE FLOOR. */

// show FLOOR PLAN-------------------------------
module.exports.showFloorPlan = function(req, res) {
    async.parallel([
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results) {
        if (!results[0]) {
            console.log('err = ',err);
        }
        else {
            models.Floors.findById(req.params.id, function (error, floor) {
                res.render('floors/showFloorPlan', {
                    title: 'Floor Plan',
                    floor: floor,
                    aclSideMenu: results[0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            });
        }
    });
};
// -----------------------------end show FloorPlan

//--ADD or CHANGE FloorPlan -------------------------------------
module.exports.addUpdateFloorPlan = function (req, res){
    async.parallel([
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results) {
        if (!results[0]) {
            console.log('err = ',err);
        }
        else {
            models.Floors.findById(req.params.id,function(error, floor) {
                res.render('floors/addFloorPlan', {
                    title: 'ADD FLOOR PLAN',
                    floor: floor,
                    aclSideMenu: results[0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            });
        }
    });
};
module.exports.addUpdateFloorPlanPost = function (req, res){
    var fields =[];
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        console.log(util.inspect({fields: fields, files: files}));
    });

    //save floor id from field value to "fields"
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
            var new_location = 'public/floorPlans/';

            if (this.openedFiles[0].name){ // if a file is selected do this
                models.Floors.findById({'_id': field}, function(err, floor){
                    var oldFloorPlan = floor.floorPlan;
                    var newFloor = "";
                    if ((file_name != oldFloorPlan) && (oldFloorPlan != newFloor )) { //delete old floorPlan if exists
                        fs.unlinkSync(new_location + oldFloorPlan);
                        console.log('successfully deleted ' + oldFloorPlan);
                    }
                    //if old floorPlan doesn't exits or has been deleted, save new file
                    fs.copy(temp_path, new_location + file_name, function (err) { // save file
                        if (err) {
                            console.error(err);
                        } else {
                            floor.floorPlan = file_name; //save uploaded file name to floor.floorPlan
                            floor.save()
                            console.log("success! saved " + file_name);
                        }
                        fs.unlink(temp_path, function (err) { //delete file from temp folder (unlink) -------
                            if (err) {
                                //return res.send(500, 'Something went wrong');
                            }
                        });//------------------------------#end - unlink
                        res.redirect('/floors/showFloors');
                    })
                });//--------end of floor.floorPlan
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
//-----------------------------------------end of ADD or CHANGE FLOOR PLAN



// delete FLOOR PLAN------------------
module.exports.deleteFloorPlan = function(req, res) {
    var new_location = 'public/floorPlans/';
    models.Floors.findById({'_id': req.params.id}, function(err, floor){
        var floorPlanToDelete = floor.floorPlan;
        if (fs.existsSync(new_location + floorPlanToDelete)) { //delete old floorPlan if exists
            fs.unlinkSync(new_location + floorPlanToDelete);
            console.log('successfully deleted ' + floorPlanToDelete);
        }
        floor.floorPlan = "";
        floor.save()
        res.redirect('/floors/showFloors');
    });
};
//----------------end delete FLOOR PLAN
