//Dependencies
var models = require('./../../models');
var async = require("async");
var aclPermissions = require('./../../acl/aclPermissions');
var functions = require('./../../functions');

/* SHOW ALL SchoolClosed. */
module.exports.show = function(req, res, next) {
    async.parallel([
        function(callback){
            models.SchoolClosed.find().sort({"causeID":1}).exec(callback);
        },
        function(callback){aclPermissions.addMedical(req, res, callback);},   //aclPermissions addMedical
        function(callback){aclPermissions.modifyMedical(req, res, callback);},   //aclPermissions modifyMedical
        function(callback){aclPermissions.deleteMedical(req, res, callback);},   //aclPermissions deleteMedical
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTabUsers(req, res, 'showUsers');
        res.render('schoolClosed/showSchoolClosed',{
            title:'School Closed',
            userAuthID: req.user.userPrivilegeID,
            schoolClosed: results[0],
            aclAddMedical: results[1], //aclPermissions addMedical
            aclModifyMedical: results[2], //aclPermissions modifyMedical
            aclDeleteMedical: results[3], //aclPermissions deleteMedical
            aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo

        });
    })
};

/* ADD SchoolClosed. -------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.SchoolClosed.find(function(error, schoolClosed) {

            }).exec(callback);
        },
        function(callback){aclPermissions.showMedical(req, res, callback);}, //aclPermissions showMedical
        function(callback){aclPermissions.addMedical(req, res, callback);},  //aclPermissions addMedical
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var array = [];
        var stream = models.SchoolClosed.find().sort({"causeID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.causeID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('schoolClosed/addSchoolClosed',{
                title:'Add School Closed',
                array: array,
                userAuthID: req.user.userPrivilegeID,
                schoolClosed: results[0],
                aclShowMedical: results[1],     //aclPermissions showAddMedical
                aclAddMedical: results[2],      //aclPermissions addAddMedical
                aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};
module.exports.addPost = function(req, res) {
    console.log(req.body.causeID);
    console.log(req.body.causeName);
    var schoolClosed1 = new models.SchoolClosed({
        causeID: req.body.causeID,
        causeName: req.body.causeName
    });
    schoolClosed1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            console.log("err - ",err);
            return res.status(409).send('showAlert')
        }else{
            return res.send({redirect:'/schoolClosed/showSchoolClosed'})
        }
    });
};
/*-------------------------end of adding SchoolClosed*/

/* UPDATE SchoolClosed. -------------------------------*/
module.exports.update = function(req, res) {
    async.parallel([
        function(callback){
            models.SchoolClosed.findById(req.params.id,function(error, schoolClosed) {

            }).exec(callback);
        },
        function(callback){aclPermissions.showMedical(req, res, callback);},  //aclPermissions showMedical
        function(callback){aclPermissions.modifyMedical(req, res, callback);},  //aclPermissions modifyMedical
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var array = [];
        var stream = models.SchoolClosed.find().sort({"causeID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.causeID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('schoolClosed/updateSchoolClosed',{
                title:'Update School Closed',
                userAuthID: req.user.userPrivilegeID,
                array: array,
                schoolClosed: results[0],
                aclShowMedical: results[1],      //aclPermissions ShowMedical
                aclModifyMedical: results[2],      //aclPermissions modifyMedical
                aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};
module.exports.updatePost = function(req, res) {
    var schoolClosedToUpdate1 = req.body.schoolClosedToUpdate;

    models.SchoolClosed.findById({'_id': schoolClosedToUpdate1}, function(err, schoolClosed){
        schoolClosed.causeID = req.body.causeID;
        schoolClosed.causeName = req.body.causeName;
        schoolClosed.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                console.log(err);
                return res.status(409).send('showAlert')
            }else{
                return res.send({redirect:'/schoolClosed/showSchoolClosed'})
            }
        });
    });

};
/*-------------------------end of update SchoolClosed*/

/* DELETE UTILITY. */
module.exports.delete = function(req, res) {
    var schoolClosedToDelete = req.params.id;
        models.SchoolClosed.remove({'_id': schoolClosedToDelete}, function(err) {
            //res.send((err === null) ? { msg: 'Floor not deleted' } : { msg:'error: ' + err });
            res.redirect('/schoolClosed/showSchoolClosed');
        });
};
/* ------------ end of DELETE UTILITY. */
