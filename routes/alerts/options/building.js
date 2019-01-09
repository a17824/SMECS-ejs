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


/* SHOW BUILDING FLOORS ROOMS. */
module.exports.show = function(req, res, next) {
    async.parallel([
        function(callback){
            models.Building.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){
            models.Floors.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){
            models.Room.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){aclPermissions.showFloors(req, res, callback);},         //aclPermissions showFloors
        function(callback){aclPermissions.addFloor(req, res, callback);},           //aclPermissions addFloor
        function(callback){aclPermissions.modifyFloor(req, res, callback);},        //aclPermissions modifyFloor
        function(callback){aclPermissions.deleteFloor(req, res, callback);},         //aclPermissions deleteFloor
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectPage(req, res, 'showUsers');

        res.render('BuildingFloorsRooms/showBuildingAndFloors',{
            title:'Building & Floors',
            userAuthID: req.user.userPrivilegeID,
            building: results[0],
            floors: results[1],
            rooms: results[2],
            aclShowFloors: results[3],      //aclPermissions showFloors
            aclAddFloor: results[4],      //aclPermissions addFloor
            aclModifyFloor: results[5],   //aclPermissions modifyFloor
            aclDeleteFloor: results[6],    //aclPermissions deleteFloor
            aclSideMenu: results[7],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo,
            redirectTab: req.user.redirectTabBuildings
        });
    })
};

/* ADD Building. -------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.Building.find(function(error, floor) {

            }).exec(callback);
        },
        function(callback){aclPermissions.addFloor(req, res, callback);},  //aclPermissions addFloor
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        let arraySort = [];
        let array = [];

        let streamSort = models.Building.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            let stream = models.Building.find().sort({"sortID":1}).cursor();
            stream.on('data', function (doc) {
                array.push(doc.buildingID);
            }).on('error', function (err) {
                // handle the error
            }).on('close', function () {
                // the stream is closed

                res.render('BuildingFloorsRooms/Building/addBuilding',{
                    title:'Add Building',
                    arraySort: arraySort,
                    array: array,
                    userAuthID: req.user.userPrivilegeID,
                    building: results[0],
                    aclAddFloor: results[1],      //aclPermissions addFloor
                    aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            })
        });
    })
};
module.exports.addPost = function(req, res) {

    var building1 = new models.Building({
        buildingID: req.body.buildingID,
        sortID: req.body.sortID,
        buildingName: req.body.buildingName

    });
    building1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            console.log("err - ",err);
            return res.status(409).send('showAlert')
        }else{
            //add "Other/Multiple Locations" floor - to this new building\\

            //get floorID and floorSortID in use
            let floorSort_inUse = [];
            let floorID_inUse = [];
            let streamSort = models.Floors.find().sort({"sortID":1}).cursor();
            streamSort.on('data', function (doc) {
                floorSort_inUse.push(doc.sortID);
            }).on('error', function (err) {
                // handle the error
            }).on('close', function () {
                let stream = models.Floors.find().sort({"sortID":1}).cursor();
                stream.on('data', function (doc2) {
                    floorID_inUse.push(doc2.floorID);
                }).on('error', function (err) {
                    // handle the error
                }).on('close', function () {
                    // the stream is closed

                    //check for empty floorID
                    let new_floorID;
                    for(let i = 999; i > 0; --i) {
                        if (floorID_inUse.indexOf(i) > -1) {
                            //In the array!
                        } else {
                            //Not in the array
                            new_floorID = i;
                            break;
                        }
                    }
                    //end of check for empty floorID

                    //check for empty floorSort
                    let new_floorSort;
                    for(let i = 999; i > 0; --i) {
                        if (floorID_inUse.indexOf(i) > -1) {
                            //In the array!
                        } else {
                            //Not in the array
                            new_floorSort = i;
                            break;
                        }
                    }
                    //end of check for empty floorSort


                    let floor1 = new models.Floors({
                        Building: {
                            buildingID: req.body.buildingID,
                            sortID: req.body.sortID,
                            name: req.body.buildingName
                        },
                        floorID: new_floorID,
                        sortID: new_floorSort,
                        floorName: 'Other/Multiple Locations',
                        floorPlan: ''
                    });
                    floor1.save();
                    console.log("success adding Other/Multiple Floors to Floor database");


                    //end of add "Other/Multiple Locations" Floor to this new building

                    return res.send({redirect:'/buildingFloorRoom/show'})

                })
            });

        }
    });
};
/* -------------------------------end of ADD Building. */


/* UPDATE Building. -------------------------------*/
module.exports.update = function(req, res) {
    var arraySort = [];
    var array = [];
    async.parallel([
        function(callback) {
            models.Building.findById(req.params.id,function(error, building) {
            }).exec(callback);
        },

        function(callback){aclPermissions.showFloors(req, res, callback);},  //aclPermissions showFloors
        function(callback){aclPermissions.modifyFloor(req, res, callback);},  //aclPermissions modifyFloor
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var streamSort = models.Building.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
        });

        var stream = models.Building.find().sort({"sortID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.buildingID);

        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed

            res.render('BuildingFloorsRooms/Building/updateBuilding',{
                title:'Update Building',
                userAuthID: req.user.userPrivilegeID,
                arraySort: arraySort,
                array: array,
                building: results[0],
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
    let buildingToUpdate1 = req.body.buildingToUpdate1;

    models.Building.findById({'_id': buildingToUpdate1}, function(err, building){
        building.buildingID = req.body.buildingID;
        building.buildingName = req.body.buildingName;
        building.sortID = req.body.sortID;

        building.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                console.log(err);
                return res.status(409).send('showAlert')
            }else{
                //UPDATE Floors Building_name & Building_id & Building_sort DATABASE--------
                var buildingToUpdate2 = req.body.oldBuildingID;
                models.Floors.find({}, function(err, floors) {
                    if( err || !floors) console.log("No Floors to update");
                    else {
                        floors.forEach( function(floor) {
                            if (floor.Building.buildingID == buildingToUpdate2){
                                floor.Building.buildingID = req.body.buildingID;
                                floor.Building.sortID = req.body.sortID;
                                floor.Building.name = req.body.buildingName;
                                floor.save(function (err) {
                                    if (err && (err.code === 11000 || err.code === 11001)) {
                                        console.log(err);
                                        return res.status(409).send('showAlert')
                                    }else {
                                        console.log('Success updating Floors database');
                                    }
                                });
                            }
                        });
                    }
                });
                //--------end UPDATE Alerts Group_name & Group_id Database

                //UPDATE Rooms Building_name & Building_id DATABASE--------
                models.Room.find({}, function(err, rooms) {
                    if( err || !rooms) console.log("No Rooms to update");
                    else {
                        rooms.forEach(function (room) {
                            if (room.Building.buildingID == buildingToUpdate2) {
                                room.Building.buildingID = req.body.buildingID;
                                room.Building.sortID = req.body.sortID;
                                room.Building.name = req.body.buildingName;
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
                //end of UPDATE Rooms Building_name & Building_id DATABASE--------

                //UPDATE Alerts Building_name & Building_id DATABASE--------
                models.Alerts.find({}, function(err, alerts) {
                    if( err || !alerts) console.log("No Rooms to update");
                    else {
                        alerts.forEach(function (alert) {
                            alert.procedureSpecific.forEach(function (room) {
                                if (room.Building.buildingID == buildingToUpdate2) {
                                    room.Building.buildingID = req.body.buildingID;
                                    room.Building.sortID = req.body.sortID;
                                    room.Building.name = req.body.buildingName;
                                    alert.save(function (err) {
                                        if (err && (err.code === 11000 || err.code === 11001)) {
                                            console.log(err);
                                            return res.status(409).send('showAlert')
                                        } else {
                                            console.log('Success updating building in Alerts database');
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
                //end of UPDATE Alerts Building_name & Building_id DATABASE--------

                console.log('Success updating Building database');
                return res.send({redirect:'/buildingFloorRoom/show'})
            }
        });
    });

};
/*---------------------------------------------------------------end of update floors*/

/* DELETE Building. */
module.exports.delete = function(req, res) {
    var buildingToDelete = req.params.id;
    models.Building.findById({'_id': buildingToDelete}, function(err, building) {
        //check if there are Floors using this Building
        models.Floors.find({ 'Building.buildingID': building.buildingID }, function (err, result) {
            if (err) { console.log('err - ',err) };

            if (result.length > 1) {
                console.log("Building NOT deleted");
                //return res.status(409).send(' ALERT! ' + building.name + ' building not deleted because there are Floors using this Building. Please remove the Floors using this Building and then delete this Building.')
                req.flash('error_messages', ' Attention! ' + building.buildingName + ' building was not deleted because there are Floors using this Building. <br> Please remove Floors under this Building and then delete this Building.');
                res.redirect('/buildingFloorRoom/show');
            }
            //end of check if there are Rooms using this Floor
            else {
                models.Building.remove({'_id': buildingToDelete}, function(err) {   //building
                    if(err) console.log('failed deleting Building. err - ',err);
                    else {
                        console.log('success removing building');
                        models.Floors.remove({'_id': result[0]._id}, function(err2) {   //remove Other/Multiple Floors
                            if(err) console.log('failed removing floor Other/Multiple Floor. err2 - ',err2);
                            else {
                                console.log('success removing floor Other/Multiple Floor.');
                                res.redirect('/buildingFloorRoom/show');
                            }
                        });
                    }

                });


            }
        });
    })
};
/* ------------ end of DELETE FLOOR. */


/*
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
                res.render('floors/addFloorPlan', {
                    title: 'ADD FLOOR PLAN',
                    floor: floor,
                    iPad: iPad,
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
            //Temporary location of our uploaded file
            var temp_path = this.openedFiles[0].path;
            // The file name of the uploaded file
            var file_name = this.openedFiles[0].name;
            // Location where we want to copy the uploaded file
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
*/