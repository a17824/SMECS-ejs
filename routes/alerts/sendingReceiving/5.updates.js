//Dependencies
var models = require('./../../models');
var moment = require('moment');
let pushNotification = require('./pushNotification.js');

//update notes only from cellphone
module.exports.postUpdateNotes = function(req, res) {
    var wrapped = moment(new Date());
    //var redirectEJS; //EJS user

    var alertToUpdate1 = req.body.alertToUpdate;
    var htmlName = '<div class="lineSpaceP"><strong><span style="color:#800000">';
    var htmlTime = '</span></strong><span style="font-size:11px">';
    var htmlNote = '</span></div><span style="color:#333333">&nbsp;';
    var newNote = req.body.note;

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
                if(alert.note)
                    alert.note += '<br><br class="lineSpaceBR">' + htmlName + req.decoded.user.firstName + ' ' + req.decoded.user.lastName + ' ' +  htmlTime + wrapped.format('h:mm:ss a') + htmlNote + newNote;
                else
                    alert.note = htmlName + req.decoded.user.firstName + ' ' + req.decoded.user.lastName + ' ' +  htmlTime + wrapped.format('h:mm:ss a') + htmlNote + newNote;
            }else{  // run SMECS EJS
                alert.note += '<br><br class="lineSpaceBR">' + htmlName + req.user.firstName + ' ' + req.user.lastName + ' ' +  htmlTime + wrapped.format('h:mm:ss a') + htmlNote + newNote;
            }
            console.log('alert.note update = ',alert.note);
            alert.save();

            if(req.decoded){ // run SMECS API
                res.json({
                    success: true
                });
            }else{  // run SMECS EJS
                res.send({redirect: redirectEJS});
            }
            /*****  CALL HERE NOTIFICATION API  *****/
            pushNotification.refreshNotes(alert, 'refreshNotes'); //refresh notes on cellphones
        }
    });
};