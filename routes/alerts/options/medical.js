//Dependencies
var models = require('./../../models');
var async = require("async");
var aclPermissions = require('./../../acl/aclPermissions');




/* SHOW ALL Medical. */
module.exports.show = function(req, res, next) {
    /*
     models.Medical.find(function(err, medical) {
     res.render('medical/showMedical', { title: 'Medical Failures', medical: medical });
     }).sort({"utilityID":1});
     */
    async.parallel([
        function(callback){
            models.Medical.find().sort({"utilityID":1}).exec(callback);
        },
        function(callback){aclPermissions.addMedical(req, res, callback);},   //aclPermissions addMedical
        function(callback){aclPermissions.modifyMedical(req, res, callback);},   //aclPermissions modifyMedical
        function(callback){aclPermissions.deleteMedical(req, res, callback);}   //aclPermissions deleteMedical

    ],function(err, results){
        //console.log(results[2]);
        res.render('medical/showMedical',{
            title:'Medical Emergencies',
            userAuthID: req.user.userPrivilegeID,
            medical: results[0],
            aclAddMedical: results[1], //aclPermissions addMedical
            aclModifyMedical: results[2], //aclPermissions modifyMedical
            aclDeleteMedical: results[3] //aclPermissions deleteMedical

        });
    })
};

/* ADD Medical. -------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.Medical.find(function(error, medical) {

            }).exec(callback);
        },
        function(callback){aclPermissions.showMedical(req, res, callback);}, //aclPermissions showMedical
        function(callback){aclPermissions.addMedical(req, res, callback);}  //aclPermissions addMedical

    ],function(err, results){
        var array = [];
        var stream = models.Medical.find().sort({"utilityID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.utilityID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('medical/addMedical',{
                title:'Add Medical Emergency',
                array: array,
                userAuthID: req.user.userPrivilegeID,
                medical: results[0],
                aclShowMedical: results[1],     //aclPermissions showAddMedical
                aclAddMedical: results[2]      //aclPermissions addAddMedical
            });
        })
    })
};
module.exports.addPost = function(req, res) {
    console.log(req.body.utilityID);
    console.log(req.body.utilityName);
    var medical1 = new models.Medical({
        utilityID: req.body.utilityID,
        utilityName: req.body.utilityName
    });
    medical1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            console.log("rrrrrrrrrrrrrrrrrrrrrrrrrr");
            return res.status(409).send('showAlert')
        }else{
            console.log("11111111111111111111");
            return res.send({redirect:'/medical/showMedical'})
        }
    });
};
/*-------------------------end of adding Medical*/

/* UPDATE Medical. -------------------------------*/
module.exports.update = function(req, res) {
    async.parallel([
        function(callback){
            models.Medical.findById(req.params.id,function(error, medical) {

            }).exec(callback);
        },
        function(callback){aclPermissions.showMedical(req, res, callback);},  //aclPermissions showMedical
        function(callback){aclPermissions.modifyMedical(req, res, callback);}  //aclPermissions modifyMedical

    ],function(err, results){
        var array = [];
        var stream = models.Medical.find().sort({"utilityID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.utilityID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(array);
            res.render('medical/updateMedical',{
                title:'Update Medical Emergency',
                userAuthID: req.user.userPrivilegeID,
                array: array,
                medical: results[0],
                aclShowMedical: results[1],      //aclPermissions ShowMedical
                aclModifyMedical: results[2]      //aclPermissions modifyMedical
            });
        })
    })
};
module.exports.updatePost = function(req, res) {
    var medicalToUpdate1 = req.body.medicalToUpdate;

    models.Medical.findById({'_id': medicalToUpdate1}, function(err, medical){
        medical.utilityID = req.body.utilityID;
        medical.utilityName = req.body.utilityName;
        medical.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                console.log(err);
                return res.status(409).send('showAlert')
            }else{
                return res.send({redirect:'/medical/showMedical'})
            }
        });
    });

};
/*-------------------------end of update Medical*/

/* DELETE UTILITY. */
module.exports.delete = function(req, res) {
    var medicalToDelete = req.params.id;
        models.Medical.remove({'_id': medicalToDelete}, function(err) {
            //res.send((err === null) ? { msg: 'Floor not deleted' } : { msg:'error: ' + err });
            res.redirect('/medical/showMedical');
        });
};
/* ------------ end of DELETE UTILITY. */
