//Dependencies
var models = require('./../../models');
var moment = require('moment');
let pushNotification = require('./pushNotification.js');

//update notes only from cellphone and from EJS homeReports
module.exports.postUpdateNotes = function(req, res, closeReopenAlerts, alertID, closeReopendNote) {
    let wrapped = moment(new Date());

    let alertToUpdate1, newNote;

    if(closeReopenAlerts){
        alertToUpdate1 = alertID;
        newNote = closeReopendNote;
    }
    else{
        alertToUpdate1 = req.body.alertToUpdate;
        newNote = req.body.note;
    }

    let htmlName = '<div class="lineSpaceP"><strong><span style="color:#800000">';
    let htmlTime = '</span></strong><span style="font-size:11px">';
    let htmlNote = '</span></div><span style="color:#333333">&nbsp;';


    if ( typeof newNote == 'undefined') //if user send an note update empty
    {
        newNote = '';
    }

    models.AlertSentInfo.findById({'_id': alertToUpdate1}, function (err, alert) {
        if (err || !alert) {
            console.log("notes not updated");
        }
        else {
            console.log('newNote update = ',newNote);
            if(req.decoded){ // run SMECS API
                if(alert.note)  // update note
                    alert.note += '<br><br class="lineSpaceBR">' + htmlName + req.decoded.user.firstName + ' ' + req.decoded.user.lastName + ' ' +  htmlTime + wrapped.format('h:mm:ss a') + htmlNote + newNote;
                else    // create first note entry
                    alert.note = htmlName + req.decoded.user.firstName + ' ' + req.decoded.user.lastName + ' ' +  htmlTime + wrapped.format('h:mm:ss a') + htmlNote + newNote;
            }else{  // run SMECS EJS
                if(alert.note) // update note
                    alert.note += '<br><br class="lineSpaceBR">' + htmlName + req.user.firstName + ' ' + req.user.lastName + ' ' +  htmlTime + wrapped.format('h:mm:ss a') + htmlNote + newNote;
                else // create first note entry
                    alert.note = htmlName + req.user.firstName + ' ' + req.user.lastName + ' ' +  htmlTime + wrapped.format('h:mm:ss a') + htmlNote + newNote;

            }
            console.log('alert.note update = ',alert.note);
            alert.save();

            if(req.decoded){ // run SMECS API
                res.json({
                    success: true
                });
                /*****  CALL HERE NOTIFICATION API  *****/
                pushNotification.refreshNotes(alert, 'refreshNotes'); //refresh notes on cellphones
            }
        }
    });
};