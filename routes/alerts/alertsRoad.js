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
            models.AlertRoadRedirection.find().sort({"sortID":1}).exec(callback);
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
            AlertRoadRedirection: results[2],
            alerts: results[3], //to find all alerts that use a specific function
            aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
            userAuthName: req.user.firstName + ' ' + req.user.lastName,
            userAuthPhoto: req.user.photo
        });
    });
};





/* CREATE AlertRoadStep. -------------------------------*/
module.exports.createStep = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertRoadFunctions.find(function(error, alerts) {

            }).exec(callback);
        },
        function(callback){
            models.AlertRoadRedirection.find(function(error, alerts) {

            }).exec(callback);
        },
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){

        var array = [];
        var stream = models.Alerts.findById(req.params.id).sort({"alertRoad.step":1}).cursor();
        stream.on('data', function (doc) {
            doc.alertRoad.forEach(function (alertRoad) {
                array.push(alertRoad.step);
            })

        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            array.sort((a,b) => a-b);
            console.log('array = ',array);

            res.render('alertsAndGroups/alerts/road/steps/createStep',{
                title:'Create Step',
                array: array,
                functions: results[0],
                redirections: results[1],
                pageToReturn: req.params.id,
                aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });

        })
    });
};
module.exports.createStepPost = function(req, res) {
    console.log('stepNumber = ',req.body.stepNumber);
    console.log('redirectAPI = ',req.body.redirectAPI);
    console.log('redirectEJS = ',req.body.redirectEJS);

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

            res.render('alertsAndGroups/alerts/road/functions/createFunction',{
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

            res.render('alertsAndGroups/alerts/road/functions/updateFunction',{
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


/* DELETE Function. */
module.exports.deleteFunction = function(req, res) {
    var functionToDeleteID = req.params.function_id;

    models.AlertRoadFunctions.findOne({'_id': functionToDeleteID}, function(err, functionToDelete) {
        if( err || !functionToDelete) console.log("No AlertRoadFunctions to delete");
        else {
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
};
/* ---- end of DELETE Function. */









/* CREATE AlertRoadRedirection. -------------------------------*/
module.exports.createRedirection = function(req, res) {
    async.parallel([
        function(callback){
            models.AlertRoadRedirection.find(function(error, alerts) {

            }).exec(callback);
        },
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu

    ],function(err, results){

        var arraySort = [];
        var array = [];

        var streamSort = models.AlertRoadRedirection.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
        });

        var stream = models.AlertRoadRedirection.find().sort({"sortID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.redirectID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed

            res.render('alertsAndGroups/alerts/road/redirections/createRedirection',{
                title:'Create Redirection',
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

module.exports.createRedirectionPost = function(req, res) {

    var redirect1 = new models.AlertRoadRedirection({
        sortID: req.body.sortID,
        redirectID: req.body.redirectID,
        redirectAPI: req.body.redirectAPI,
        redirectEJS: req.body.redirectEJS
    });

    redirect1.save(function (err) {
        if (err && (err.code === 11000 || err.code === 11001)) {
            return res.status(409).send('showAlert')
        }else{
            return res.send({redirect:'/alerts/showRoad/' + req.body.pageToReturn})
        }
    });

};
/*-------------------------end of adding Redirection*/


/* UPDATE AlertRoadRedirection. -------------------------------*/
module.exports.updateRedirection = function(req, res) {
    //console.log('req.params.function_id');
    //console.log(req.params.alert_id);
    async.parallel([
        function(callback){
            models.AlertRoadRedirection.findById(req.params.function_id,function(error, functions) {
            }).exec(callback);

        },
        function(callback) {functions.aclSideMenu(req, res, function (acl) {callback(null, acl);});} //aclPermissions sideMenu


    ],function(err, results){
        var arraySort = [];
        var array = [];

        var streamSort = models.AlertRoadRedirection.find().sort({"sortID":1}).cursor();
        streamSort.on('data', function (doc) {
            arraySort.push(doc.sortID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
        });

        var stream = models.AlertRoadRedirection.find().sort({"sortID":1}).cursor();
        stream.on('data', function (doc) {
            array.push(doc.redirectID);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed

            res.render('alertsAndGroups/alerts/road/redirections/updateRedirection',{
                title:'Update Redirection',
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
module.exports.updateRedirectionPost = function(req, res) {
    var redirectToUpdate1 = req.body.alertGroupToUpdate;
    var newRedirectID = req.body.newRedirectID;
    var newSortID = req.body.sortID;
    var oldRedirectAPI = req.body.oldRedirectAPI;
    var oldRedirectEJS = req.body.oldRedirectEJS;
    var newRedirectAPI = req.body.newRedirectAPI;
    var newRedirectEJS = req.body.newRedirectEJS;
    var pageToReturn = req.body.pageToReturn;

    models.AlertRoadRedirection.findById({'_id': redirectToUpdate1}, function(err, redirection){
        redirection.redirectID = newRedirectID;
        redirection.redirectAPI = newRedirectAPI;
        redirection.redirectEJS = newRedirectEJS;
        redirection.sortID = newSortID;

        redirection.save(function (err) {
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
                                if (road.redirectAPI == oldRedirectAPI) {
                                    road.redirectAPI = newRedirectAPI;
                                    alert.save();
                                }
                                if (road.redirectEJS == oldRedirectEJS) {
                                    road.redirectEJS = newRedirectEJS;
                                    alert.save();
                                }
                            });
                        });
                    }
                });
                //--------end UPDATE Alerts Function name Database

                return res.send({redirect:'/alerts/showRoad/' + pageToReturn})
            }
        });
    });
};
/*-------------------------end of update AlertRoadFunctions*/


/* DELETE Redirection. */
module.exports.deleteRedirection = function(req, res) {
    var functionToDeleteID = req.params.function_id;

    models.AlertRoadRedirection.findOne({'_id': functionToDeleteID}, function(err, redirectionToDelete) {
        if( err || !redirectionToDelete) console.log("No AlertRoadRedirections to delete");
        else {
            //UPDATE Alerts Redirections name DATABASE--------
            models.Alerts.find({}, function(err, alerts) {
                if( err || !alerts) console.log("No alerts to update");
                else {
                    alerts.forEach(function (alert) {
                        alert.alertRoad.forEach(function (road) {
                            if (road.redirectAPI == redirectionToDelete.redirectAPI) {
                                road.redirectAPI = undefined;
                                alert.save();
                            }
                            if (road.redirectEJS == redirectionToDelete.redirectEJS) {
                                road.redirectEJS = undefined;
                                alert.save();
                            }
                        });
                    });
                }

            });
            //--------end UPDATE Alerts Function name Database

            models.AlertRoadRedirection.remove({'_id': functionToDeleteID}, function(err) {
                //res.send((err === null) ? { msg: 'Role not deleted' } : { msg:'error: ' + err });
                return res.redirect('/alerts/showRoad/' + req.params.alert_id);
            });
        }
    });
};
/* ---- end of DELETE Function. */
