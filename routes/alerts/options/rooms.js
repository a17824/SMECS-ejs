//Dependencies
var models = require('./../../models');
var async = require("async");
var aclPermissions = require('./../../acl/aclPermissions');
var functions = require('../../functions');

/* SHOW Rooms. */
module.exports.show = function(req, res, next) {
    async.parallel([
        function(callback){
            models.Room.find().sort({"floorID":1}).sort({"roomID":1}).exec(callback);
        },
        function(callback){
            models.Floors.find().sort({"floorID":1}).exec(callback);
        },
        function(callback){aclPermissions.addRooms(req, res, callback);},   //aclPermissions addRooms
        function(callback){aclPermissions.modifyRoom(req, res, callback);},   //aclPermissions modifyRoom
        function(callback){aclPermissions.deleteRoom(req, res, callback);},   //aclPermissions deleteRoom
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTab(req, res, 'showUsers');
        res.render('rooms/showRooms',{
            title:'Rooms',
            userAuthID: req.user.userPrivilegeID,
            room: results[0],
            floor: results[1],
            aclAddRoom: results[2], //aclPermissions addRoom
            aclModifyRoom: results[3], //aclPermissions modifyRoom
            aclDeleteRoom: results[4], //aclPermissions deleteRoom
            aclSideMenu: results[5],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};
/* end of SHOW active Alerts. */


/* CREATE Room. -------------------------------*/
module.exports.create = function(req, res) {
    async.parallel([
        function(callback){
            models.Floors.find(function(error, floor) {

            }).sort({"floorID":1}).exec(callback);
        },
        function(callback){
            models.Room.find(function(error, alerts) {

            }).exec(callback);
        },
        function(callback){aclPermissions.addRooms(req, res, callback);},  //aclPermissions addRooms
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var array = [];
        var stream = models.Room.find().sort({"roomID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.roomID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('rooms/createRoom',{
                title:'Create Room',
                array: array,
                userAuthID: req.user.userPrivilegeID,
                floor: results[0],
                room: results[1],
                aclAddRooms: results[2],      //aclPermissions addRooms
                aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};

module.exports.createPost = function(req, res) {
    var room1 = new models.Room({
        floorID: req.body.floorID,
        floorName: req.body.floorName,
        roomID: req.body.roomID,
        roomName: req.body.roomName
    });
    room1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            console.log("err - ",err);
            return res.status(409).send('showAlert')
        }else{
            console.log(req.body.roomName + " successfully saved");
            return res.send({redirect:'/options/rooms'})
        }
    });
};
/*-------------------------end of adding Room*/



/* UPDATE Room. -------------------------------*/
module.exports.update = function(req, res) {
    var array = [];
    async.parallel([
        function(callback){
            models.Room.findById(req.params.id).exec(callback);
        },
        function(callback) {
            models.Floors.find().sort({"floorID": 1}).exec(callback);
        },
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){

        var stream = models.Room.find().sort({"roomID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.roomID);

        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('rooms/updateRoom', {
                title: 'Update Room',
                array: array,
                userAuthID: req.user.userPrivilegeID,
                room: results[0],
                floor: results[1],
                aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        });
    })
};
module.exports.updatePost = function(req, res) {
    var roomToUpdate1 = req.body.roomToUpdate;
    models.Room.findById({'_id': roomToUpdate1}, function(err, room){
        room.floorID = req.body.floorID;
        room.floorName = req.body.floorName;
        room.roomName = req.body.roomName;
        room.roomID = req.body.roomID;
        room.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                console.log(err);
                return res.status(409).send('showAlert')
            }else {
                console.log(req.body.roomName + " successfully updated");
                res.send({redirect: '/options/rooms'});
            }
        });
    });


};
/*-------------------------end of update Room*/



/* DELETE Room. */
module.exports.delete = function(req, res) {
    var roomToDelete = req.params.id;
    models.Room.remove({'_id': roomToDelete}, function(err) {
        return res.redirect('/options/rooms');
    });
};
/* ----- end of DELETE Alerts. */
