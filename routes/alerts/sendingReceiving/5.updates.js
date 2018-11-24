//Dependencies
var models = require('./../../models');
var moment = require('moment');


module.exports.postUpdateNotes = function(req, res) {
    var wrapped = moment(new Date());
    //var redirectEJS; //EJS user

    var alertToUpdate1 = req.body.alertToUpdate;
    var htmlName = '<div class="lineSpaceP"><strong><span style="color:#800000">';
    var htmlTime = '</span></strong> <span style="font-size:11px">';
    var htmlNote = '</span></div><p><span style="color:#333333">&nbsp;<br>';
    var newNote = req.body.note;

    models.AlertSentInfo.findById({'_id': alertToUpdate1}, function (err, alert) {
        if (err || !alert) {
            console.log("notes not updated");
        }
        else {
            console.log("req.decoded.user.firstName = ",req.decoded.user.firstName);
            console.log(" req.body.note = ", req.body.note);
            alert.note +=  htmlName + req.decoded.user.firstName + ' ' + req.decoded.user.lastName + ' ' +  htmlTime + wrapped.format('h:mm:ss a') + htmlNote + newNote;
            alert.save();

            if(req.decoded){ // run SMECS API
                res.json({
                    success: true
                });
            }/*else{  // run SMECS EJS
                res.send({redirect: redirectEJS});
            }*/
        }
    });
};