//Dependencies
var models = require('./../../models');
var async = require("async");

/* PROCEDURE Alerts. -------------------------------*/
module.exports.procedure = function(req, res) {
    console.log('PPPPPPPPPPPPPPPPPPPPPPPPPPPP');
    async.parallel([
        function(callback){
            models.AlertSentInfo.findById(req.params.id).exec(callback);
        },
        function(callback){
            models.Alerts.find().exec(callback);
        }

    ],function(err, results){
        res.render('alerts/receiving/procedureR',{
            title:'Procedure',
            userAuthID: req.user.userPrivilegeID,
            info: results[0],
            alert: results[1]

        });
    })

};
