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

        let array = [];
        let stream = models.Alerts.findById(req.params.id).sort({"alertRoad.step":1}).cursor();
        stream.on('data', function (doc) {
            doc.alertRoad.forEach(function (alertRoad) {
                array.push(alertRoad.step);
            })

        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            array.sort((a,b) => a-b);

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
    let alertID_pageToReturn = req.body.pageToReturn;
    let step = req.body.stepNumber;
    let functions = req.body.functions;
    let redirectAPI = req.body.redirectAPI;
    let redirectEJS = req.body.redirectEJS;

    let newStep = {
        step: step,
        callFunction: functions,
        redirectAPI: redirectAPI,
        redirectEJS: redirectEJS
    };
    models.Alerts.findById({'_id': alertID_pageToReturn}, function(err, alert){
        if (err || !alert) {
            console.log('err - finding alert');
        }else{
            alert.alertRoad.push(newStep);
            alert.save();

            //update Functions database alertsWithThisFunction Array
            if ( typeof functions !== 'undefined' && functions ) {
                functions.forEach(function(functionName){
                    models.AlertRoadFunctions.update(
                        {functionName: functionName},
                        {$addToSet: { alertsWithThisFunction: alert.alertID } }, function (err, listing) {
                            if (err) {
                                res.send("functionName - There was a problem adding the alert.alertID to the alertsWithThisFunction" + err);
                            }
                            else {
                                console.log("functionName - Success adding alert.alertID to alertsWithThisFunction!");
                                console.log(listing);
                            }
                        }
                    );
                });
            }

            //update Redirections database alertsWithThisFunction Array
            if ( typeof redirectAPI !== 'undefined' && redirectAPI ) {
                models.AlertRoadRedirection.update(
                    {redirectAPI: redirectAPI},
                    {$addToSet: { alertsWithThisRedirect: alert.alertID } }, function (err, listing) {
                        if (err) {
                            res.send("redirectAPI - There was a problem adding the alert.alertID to the alertsWithThisRedirect" + err);
                        }
                        else {
                            console.log("redirectAPI - Success adding alert.alertID to alertsWithThisRedirect!");
                            console.log(listing);
                        }
                    }
                );
            }
            if ( typeof redirectEJS !== 'undefined' && redirectEJS ) {
                models.AlertRoadRedirection.update(
                    {redirectEJS: redirectEJS},
                    {$addToSet: { alertsWithThisRedirect: alert.alertID } }, function (err, listing) {
                        if (err) {
                            res.send("redirectEJS - There was a problem adding the alert.alertID to the alertsWithThisRedirect" + err);
                        }
                        else {
                            console.log("redirectEJS - Success adding alert.alertID to alertsWithThisRedirect!");
                            console.log(listing);
                        }
                    }
                );
            }
            //end of Update Redirections database alertsWithThisFunction Array
        }
        return res.send({redirect:'/alerts/showRoad/' + req.body.pageToReturn})
    });
};


/* UPDATE AlertRoadStep. -------------------------------*/
module.exports.updateStep = function(req, res) {
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
        let stepToUpdate = req.params.step_id;
        let stepValues;
        let array = [];
        let stream = models.Alerts.findById(req.params.alert_id).sort({"alertRoad.step":1}).cursor();
        stream.on('data', function (doc) {
            doc.alertRoad.forEach(function (alertRoad) {
                array.push(alertRoad.step);
                if(alertRoad.step == stepToUpdate) {
                    stepValues = {
                        step: alertRoad.step,
                        callFunction: alertRoad.callFunction,
                        redirectAPI: alertRoad.redirectAPI,
                        redirectEJS: alertRoad.redirectEJS
                    }
                }
            })

        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
            array.sort((a,b) => a-b);

            console.log('pageToReturn = ',req.params.alert_id);
            res.render('alertsAndGroups/alerts/road/steps/updateStep',{
                title:'Update Step',
                array: array,
                stepValues: stepValues,
                functions: results[0],
                redirections: results[1],
                pageToReturn: req.params.alert_id,
                aclSideMenu: results[2],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                userAuthName: req.user.firstName + ' ' + req.user.lastName,
                userAuthPhoto: req.user.photo
            });

        })
    });
};
module.exports.updateStepPost = function(req, res) {
    let alertID_pageToReturn = req.body.pageToReturn;
    let oldStep = req.body.oldStep;
    let step = req.body.stepNumber;
    let functions = req.body.functions;
    let redirectAPI = req.body.redirectAPI;
    let redirectEJS = req.body.redirectEJS;
    let arrayFunctionsRemoved = [];

    models.Alerts.findById({'_id': alertID_pageToReturn }, function(err, alert){
        if (err || !alert) {
            console.log('err - finding alert');
        }else{
            alert.alertRoad.forEach(function(alertRoad){
                if(alertRoad.step == oldStep) {
                    buildArrayWithFunctionsRemoved(alertRoad, functions, arrayFunctionsRemoved); //gets all functions removed from this step
                    //console.log('arrayFunctionsRemoved = ',arrayFunctionsRemoved);
                    let oldRedirectAPI = alertRoad.redirectAPI;
                    let oldRedirectEJS = alertRoad.redirectEJS;

                    alertRoad.step =  step;
                    alertRoad.callFunction =  functions;
                    alertRoad.redirectAPI =  redirectAPI;
                    alertRoad.redirectEJS =  redirectEJS;
                    alert.save(function (err) {
                        if (err && (err.code === 11000 || err.code === 11001)) {
                            console.log(err);
                            return res.status(409).send('showAlert')
                        }else {
                            console.log('success updating AlertRoad');


                        }
                    });
                    //update Functions database alertsWithThisFunction Array
                    searchForFunctionsInAllAlertRoad(alert, arrayFunctionsRemoved); //gets array with functions names to delete from Functions
                    //console.log('arrayFunctionsRemoved updated with Functions that needs to be removed from Functions.AlertsWithThisFunction = ',arrayFunctionsRemoved);
                    addFunctionsToDB(res, functions, alert); //update Functions (ADD) database alertsWithThisFunction Array
                    deleteFunctionsToDB(res, arrayFunctionsRemoved, alert); //update Functions (DELETES) database alertsWithThisFunction Array

                    //update Redirections database alertsWithThisFunction Array
                    addRedirectionToDB(res, alert, alertRoad.redirectAPI, alertRoad.redirectEJS); //update Redirections (ADD) database alertsWithThisFunction Array
                    deleteRedirectionToDB(res, alert, oldRedirectAPI, oldRedirectEJS, alertRoad.step); //update Redirections (DELETES) database alertsWithThisFunction Array



                    return res.send({redirect:'/alerts/showRoad/' + req.body.pageToReturn})
                }
            });

            /*


            //update Redirections database alertsWithThisFunction Array
            if ( typeof redirectAPI !== 'undefined' && redirectAPI ) {
                models.AlertRoadRedirection.update(
                    {redirectAPI: redirectAPI},
                    {$addToSet: { alertsWithThisRedirect: alert.alertID } }, function (err, listing) {
                        if (err) {
                            res.send("redirectAPI - There was a problem adding the alert.alertID to the alertsWithThisRedirect" + err);
                        }
                        else {
                            console.log("redirectAPI - Success adding alert.alertID to alertsWithThisRedirect!");
                            console.log(listing);
                        }
                    }
                );
            }
            if ( typeof redirectEJS !== 'undefined' && redirectEJS ) {
                models.AlertRoadRedirection.update(
                    {redirectEJS: redirectEJS},
                    {$addToSet: { alertsWithThisRedirect: alert.alertID } }, function (err, listing) {
                        if (err) {
                            res.send("redirectEJS - There was a problem adding the alert.alertID to the alertsWithThisRedirect" + err);
                        }
                        else {
                            console.log("redirectEJS - Success adding alert.alertID to alertsWithThisRedirect!");
                            console.log(listing);
                        }
                    }
                );
            }
            //end of update Functions database alertsWithThisFunction Array
            */
        }

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

function buildArrayWithFunctionsRemoved(alertRoad, functions, arrayFunctionsRemoved) {
    if ( typeof functions !== 'undefined' && functions ){
        alertRoad.callFunction.forEach(function (oldFunct) {
            let flagFound = 0;
            for (let z = 0; z < functions.length; z++) {
                if (oldFunct == functions[z]) {
                    flagFound = 1;
                    break;
                }
            }
            if(flagFound == 0)
                arrayFunctionsRemoved.push(oldFunct);
        });
    }else { //if all functions were removed
        alertRoad.callFunction.forEach(function (oldFunct) {
            arrayFunctionsRemoved.push(oldFunct);
        });
    }



}

function searchForFunctionsInAllAlertRoad(alert, arrayFunctionsRemoved) {
    //final array with FUnctions to be removed
    if ( arrayFunctionsRemoved.length > 0 ) {
        arrayFunctionsRemoved.forEach(function(functionNameToRemove){
            let flagFound = 0;
            alert.alertRoad.forEach(function (alertRoad) {
                if ( typeof alertRoad.callFunction !== 'undefined' && alertRoad.callFunction ) {
                    for (let z = 0; z < alertRoad.callFunction.length; z++) {
                        if (functionNameToRemove == alertRoad.callFunction[z]) {
                            flagFound = 1;
                            break;
                        }
                    }
                }
            });
            if(flagFound == 1)
                arrayFunctionsRemoved.splice(functionNameToRemove, 1);

        });
    }
}
function addFunctionsToDB(res, functions, alert) {
    if ( typeof functions !== 'undefined' && functions ) {
        functions.forEach(function(functionName){
            models.AlertRoadFunctions.update(
                {functionName: functionName},
                {$addToSet: { alertsWithThisFunction: alert.alertID } }, function (err, listing) {
                    if (err) {
                        res.send("functionName - There was a problem adding the alert.alertID to the alertsWithThisFunction" + err);
                    }
                    else {
                        console.log("functionName - Success adding alert.alertID to alertsWithThisFunction!");
                        console.log(listing);
                    }
                }
            );
        });
    }
}
function deleteFunctionsToDB(res, toSearch, alert) {
    if ( typeof toSearch !== 'undefined' && toSearch ) {
        toSearch.forEach(function(functionName){
            models.AlertRoadFunctions.update(
                {functionName: functionName},
                {$pull: { alertsWithThisFunction: alert.alertID } }, function (err, listing) {
                    if (err) {
                        res.send("functionName - There was a problem removing the alert.alertID to the alertsWithThisFunction" + err);
                    }
                    else {
                        console.log("functionName - Success removing alert.alertID from alertsWithThisFunction!");
                        console.log(listing);
                    }
                }
            );
        });
    }

}




function addRedirectionToDB(res, alert, redirectAPI, redirectEJS) {
    //update (ADD) Redirections database alertsWithThisFunction Array
    if ( typeof redirectAPI !== 'undefined' && redirectAPI ) {
        models.AlertRoadRedirection.update(
            {redirectAPI: redirectAPI},
            {$addToSet: { alertsWithThisRedirect: alert.alertID } }, function (err, listing) {
                if (err) {
                    res.send("redirectAPI - There was a problem adding the alert.alertID to the alertsWithThisRedirect" + err);
                }
                else {
                    console.log("redirectAPI - Success adding alert.alertID to alertsWithThisRedirect!");
                    console.log(listing);
                }
            }
        );
    }
    if ( typeof redirectEJS !== 'undefined' && redirectEJS ) {
        models.AlertRoadRedirection.update(
            {redirectEJS: redirectEJS},
            {$addToSet: { alertsWithThisRedirect: alert.alertID } }, function (err, listing) {
                if (err) {
                    res.send("redirectEJS - There was a problem adding the alert.alertID to the alertsWithThisRedirect" + err);
                }
                else {
                    console.log("redirectEJS - Success adding alert.alertID to alertsWithThisRedirect!");
                    console.log(listing);
                }
            }
        );
    }
    //end of Update Redirections database alertsWithThisFunction Array
}
function deleteRedirectionToDB(res, alert, oldRedirectionAPI, oldRedirectionEJS, step) {

    //update (DELETE) oldRedirectAPI from AlertRoadRedirection DB
    let flagFoundAPI = 0;
    if ( oldRedirectionAPI.length > 0 ) {



            models.AlertRoadRedirection.find({}, function (err, redi) {
                if (err || !r) {
                    console.log('AlertRoadRedirection EJS not updated successfully');
                }
                else {
                    let flagFoundAPI = 0;

                    for (let z = 0; z < alert.alertRoad.length; z++) {

                        if (redi.redirectAPI == alertRoad[z].redirectAPI &&
                            typeof alert.alertRoad[z].redirectAPI !== 'undefined' && alert.alertRoad[z].redirectAPI && alert.alertRoad[z].step == step){ //exists
                            flagFoundAPI = 1;
                            break
                        }
                        else {
                            if (redi.redirectEJS == alertRoad[z].redirectEJS &&
                                typeof alert.alertRoad[z].redirectEJS !== 'undefined' && alert.alertRoad[z].redirectEJS && alert.alertRoad[z].step == step){ //exists){ //exists
                                flagFoundAPI = 1;
                                break
                            }
                        }
                    }
                }
                if (flagFoundAPI == 0){
                    if (redi.alertsWithThisRedirect.includes(alert.alertID)) {
                        console.log('DELETE API');
                        let index = redi.alertsWithThisRedirect.indexOf(alert.alertID);
                        redi.alertsWithThisRedirect.splice(index, 1);
                        redi.save();
                    }
                }
            });


    }
    //end of update (DELETE) from AlertRoadRedirection DB


    /*
    //update (DELETE) oldRedirectEJS from AlertRoadRedirection DB
    let flagFoundEJS = 0;
    if ( oldRedirectionEJS.length > 0 ) {
        alert.alertRoad.forEach(function (alertRoad) {
            if ( typeof alertRoad.redirectEJS !== 'undefined' && alertRoad.redirectEJS && alertRoad.step == step ) {

                models.AlertRoadRedirection.findOne({'redirectAPI': oldRedirectionAPI}, function (err, r) {
                    if (err || !r) {
                        console.log('AlertRoadRedirection API not updated successfully');
                    }
                    else {
                        console.log('step = ',step);
                        console.log('oldRedirectionEJS = ',oldRedirectionEJS);
                        console.log('alertRoad.redirectEJS = ',alertRoad.redirectEJS);
                        console.log('r.redirectEJS = ',r.redirectEJS);

                        if (oldRedirectionEJS == alertRoad.redirectEJS){
                            flagFoundEJS = 1;
                            if (alertRoad.redirectEJS != r.redirectEJS) {
                                if (r.alertsWithThisRedirect.includes(alert.alertID)) {
                                    console.log('DELETE EJS');
                                    let index = r.alertsWithThisRedirect.indexOf(alert.alertID);
                                    r.alertsWithThisRedirect.splice(index, 1);
                                    r.save();
                                }
                            }

                        }
                        else{

                            //deleteAlertsWithThisRedirect(oldRedirectionAPI,oldRedirectionEJS);
                            if (alertRoad.redirectEJS != r.redirectEJS) {
                                if (r.alertsWithThisRedirect.includes(alert.alertID)) {
                                    console.log('FUN DELETE EJS');
                                    let index = r.alertsWithThisRedirect.indexOf(alert.alertID);
                                    r.alertsWithThisRedirect.splice(index, 1);
                                    r.save();
                                }
                            }
                        }

                    }
                });

            }
        });
    }
    //end of update (DELETE) oldRedirectEJS from AlertRoadRedirection DB
    function deleteAlertsWithThisRedirect(oldRedirectionAPI,oldRedirectionEJS) {
        if(flagFoundAPI == 0 && flagFoundEJS == 0) {
            models.AlertRoadRedirection.update(
                {redirectAPI: oldRedirectionAPI},
                {$pull: { alertsWithThisRedirect: alert.alertID } }, function (err, listing) {
                    if (err) {
                        res.send("oldRedirectionAPI - There was a problem removing the alert.alertID to the alertsWithThisRedirect" + err);
                    }
                    else {
                        //console.log("oldRedirectionAPI - Success removing alert.alertID from alertsWithThisRedirect!");
                        //console.log(listing);
                    }
                }
            );
            models.AlertRoadRedirection.update(
                {redirectEJS: oldRedirectionEJS},
                {$pull: { alertsWithThisRedirect: alert.alertID } }, function (err, listing) {
                    if (err) {
                        res.send("oldRedirectionAPI - There was a problem removing the alert.alertID to the alertsWithThisRedirect" + err);
                    }
                    else {
                        //console.log("oldRedirectionAPI - Success removing alert.alertID from alertsWithThisRedirect!");
                        //console.log(listing);
                    }
                }
            );
        }
    }
    */
}
