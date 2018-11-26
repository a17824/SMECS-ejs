//Dependencies
var models = require('./../models');
var async = require("async");
var functions = require('./../functions');


/* Show Alert Road. -------------------------------*/
module.exports.show = function(req, res) {
    async.parallel([
        function(callback){
            models.Alerts.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.AlertRoadFunctions.find().sort({"sortID":1}).exec(callback);
        },
        function(callback){
            models.Alerts.find().sort({"sortID":1}).exec(callback); ////to find all alerts that use a specific function
        },
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        res.render('alertsAndGroups/alerts/road/showAlertRoad', {
            title: 'Alert Road',
            alert: results[0],
            AlertRoadFunctions: results[1],
            alerts: results[2], //to find all alerts that use a specific function
            aclSideMenu: results[3],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    });
};


/* Change Alert Road. -------------------------------*/
module.exports.changeRoad = function(req, res) {
    async.parallel([
        function(callback){
            models.Alerts.findById(req.params.id).exec(callback);
        },
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){
        res.render('alertsAndGroups/alerts/road/ChangeAlertRoad', {
            title: 'Change Alert Road',
            alert: results[0],
            aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    });
};
module.exports.changeRoadPost = function(req, res) {

    var alertToUpdate1 = req.body.alertToUpdate;
    models.Alerts.findById({'_id': alertToUpdate1}, function(err, alert){
        models.AlertsGroup.findOne({'groupID': req.body.alertGroupID}, function(err, group){
            alert.group.groupID = group.groupID;
            alert.group.sortID = group.sortID;
            alert.group.name = group.name;
            alert.group.mp3 = group.sound.mp3;
            alert.group.icon = group.icon;
            alert.group.color.name = group.color.name;
            alert.group.color.bgValue = group.color.bgValue;
            alert.group.color.textValue = group.color.textValue;

            alert.alertRequest911Call = req.body.request911Call;
            alert.whoCanCall911 = req.body.whoCanCall911;
            alert.alertName = req.body.alertName;
            alert.alertID = req.body.alertID;
            alert.sortID = req.body.sortID;
            alert.alertRequestProcedureCompleted = req.body.alertRequestProcedureCompleted;
            alert.alertRequestWeAreSafe = req.body.alertRequestWeAreSafe;
            alert.alertRequestForINeedHelp = req.body.alertRequestForINeedHelp;
            alert.alertRequestSendEmail = req.body.alertRequestSendEmail;
            alert.icon = req.body.icon;


            alert.save(function (err) {
                if (err && (err.code === 11000 || err.code === 11001)) {
                    console.log(err);
                    return res.status(409).send('showAlert')
                }else {
                    res.send({redirect: '/alertGroups/showAlertGroups'});
                }
            });
        });
    });
};

module.exports.deleteRoad = function(req, res) {

};
/*-------------------------end of Alert Road*/






/* CREATE AlertRoadFunctions. -------------------------------*/
module.exports.createFunctions = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertRoadFunctions.find(function(error, alerts) {

            }).exec(callback);
        },
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){

        var arraySort = [];
        var array = [];

        var streamSort = models.AlertRoadFunctions.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
        });

        var stream = models.AlertRoadFunctions.find().sort({"sortID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.functionID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed

            res.render('alertsAndGroups/alerts/road/createFunction',{
                title:'Create Function',
                arraySort: arraySort,
                array: array,
                functions: results[0],
                pageToReturn: req.params.id,
                aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};

module.exports.createFunctionsPost = function(req, res) {

    var function1 = new models.AlertRoadFunctions({
        sortID: req.body.sortID,
        functionID: req.body.functionID,
        functionName: req.body.functionName
    });

    function1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            return res.status(409).send('showAlert')
        }else{
            return res.send({redirect:'/alerts/showRoad/' + req.body.pageToReturn})
        }
    });

};
/*-------------------------end of adding Alerts*/


/* UPDATE AlertRoadFunctions. -------------------------------*/
module.exports.updateFunctions = function(req, res) {
    //console.log('req.params.function_id');
    //console.log(req.params.alert_id);
    async.parallel([
        function(callback){
            models.AlertRoadFunctions.findById(req.params.function_id,function(error, functions) {
            }).exec(callback);

        },
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu


    ],function(err, results){
        var arraySort = [];
        var array = [];

        var streamSort = models.AlertRoadFunctions.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
        });

        var stream = models.AlertRoadFunctions.find().sort({"sortID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.functionID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed

            res.render('alertsAndGroups/alerts/road/updateFunction',{
                title:'Update Function',
                arraySort: arraySort,
                array: array,
                functions: results[0],
                pageToReturn: req.params.alert_id,
                aclSideMenu: results[1],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });
        })
    })
};
module.exports.updateFunctionsPost = function(req, res) {
    var functionToUpdate1 = req.body.alertGroupToUpdate;
    var oldFunctionName = req.body.oldAlertGroupName;
    var newFunctionName = req.body.name;

    models.AlertRoadFunctions.findById({'_id': functionToUpdate1}, function(err, functions){
        functions.functionID = req.body.groupID;
        functions.functionName = req.body.name;
        functions.sortID = req.body.sortID;

        functions.save(function (err) {
            if (err && (err.code === 11000 || err.code === 11001)) {
                console.log(err);
                return res.status(409).send('showAlert')
            }
            else{
                //UPDATE Alerts Function name DATABASE--------
                models.Alerts.find({}, function(err, alerts) {
                    if( err || !alerts) console.log("No alerts to update");
                    else {
                        alerts.forEach(function (alert) {
                            alert.alertRoad.forEach(function (road) {
                                if (road.callFunction.includes(oldFunctionName)) {
                                    var index = road.callFunction.indexOf(oldFunctionName);
                                    road.callFunction.set(index, newFunctionName);
                                    alert.save();
                                }
                            });
                        });
                    }
                });
                //--------end UPDATE Alerts Function name Database

                return res.send({redirect:'/alerts/showRoad/' + req.body.pageToReturn})
            }
        });
    });
};
/*-------------------------end of update AlertRoadFunctions*/


/* DELETE AlertGroups. */
module.exports.deleteFunction = function(req, res) {
    console.log('req.params.function_id = ',req.params.function_id);
    var functionToDeleteID = req.params.function_id;
/*
    models.AlertRoadFunctions.findOne({'_id': functionToDeleteID}, function(err, functionToDelete) {
        if( err || !functionToDelete) console.log("No AlertRoadFunctions to delete");
        else {
            console.log("-------------functionToDelete---------");
            console.log(functionToDelete);

            //UPDATE Alerts Function name DATABASE--------
            models.Alerts.find({}, function(err, alerts) {
                if( err || !alerts) console.log("No alerts to update");
                else {
                    alerts.forEach(function (alert) {
                        alert.alertRoad.forEach(function (road) {
                            if (road.callFunction.includes(functionToDelete.functionName)) {
                                var index = road.callFunction.indexOf(functionToDelete.functionName);
                                road.callFunction.splice(index, 1);
                                alert.save();
                            }
                        });
                    });
                }

            });
            //--------end UPDATE Alerts Function name Database

            models.AlertRoadFunctions.remove({'_id': functionToDeleteID}, function(err) {
                //res.send((err === null) ? { msg: 'Role not deleted' } : { msg:'error: ' + err });
                return res.redirect('/alerts/showRoad/' + req.params.alert_id);

            });

        }


    });
*/
};
/* ---- end of DELETE AlertGroups. */





