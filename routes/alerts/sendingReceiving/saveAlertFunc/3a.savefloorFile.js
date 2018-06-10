//Dependencies
var models = require('./../../../models');
var fs   = require('fs-extra');

/**
 * middleware for Express.
 *
 * This middleware will run all functions related to sending alerts
 *
 */


module.exports.saveFloorFile = function(req, res, tempAlert) {


    //copy floor Photo from floor database to alertSentInfo database -----------------
    models.Floors.findOne({floorName: tempAlert.floorName}, function (err, result) {
        if (err) {
            console.log(err);
        }
        if (!result || result.floorPlan == '') {
            console.log("No Floor found");
        }
        else {
            var src_location = 'public/floorPlans/';
            var dst_location = 'public/alertSentInfo/floorsPhotos/';
            var src_File_name = result.floorPlan;
            var dst_File_name = tempAlert._id + '_' + result.floorPlan; // alert ID + file_name

            fs.copy(src_location + src_File_name, dst_location + dst_File_name, function (err) { // copy floor file to new directory
                if (err) {
                    console.error(err);
                } else {
                    //console.log("success! saved " + result.floorPlan);
                }
            });
        }
    });
    //----------------- end of copy floor Photo from floor database to alertSentInfo database
};

