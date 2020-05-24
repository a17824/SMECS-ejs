//Dependencies
var models = require('./../../models');
var async = require("async");
var aclPermissions = require('./../../acl/aclPermissions');
var functions = require('../../functions');
var MobileDetect = require('mobile-detect');

/* ADD Room. -------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.Room.find(function(error, room) {}).exec(callback);
        },
        function(callback){
            models.Floors.find({'floorName':{'$ne':'Other/Multiple Locations'}},function(error, floor) {}).exec(callback);
        },
        function(callback){
            models.Building.find(function(error, building) {}).exec(callback);
        },
        function(callback){
            models.Roles2.find().sort({"roleID":1}).exec(callback);
        },
        function(callback){aclPermissions.addFloor(req, res, callback);},  //aclPermissions addFloor
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){
        let iPad = false;
        let md = new MobileDetect(req.headers['user-agent']);
        if(md.is('iPad') == true)
            iPad = true;

        var arraySort = [];
        var array = [];

        let arrayRoles = [];
        results[3].forEach(function (role) {
            if(role.roleID < 96)
                arrayRoles.push(role.roleName);
        });

        var streamSort = models.Room.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            let stream = models.Room.find().sort({"sortID":1}).cursor();
            stream.on('data', function (doc2) {
                array.push(doc2.roomID);
            }).on('error', function (err) {
                // handle the error
            }).on('close', function () {
                // the stream is closed

                res.render('BuildingFloorsRooms/Room/addRoom',{
                    title:'Add Room',
                    arraySort: arraySort,
                    array: array,
                    userAuthID: req.user.userPrivilegeID,
                    room: results[0],
                    floors: results[1],
                    buildings: results[2],
                    roles: arrayRoles,
                    iPad: iPad,
                    aclAddFloor: results[4],      //aclPermissions addFloor
                    aclSideMenu: results[5][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            })
        });


    })
};
module.exports.addPost = function(req, res) {
    let arraySplit2 = req.body.floor.split("_|_");
    let floorID = parseInt(arraySplit2[0]);
    let floorSortID = parseInt(arraySplit2[1]);
    let floorName = arraySplit2[2];
    let buildingID = parseInt(arraySplit2[3]);
    let buildingSortID = parseInt(arraySplit2[4]);
    let buildingName = arraySplit2[5];

    let roomName = req.body.roomName;

    models.Room.findOne({'roomName': roomName},function(error, room) {
        if(error) console.log('error adding room =',error);
        else{
            if(room && room.Floor.name === floorName && room.Building.name === buildingName){
                req.flash('error_messages', ' Attention! There is already a Room with this name on this Floor on this building <br> Please choose a different floor name');
                //res.redirect('/floor/add1');
                return res.send({redirect:'/room/add'})
            }
            else{
                let room1 = new models.Room({
                    Building: {
                        buildingID: buildingID,
                        sortID: buildingSortID,
                        name: buildingName
                    },
                    Floor: {
                        floorID: floorID,
                        sortID: floorSortID,
                        name: floorName
                    },
                    roomID: req.body.roomID,
                    sortID: req.body.sortID,
                    roomName: req.body.roomName,
                    smecsLightAllRoles: req.body.smecsLight,
                    roomRoleName: req.body.roomRoleName
                });
                room1.save(function (err) {
                    if (err) {
                        console.log("err adding room - ",err);
                        return res.status(409).send('showAlert')
                    }else{

                        //ADD Alerts Building_name & Building_id DATABASE--------
                        models.Alerts.find({}, function(err, alerts) {
                            if( err || !alerts) console.log("No Rooms to update");
                            else {
                                alerts.forEach(function (alert) {
                                    alert.procedureSpecific.splice(alert.procedureSpecific.sortID, 0, room1);
                                    alert.save();

                                    alert.save(function (err) {
                                        if (err) {
                                            console.log("err adding Room ro Alert database - ", err);
                                        } else {
                                            console.log("success adding Room to Alert database");
                                        }
                                    })
                                });
                            }
                        });
                        //end of ADD Alerts Building_name & Building_id DATABASE--------

                        return res.send({redirect:'/buildingFloorRoom/show'})
                    }
                });
            }
        }

    });
};
/* -------------------------------end of ADD FLOOR. */


/* UPDATE Room. -------------------------------*/
module.exports.update = function(req, res) {
    var arraySort = [];
    var array = [];
    async.parallel([
        function(callback){
            models.Room.findById(req.params.id,function(error, room) {

            }).exec(callback);
        },
        function(callback) {
            models.Floors.find({'floorName':{'$ne':'Other/Multiple Locations'}},function(error, floor) {}).exec(callback);
        },
        function(callback) {
            models.Building.find().sort({"sortID": 1}).exec(callback);
        },
        function(callback){
            models.Roles2.find().sort({"roleID":1}).exec(callback);
        },
        function(callback){aclPermissions.showFloors(req, res, callback);},  //aclPermissions showFloors
        function(callback){aclPermissions.modifyFloor(req, res, callback);},  //aclPermissions modifyFloor
        function(callback) {functions.aclSideMenu(req, res, function (acl, profilePage) {callback(null, acl, profilePage);});} //aclPermissions sideMenu

    ],function(err, results){

        let iPad = false;
        let md = new MobileDetect(req.headers['user-agent']);
        if(md.is('iPad') == true)
            iPad = true;

        let arrayRoles = [];
        results[3].forEach(function (role) {
            if(role.roleID < 96)
                arrayRoles.push(role.roleName);
        });


        let streamSort = models.Room.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            let stream = models.Room.find().sort({"roomID":1}).cursor();
            stream.on('data', function (doc2) {
                array.push(doc2.roomID);

            }).on('error', function (err) {
                // handle the error
            }).on('close', function () {
                // the stream is closed
                //console.log(array);

                res.render('BuildingFloorsRooms/Room/updateRoom',{
                    title:'Update Room',
                    userAuthID: req.user.userPrivilegeID,
                    arraySort: arraySort,
                    array: array,
                    room: results[0],
                    floors: results[1],
                    buildings: results[2],
                    roles: arrayRoles,
                    iPad: iPad,
                    aclShowFloors: results[4],      //aclPermissions showFloors
                    aclModifyFloor: results[5],      //aclPermissions modifyFloor
                    aclSideMenu: results[6][0],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            })
        });
    })
};
module.exports.updatePost = function(req, res) {
    let roomToUpdate1 = req.body.roomToUpdate1;

    let arraySplit2 = req.body.floor.split("_|_");
    let floorID = parseInt(arraySplit2[0]);
    let floorSortID = parseInt(arraySplit2[1]);
    let floorName = arraySplit2[2];
    let buildingID = parseInt(arraySplit2[3]);
    let buildingSortID = parseInt(arraySplit2[4]);
    let buildingName = arraySplit2[5];

    let roomName = req.body.roomName;

    models.Room.findById(roomToUpdate1,function(error, roomToUpdate) {
        if(error || !roomToUpdate) console.log('error finding Room to update =',error);
        else{
            models.Room.findOne({_id: {$ne: roomToUpdate1},'roomName': roomName, 'Floor.floorID': floorID, 'Building.buildingID': buildingID},function(error, room) {
                if(error) console.log('error finding Room to update =',error);
                else {
                    if (room) {
                        console.log("Room NOT updated");
                        req.flash('error_messages', ' Attention! There is already a Room with this name on this Floor on this building <br> Please choose a different floor name');
                        //res.redirect('/floor/add1');
                        return res.send({redirect: '/room/update/' + roomToUpdate1})
                    }
                    else {
                        let oldRoomID = roomToUpdate.roomID; // to find and update in Alert database procedureSpecific.roomID

                        roomToUpdate.Building.buildingID = buildingID;
                        roomToUpdate.Building.sortID = buildingSortID;
                        roomToUpdate.Building.name = buildingName;

                        roomToUpdate.Floor.floorID = floorID;
                        roomToUpdate.Floor.sortID = floorSortID;
                        roomToUpdate.Floor.name = floorName;

                        roomToUpdate.roomID = req.body.roomID;
                        roomToUpdate.sortID = req.body.sortID;
                        roomToUpdate.roomName = req.body.roomName;
                        roomToUpdate.smecsLightAllRoles = req.body.smecsLight;
                        roomToUpdate.roomRoleName = req.body.roomRoleName;

                        roomToUpdate.save(function (err) {
                            if (err) {
                                console.log("err - ", err);
                                return res.status(409).send('showAlert')
                            } else {
                                console.log("Room updated");
                                //UPDATE Alerts Room_name & Room_id DATABASE--------
                                models.Alerts.find({}, function(err, alerts) {
                                    if( err || !alerts) console.log("No Rooms to update");
                                    else {
                                        alerts.forEach(function (alert) {
                                            alert.procedureSpecific.forEach(function (room) {
                                                if (room.roomID == oldRoomID) {
                                                    room.Building.buildingID = buildingID;
                                                    room.Building.sortID = buildingSortID;
                                                    room.Building.name = buildingName;

                                                    room.Floor.floorID = floorID;
                                                    room.Floor.sortID = floorSortID;
                                                    room.Floor.name = floorName;

                                                    room.roomID = req.body.roomID;
                                                    room.sortID = req.body.sortID;
                                                    room.roomName = req.body.roomName;
                                                    alert.save(function (err) {
                                                        if (err ) {
                                                            console.log('err updating room in Alert database - ',err);
                                                        } else {
                                                            console.log('Success updating Rooms in Alerts database');
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    }
                                });
                                //end of UPDATE Alerts Room_name & Room_id DATABASE--------


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


/* DELETE Room. */
module.exports.delete = function(req, res) {
    let roomToDelete = req.params.id;
    models.Room.findById(roomToDelete,function(error, roomToUpdate) {
        models.Alerts.find({}, function(err, alerts) {
            if( err || !alerts) console.log("No alerts found");
            else {
                alerts.forEach(function (alert) {
                    for (let z = 0; z < alert.procedureSpecific.length; z++) {
                        if(alert.procedureSpecific[z].roomID == roomToUpdate.roomID) {
                            alert.procedureSpecific.splice(z, 1);
                            alert.save(function (err) {
                                if (err )
                                    console.log('err deleting room from Alert database - ',err);
                                else
                                    console.log('success - removing room from Alerts database');
                            });
                        }
                    }
                });
                models.Room.remove({'_id': roomToDelete}, function(err, room) {
                    if( err || !room) console.log("No Rooms to update");
                    else {
                        return res.redirect('/buildingFloorRoom/show');
                    }
                });
            }
        });
    });


};
/* ----- end of DELETE Alerts. */
