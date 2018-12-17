//Dependencies
var models = require('./../../models');
var async = require("async");
var aclPermissions = require('./../../acl/aclPermissions');
var functions = require('../../functions');

/* ADD Room. -------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.Room.find(function(error, room) {}).exec(callback);
        },
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
                    aclAddFloor: results[3],      //aclPermissions addFloor
                    aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
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
                    roomName: req.body.roomName
                });
                room1.save(function (err) {
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
            models.Floors.find().sort({"sortID": 1}).exec(callback);
        },
        function(callback) {
            models.Building.find().sort({"sortID": 1}).exec(callback);
        },
        function(callback){aclPermissions.showFloors(req, res, callback);},  //aclPermissions showFloors
        function(callback){aclPermissions.modifyFloor(req, res, callback);},  //aclPermissions modifyFloor
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var streamSort = models.Room.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            var stream = models.Room.find().sort({"roomID":1}).cursor();
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
                    aclShowFloors: results[3],      //aclPermissions showFloors
                    aclModifyFloor: results[4],      //aclPermissions modifyFloor
                    aclSideMenu: results[5],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
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
                        console.log("Room updated");
                        roomToUpdate.Building.buildingID = buildingID;
                        roomToUpdate.Building.sortID = buildingSortID;
                        roomToUpdate.Building.name = buildingName;

                        roomToUpdate.Floor.floorID = floorID;
                        roomToUpdate.Floor.sortID = floorSortID;
                        roomToUpdate.Floor.name = floorName;

                        roomToUpdate.roomID = req.body.roomID;
                        roomToUpdate.sortID = req.body.sortID;
                        roomToUpdate.roomName = req.body.roomName;

                        roomToUpdate.save(function (err) {
                            if (err) {
                                console.log("err - ", err);
                                return res.status(409).send('showAlert')
                            } else {
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
    models.Room.remove({'_id': roomToDelete}, function(err) {
        return res.redirect('/buildingFloorRoom/show');
    });
};
/* ----- end of DELETE Alerts. */
