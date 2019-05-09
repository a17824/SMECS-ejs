//Dependencies
var models = require('./../../models');
var async = require("async");
var functions = require('./../../functions');
let redirectTo = require('./createAlert');


module.exports.reviewAlert = function(req, res) {
    async.parallel([
        function(callback){models.AlertSentTemp.findById(req.params.id).exec(callback);},
        function(callback){models.Floors.find().exec(callback);},
        function(callback){models.Utilities.find().exec(callback);},
        function(callback){models.Alerts.find().exec(callback);},
        function(callback) {
            if(req.decoded) { //API user
                models.Users.findOne({'email': req.decoded.user.email}).exec(callback);
            }else{  //EJS user
                functions.aclSideMenu(req, res, function (acl) {callback(null, acl);}); //aclPermissions sideMenu
            }
        }

    ],function(err, results){
        if (!results[0]) {
            functions.alertTimeExpired(req,res);
        }
        else {

            let arraySituations =[];
            if(results[0].alertNameID == 26) {
                reqButtons(arraySituations, results[0], function (result3) {
                    getRenderJson();
                });
            }
            else {
                getRenderJson();
            }
            function getRenderJson() {
                if(req.decoded){ // run SMECS API
                    res.json({
                        success: true,
                        userAuthGroupAlerts: results[4].userRoleName, //for Call911 button
                        info: results[0],
                        floor: results[1],
                        utilities: results[2],
                        results: results[3], // check if alert is softDeleted for Utilities Failure
                    });

                }else{  // run SMECS EJS
                    res.render('alerts/sending/reviewAlert', {
                        title: 'Review Alert',
                        userAuthRoleName: req.user.userRoleName,
                        info: results[0],
                        floor: results[1],
                        utilities: results[2],
                        alerts: results[3], // check if alert is softDeleted for Utilities Failure
                        arraySituations: arraySituations,
                        aclSideMenu: results[4],  //aclPermissions for sideMenu.ejs ex: if(aclSideMenu.users.checkbox == true)
                        userAuthName: req.user.firstName + ' ' + req.user.lastName,
                        userAuthPhoto: req.user.photo
                    });
                }
            }

        }
    })
};

module.exports.postReviewAlert = function(req, res, next) {
    var alertToUpdate1 = req.body.alertToUpdate;

    models.AlertSentTemp.findById({'_id': alertToUpdate1}, function (err, tempAlert) {
        if (!tempAlert) {
            functions.alertTimeExpired(req,res);
        }
        else {
            /****************************       ALERT ROAD       ****************************/
            /** functions needed here are: floor.saveFloorFile, student.updateStudentFile  **/
            redirectTo.redirectTo(req,res,tempAlert,'GETtoPOST');
        }
    });
};


function reqButtons(arraySituations, alert, callback) {

    let array = [];
    let reqOnArray = [];
    alert.reqAssOn.forEach(function (val) {
        array = [];
        array = val.split('_|_').map(String);

        let reqOn = {
            utilityID: array[0],
            utilityName: array[1],
            type: array[2]

        };
        reqOnArray.push(reqOn);

    });


            //radio OFF/ON
            let check = '';
            let onOffSwitch = 'onoffswitch';
            let checkbox = 'onoffswitch-checkbox';
            let label = 'onoffswitch-label';
            let inner = 'onoffswitch-inner';
            let switch_ = 'onoffswitch-switch';

            //end of radio OFF/ON

            alert.requestAssistance.forEach(function (utility) {
                let arrayButtons = [];

                //radio ON
                if (utility.smecsApp) {
                    for(let x = 0; x < reqOnArray.length; x++) {
                        if (utility.utilityID == reqOnArray[x].utilityID && reqOnArray[x].type === 'smecsApp') {
                            check = 'checked';
                        }
                    }

                    let button = {
                        spacesA: 'spaces1',
                        spacesB: 'spaces2',
                        value: utility.utilityID + '_|_' + utility.utilityName + '_|_smecsApp',
                        radioLabel: 'smecs app',
                        radioChecked: check,

                        radioSent: {
                            onOffSwitch: onOffSwitch,
                            checkbox: checkbox,
                            label: label,
                            inner: inner,
                            switch_: switch_
                        }
                    };
                    //reset button
                    arrayButtons.push(button);
                    check = '';


                }

                if (utility.email !== '') {
                    for(let x = 0; x < reqOnArray.length; x++) {
                        if (utility.utilityID == reqOnArray[x].utilityID && reqOnArray[x].type === 'email') {
                            check = 'checked';
                        }
                    }

                    let button = {
                        spacesA: 'spaces1',
                        spacesB: 'spaces2',
                        value: utility.utilityID + '_|_' + utility.utilityName + '_|_email',
                        radioLabel: 'send email',
                        radioChecked: check,
                        radioSent: {
                            onOffSwitch: onOffSwitch,
                            checkbox: checkbox,
                            label: label,
                            inner: inner,
                            switch_: switch_
                        }
                    };
                    //reset button
                    arrayButtons.push(button);
                    check = '';

                }
                if (utility.phone !== '') {
                    for(let x = 0; x < reqOnArray.length; x++) {
                        if (utility.utilityID == reqOnArray[x].utilityID && reqOnArray[x].type === 'call') {
                            check = 'checked';
                        }
                    }

                    let button = {
                        spacesA: 'spaces1',
                        spacesB: 'spaces4',
                        value: utility.utilityID + '_|_' + utility.utilityName + '_|_call',
                        radioLabel: 'call',
                        radioChecked: check,
                        radioSent: {
                            onOffSwitch: onOffSwitch,
                            checkbox: checkbox,
                            label: label,
                            inner: inner,
                            switch_: switch_
                        }
                    };
                    //reset button
                    arrayButtons.push(button);
                    check = '';

                }
                //end of radio SENT

                let situation = {
                    utilityID: utility.utilityID,
                    utilityName: utility.utilityName,
                    arrayButtons: arrayButtons
                };

                arraySituations.push(situation);
            });







    callback('done building req. buttons')
}