//Dependencies
var models = require('./../../models');
var async = require("async");
var aclPermissions = require('./../../acl/aclPermissions');
var functions = require('../../functions');

/* SHOW ALL Utilities. */
module.exports.show = function(req, res, next) {
    async.parallel([
        function(callback){
            models.Utilities.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){
            models.UtilityUsers.find().exec(callback);
        },
        function(callback){aclPermissions.addUtilities(req, res, callback);},   //aclPermissions addUtilities
        function(callback){aclPermissions.modifyUtilities(req, res, callback);},   //aclPermissions modifyUtilities
        function(callback){aclPermissions.deleteUtilities(req, res, callback);},   //aclPermissions deleteUtilities
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTab(req, res, 'showUsers');
        res.render('utilities/showUtilities',{
            title:'Utilities Failures',
            userAuthID: req.user.userPrivilegeID,
            utility: results[0],
            utilityUsers: results[1],
            aclAddUtilities: results[2], //aclPermissions addUtilities
            aclModifyUtilities: results[3], //aclPermissions modifyUtilities
            aclDeleteUtilities: results[4], //aclPermissions deleteUtilities
            aclSideMenu: results[5],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};

/* ADD Utilities. -------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.Utilities.find(function(error, utility) {

            }).exec(callback);
        },
        function(callback){
            models.UtilityUsers.find(function(error, utility) {

            }).exec(callback);
        },
        function(callback){aclPermissions.showUtilities(req, res, callback);}, //aclPermissions showUtilities
        function(callback){aclPermissions.addUtilities(req, res, callback);},  //aclPermissions addUtilities
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var arraySort = [];
        var array = [];

        var streamSort = models.Utilities.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(arraySort);
        });

        var stream = models.Utilities.find().sort({"utilityID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.utilityID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('utilities/addUtilities',{
                title:'Add Utility',
                arraySort: arraySort,
                array: array,
                userAuthID: req.user.userPrivilegeID,
                utility: results[0],
                utilityUsers: results[1],
                aclShowUtilities: results[2],     //aclPermissions showAddUtilities
                aclAddUtilities: results[3],      //aclPermissions addAddUtilities
                aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};
module.exports.addPost = function(req, res) {
    console.log(req.body.smecsUsers);
    var utility1 = new models.Utilities({
        utilityID: req.body.utilityID,
        utilityName: req.body.utilityName,
        contactName: req.body.contactName,
        phone: req.body.phone,
        email: req.body.email,
        smecsApp: req.body.smecsApp,
        smecsUsers: req.body.smecsUsers,
        sortID: req.body.sortID
    });
    utility1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            console.log("err - ",err);
            return res.status(409).send('showAlert')
        }else{
            return res.send({redirect:'/utilities/showUtilities'})
        }
    });
};
/*-------------------------end of adding Utilities*/

/* UPDATE Utilities. -------------------------------*/
module.exports.update = function(req, res) {
    async.parallel([
        function(callback){
            models.Utilities.findById(req.params.id,function(error, utility) {

            }).exec(callback);
        },
        function(callback){
            models.UtilityUsers.find(function(error, utility) {

            }).exec(callback);
        },
        function(callback){aclPermissions.showUtilities(req, res, callback);},  //aclPermissions showUtilities
        function(callback){aclPermissions.modifyUtilities(req, res, callback);},  //aclPermissions modifyUtilities
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var arraySort = [];
        var array = [];

        var streamSort = models.Utilities.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(arraySort);
        });

        var stream = models.Utilities.find().sort({"utilityID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.utilityID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('utilities/updateUtilities',{
                title:'Update Utility',
                userAuthID: req.user.userPrivilegeID,
                arraySort: arraySort,
                array: array,
                utility: results[0],
                utilityUsers: results[1],
                aclShowUtilities: results[2],      //aclPermissions ShowUtilities
                aclModifyUtilities: results[3],      //aclPermissions modifyUtilities
                aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};
module.exports.updatePost = function(req, res) {
    var utilityToUpdate1 = req.body.utilityToUpdate;
    models.Utilities.findById({'_id': utilityToUpdate1}, function(err, utility){
        utility.utilityID = req.body.utilityID;
        utility.utilityName = req.body.utilityName;
        utility.contactName = req.body.contactName;
        utility.phone = req.body.phone;
        utility.email = req.body.email;
        utility.smecsApp = req.body.smecsApp;
        utility.defaultContact =  req.body.defaultContact;
        utility.smecsUsers = req.body.smecsUsers;
        utility.sortID = req.body.sortID;
        utility.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                console.log(err);
                return res.status(409).send('showAlert')
            }else{
                return res.send({redirect:'/utilities/showUtilities'})
            }
        });
    });

};
/*-------------------------end of update Utilities*/

/* DELETE UTILITY. */
module.exports.delete = function(req, res) {
    var utilityToDelete = req.params.id;
        models.Utilities.remove({'_id': utilityToDelete}, function(err) {
            //res.send((err === null) ? { msg: 'Floor not deleted' } : { msg:'error: ' + err });
            res.redirect('/utilities/showUtilities');
        });
};
/* ------------ end of DELETE UTILITY. */
