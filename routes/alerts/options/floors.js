//Dependencies
var formidable = require('formidable');
var util = require('util');
var fs   = require('fs-extra');
var path = require('path');
var models = require('./../../models');
var async = require("async");
var aclPermissions = require('./../../acl/aclPermissions');
var functions = require('./../../functions');
var MobileDetect = require('mobile-detect');




/* ADD Floor. -------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.Floors.find(function(error, floor) {}).exec(callback);
        },
        function(callback){
            models.Building.find(function(error, building) {}).exec(callback);
        },
        function(callback){aclPermissions.addFloor(req, res, callback);},  //aclPermissions addFloor
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var arraySort = [];
        var array = [];

        var streamSort = models.Floors.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            let stream = models.Floors.find().sort({"sortID":1}).cursor();
            stream.on('data', function (doc2) {
                array.push(doc2.floorID);
            }).on('error', function (err) {
                // handle the error
            }).on('close', function () {
                // the stream is closed

                res.render('BuildingFloorsRooms/Floor/addFloor',{
                    title:'Add Floor',
                    arraySort: arraySort,
                    array: array,
                    userAuthID: req.user.userPrivilegeID,
                    floor: results[0],
                    buildings: results[1],
                    aclAddFloor: results[2],      //aclPermissions addFloor
                    aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            })
        });


    })
};
module.exports.addPost = function(req, res) {
    let arraySplit = req.body.building.split("_|_");
    let buildingID = parseInt(arraySplit[0]);
    let buildingSortID = parseInt(arraySplit[1]);
    let buildingName = arraySplit[2];
    let floorName = req.body.floorName;

    models.Floors.findOne({'floorName': floorName},function(error, floor) {
        if(error) console.log('error adding floor =',error);
        else{
            if(floor && floor.Building.name == buildingName){
                req.flash('error_messages', ' Attention! There is already a floor with this name on building: ' + floor.Building.name + '<br> Please choose a different floor name');
                //res.redirect('/floor/add1');
                return res.send({redirect:'/floor/add'})
            }
            else{
                let floor1 = new models.Floors({
                    Building: {
                        buildingID: buildingID,
                        sortID: buildingSortID,
                        name: buildingName
                    },
                    floorID: req.body.floorID,
                    sortID: req.body.sortID,
                    floorName: req.body.floorName,
                    floorPlan: ''
                });
                floor1.save(function (err) {
                    if (err) {
                        console.log("err - ",err);
                        return res.status(409).send('showAlert')
                    }else{
                        return res.send({redirect:'/buildingFloorRoom/show'})
                    }
                });
            }
        }

    });
};
/* -------------------------------end of ADD FLOOR. */


/* UPDATE FLOOR. -------------------------------*/
module.exports.update = function(req, res) {
    var arraySort = [];
    var array = [];
    async.parallel([
        function(callback){
            models.Floors.findById(req.params.id,function(error, floor) {

            }).exec(callback);
        },
        function(callback) {
            models.Building.find().sort({"sortID": 1}).exec(callback);
        },
        function(callback){aclPermissions.showFloors(req, res, callback);},  //aclPermissions showFloors
        function(callback){aclPermissions.modifyFloor(req, res, callback);},  //aclPermissions modifyFloor
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var streamSort = models.Floors.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            var stream = models.Floors.find().sort({"floorID":1}).cursor();
            stream.on('data', function (doc2) {
                array.push(doc2.floorID);

            }).on('error', function (err) {
                // handle the error
            }).on('close', function () {
                // the stream is closed
                //console.log(array);

                res.render('BuildingFloorsRooms/Floor/updateFloor',{
                    title:'Update Floor',
                    userAuthID: req.user.userPrivilegeID,
                    arraySort: arraySort,
                    array: array,
                    floor: results[0],
                    buildings: results[1],
                    aclShowFloors: results[2],      //aclPermissions showFloors
                    aclModifyFloor: results[3],      //aclPermissions modifyFloor
                    aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            })
        });
    })
};
module.exports.updatePost = function(req, res) {
    var floorToUpdate1 = req.body.floorToUpdate1;
    let arraySplit = req.body.building.split("_|_");
    let buildingID = parseInt(arraySplit[0]);
    let buildingSortID = parseInt(arraySplit[1]);
    let buildingName = arraySplit[2];
    let floorName = req.body.floorName;

    models.Floors.findById(floorToUpdate1,function(error, floorToUpdate) {
        if(error || !floorToUpdate) console.log('error finding Floor to update =',error);
        else{
            models.Floors.findOne({_id: {$ne: floorToUpdate1},'floorName': floorName, 'Building.buildingID': buildingID},function(error, floor) {
                if(error) console.log('error finding Floor to update =',error);
                else {
                    if (floor) {
                        console.log("Floor NOT updated");
                        req.flash('error_messages', ' Attention! There is already a floor with this name on building \"' + floor.Building.name + '\"<br> Please choose a different floor name');
                        //res.redirect('/floor/add1');
                        return res.send({redirect: '/floor/update/' + floorToUpdate1})
                    }
                    else {
                        floorToUpdate.Building.buildingID = buildingID;
                        floorToUpdate.Building.sortID =  buildingSortID;
                        floorToUpdate.Building.name = buildingName;
                        floorToUpdate.floorID = req.body.floorID;
                        floorToUpdate.sortID = req.body.sortID;
                        floorToUpdate.floorName = req.body.floorName;
                        floorToUpdate.save(function (err) {
                            if (err) {
                                console.log("err - ", err);
                                return res.status(409).send('showAlert')
                            } else {
                                let floorToUpdate2 = req.body.oldFloorID;

                                //UPDATE Rooms Floor_name & Floor_id DATABASE--------
                                models.Room.find({}, function(err, rooms) {
                                    if( err || !rooms) console.log("No Rooms to update");
                                    else {
                                        rooms.forEach(function (room) {
                                            if (room.Floor.floorID == floorToUpdate2) {
                                                room.Building.buildingID = buildingID;
                                                room.Building.sortID = buildingSortID;
                                                room.Building.name = buildingName;
                                                room.Floor.floorID = req.body.floorID;
                                                room.Floor.sortID = req.body.sortID;
                                                room.Floor.name = req.body.floorName;
                                                room.save(function (err) {
                                                    if (err && (err.code === 11000 || err.code === 11001)) {
                                                        console.log(err);
                                                        return res.status(409).send('showAlert')
                                                    } else {
                                                        console.log('Success updating Rooms database');
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                                //end of UPDATE Rooms Floor_name & Floor_id DATABASE--------

                                //UPDATE Alerts Floor_name & Floor_id DATABASE--------
                                models.Alerts.find({}, function(err, alerts) {
                                    if( err || !alerts) console.log("No Rooms to update");
                                    else {
                                        alerts.forEach(function (alert) {
                                            alert.procedureSpecific.forEach(function (room) {
                                                if (room.Floor.floorID == floorToUpdate2) {
                                                    room.Building.buildingID = buildingID;
                                                    room.Building.sortID = buildingSortID;
                                                    room.Building.name = buildingName;
                                                    room.Floor.floorID = req.body.floorID;
                                                    room.Floor.sortID = req.body.sortID;
                                                    room.Floor.name = req.body.floorName;
                                                    alert.save(function (err) {
                                                        if (err && (err.code === 11000 || err.code === 11001)) {
                                                            console.log(err);
                                                            return res.status(409).send('showAlert')
                                                        } else {
                                                            console.log('Success updating floor in Alerts database');
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    }
                                });
                                //end of UPDATE Alerts Floor_name & Floor_id DATABASE--------


                                console.log('Success updating Floor database');
                                return res.send({redirect: '/buildingFloorRoom/show'})
                            }
                        });
                    }
                }
            });
        }
    });
};
/*---------------------------------------------------------------end of update floors*/

/* DELETE FLOOR. */
module.exports.delete = function(req, res) {
    var floorToDelete = req.params.id;
    models.Floors.findById({'_id': floorToDelete}, function(err, floor) {
        //check if there are Rooms using this Floor
        models.Room.findOne({ 'Floor.floorID': floor.floorID }, function (err, result) {
            if (err) { console.log(err) };

            if (result) {
                console.log("Floor NOT deleted");
                req.flash('error_messages','The Floor \"' + floor.floorName + '\" was not deleted. Please remove the Rooms using this Floor and then delete the Floor.');
                res.redirect('/buildingFloorRoom/show');
            }
            //end of check if there are Rooms using this Floor

            else {
                // delete photo before delete floor----------------
                var newFloor = "";
                var floorPlan = floor.floorPlan;

                if (floorPlan != newFloor) { //delete old floorPlan if exists
                    fs.unlinkSync('./public/floorPlans/' + floorPlan);
                    console.log('successfully deleted ' + floorPlan);
                }else{
                    console.log('floor plan doesnt exist to be delete');
                }
                // ------------end delete floorPlan before delete floor

                models.Floors.remove({'_id': floorToDelete}, function(err) {
                    //res.send((err === null) ? { msg: 'Floor not deleted' } : { msg:'error: ' + err });
                    console.log('successfully deleted ' + floor.floorName);
                    res.redirect('/buildingFloorRoom/show');
                });

            }
        });
    })
};
/* ------------ end of DELETE FLOOR. */



//--ADD or CHANGE FloorPlan -------------------------------------
module.exports.addUpdateFloorPlan = function (req, res){
    async.parallel([
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results) {
        if (!results[0]) {
            console.log('err = ',err);
        }
        else {

            var iPad = false;
            var md = new MobileDetect(req.headers['user-agent']);
            if(md.is('iPad') == true)
                iPad = true;

            models.Floors.findById(req.params.id,function(error, floor) {
                if( error || !floor) console.log("No Floors found or error");
                else{
                    console.log("floor = ");
                    res.render('BuildingFloorsRooms/Floor/addFloorPlan', {
                        title: 'ADD FLOOR PLAN',
                        floor: floor,
                        iPad: iPad,
                        aclSideMenu: results[0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                        userAuthName: req.user.firstName + ' ' + req.user.lastName,
                        userAuthPhoto: req.user.photo
                    });
                }

            });
        }
    });
};
module.exports.addUpdateFloorPlanPost = function (req, res){
    var fields =[];
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        //console.log(util.inspect({fields: fields, files: files}));
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
                        res.redirect('/buildingFloorRoom/show');
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
        floor.save();
        res.redirect('/buildingFloorRoom/show');
    });
};
//----------------end delete FLOOR PLAN
