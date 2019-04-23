//Dependencies
var models = require('./../models');
var async = require("async");
var aclPermissions = require('./../acl/aclPermissions');
var functions = require('../functions');

/* SHOW ALL ROLES2. */
module.exports.show = function(req, res, next) {
    async.parallel([
        function(callback){
            models.EmailAddresses.find().sort({"sortID": 1}).exec(callback);
        },
        function(callback){
            models.Alerts.find({'alertRequestSendEmail': true}).sort({"sortID": 1}).exec(callback);
        },
        function(callback){aclPermissions.addRoles2(req, res, callback);},   //aclPermissions addRoles2
        function(callback){aclPermissions.modifyRoles2(req, res, callback);}, //aclPermissions modifyRoles2
        function(callback){aclPermissions.deleteRoles2(req, res, callback);}, //aclPermissions deleteRoles2
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        functions.redirectTabUsers(req, res, 'showUsers');
        functions.redirectTabBuildings(req, res, 'showBuilding');

        res.render('emails/showEmails',{
            title:'Emails to send alerts in behalf of School',
            userAuthID: req.user.userPrivilegeID,
            emails: results[0],
            alerts: results[1],
            aclAddRoles2: results[2], //aclPermissions addRoles2
            aclModifyRoles2: results[3],  //aclPermissions modifyRoles2
            aclDeleteRoles2: results[4],  //aclPermissions deleteRoles2
            aclSideMenu: results[5],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    })
};

/* ADD Emails. -------------------------------*/
module.exports.add = function(req, res) {
    async.parallel([
        function(callback){
            models.EmailAddresses.find(function(error, role) {

            }).exec(callback);
        },
        function(callback){aclPermissions.addRoles2(req, res, callback);},  //aclPermissions addRoles2
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        var arraySort = [];
        var array = [];

        let streamSort = models.EmailAddresses.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            let stream = models.EmailAddresses.find().sort({"emailID":1}).cursor();
            stream.on('data', function (doc) {
                array.push(doc.emailID);
            }).on('error', function (err) {
                // handle the error
            }).on('close', function () {
                // the stream is closed
                //console.log(array);
                res.render('emails/addEmail',{
                    title:'Add Email',
                    arraySort: arraySort,
                    array: array,
                    userAuthID: req.user.userPrivilegeID,
                    emails: results[0],
                    aclAddRoles2: results[1],      //aclPermissions addRoles2
                    aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            })
        });


    })
};
module.exports.addPost = function(req, res) {

    let email1 = new models.EmailAddresses({
        emailID: req.body.emailID,
        email: req.body.email,
        emailPassword: req.body.emailPass,
        sortID: req.body.sortID

    });
    email1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            console.log("err - ",err);
            return res.status(409).send('showAlert')
        }else{
            return res.send({redirect:'/emails/showEmails'})
        }
    });
};
/*-------------------------end of adding email*/




/* UPDATE EMAIL. -------------------------------*/
module.exports.update = function(req, res) {
    var arraySort = [];
    var array = [];
    async.parallel([
        function(callback){
            models.EmailAddresses.findById(req.params.id,function(error, role) {}).exec(callback);
        },
        function(callback){aclPermissions.modifyRoles2(req, res, callback);},  //aclPermissions modifyRoles2
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){

        let streamSort = models.EmailAddresses.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            //console.log(arraySort);
            let stream = models.EmailAddresses.find().sort({"emailID":1}).cursor();
            stream.on('data', function (doc) {
                array.push(doc.emailID);
            }).on('error', function (err) {
                // handle the error
            }).on('close', function () {
                // the stream is closed
                //console.log(array);
                res.render('emails/updateEmail',{
                    title:'Update Email',
                    userAuthID: req.user.userPrivilegeID,
                    arraySort: arraySort,
                    array: array,
                    email: results[0],
                    aclModifyRoles2: results[1],      //aclPermissions modifyRoles2
                    aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                    userAuthName: req.user.firstName + ' ' + req.user.lastName,
                    userAuthPhoto: req.user.photo
                });
            })
        });


    })
};
module.exports.updatePost = function(req, res) {
    let emailToUpdate1 = req.body.emailToUpdate;
    models.EmailAddresses.findById({'_id': emailToUpdate1}, function(err, email){
        if(err || !email){console.log('err finding email from EmailAddresses to update = ',err);}
        else {
            email.emailID = req.body.emailID;
            email.email = req.body.email;
            email.sortID = req.body.sortID;
            email.save(function (err) {
                if (err && (err.code === 11000 || err.code === 11001)) {
                    console.log(err);
                    return res.status(409).send('showAlert')
                }
                else {
                    var oldEmailIdToUpdate = req.body.oldEmailID;
                    updateAlerts();
                    return res.send({redirect: '/emails/showEmails'})
                }

                //UPDATE Alerts old emailID/emailName to new emailID/Name
                function updateAlerts() {
                    //Alerts Collection - add new email to all documents
                    models.Alerts.update({
                        "sendEmailWith.emailID": oldEmailIdToUpdate
                    }, {
                        "$set": {
                            "sendEmailWith.emailID": req.body.emailID,
                            "sendEmailWith.email": req.body.email
                        }
                    }, {"multi": true}, function (err, result) {
                        console.log(result);
                    });
                }
                //--------end UPDATE Alerts old emailID/emailName to new emailID/Name
            });
        }
    });
};
/*-------------------------end of update emails*/

/* DELETE Email. */
module.exports.delete = function(req, res) {
    var emailToDelete = req.params.id;
    models.EmailAddresses.findOne({'_id': emailToDelete}, function(err, email) {
        if (err) { console.log('error finding email. err= ',err) }
        else{
            models.Alerts.findOne({ 'alertRequestSendEmail': true, 'sendEmailWith.emailID': email.emailID }, function (err2, result) {
                if (err2 || result) {
                    console.log("Email NOT deleted");
                    //return res.status(409).send(' ALERT! ' + email.email + ' email not deleted because there are Alerts using this email. Please change Alerts that are using this email to other email and then delete this email.')
                    req.flash('error_messages', ' Attention! ' + email.email + ' email not deleted because there are Alerts using this email. <br> Please change Alerts that are using this email to other email and then delete this email.');
                    res.redirect('/emails/showEmails');
                }
                else {
                    models.Alerts.find({ 'alertRequestSendEmail': false, 'sendEmailWith.emailID': email.emailID }, function (err2, alerts) {
                        if (err2 || !alerts) {console.log("Good = no alerts are using email address that will be removed from emails database");}
                        else {
                           alerts.forEach(function (alert) {
                               alert.sendEmailWith.emailID = undefined;
                               alert.sendEmailWith.email = undefined;
                               alert.save(function (err) {
                                   if (err) console.log('error deleting email from alert. err = ',err);
                               });
                           });

                        }
                    });
                    models.EmailAddresses.remove({'_id': emailToDelete}, function(err) {
                        if(err){console.log('err deleting email from EmailAddresses = ',err);}
                        else {
                            console.log("email deleted");
                            res.redirect('/emails/showEmails');
                        }
                    });

                }
            });
        }
    });
};
/* ------------ end of DELETE Email. */

