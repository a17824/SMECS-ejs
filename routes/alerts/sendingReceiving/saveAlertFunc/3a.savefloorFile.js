//Dependencies
var models = require('./../../../models');
var fs   = require('fs-extra');
const mergeImages = require('merge-images');
const Canvas = require('canvas');
let sizeOf = require('image-size');
const sharp = require('sharp');

/**
 * middleware for Express.
 *
 * This middleware will run all functions related to sending alerts
 *
 */


module.exports.saveFloorFile = function(req, res, tempAlert) {
    //copy floor Photo from floor database to alertSentInfo database -----------------
    models.Floors.findOne({floorName: tempAlert.floorName}, function (err, result) {
        if (!result || result.floorPlan == '' || err) {
            console.log("No Floor found. err - ");
        }
        else {
            let src_location = './public/floorPlans/';
            let src_File_name = result.floorPlan;
            let src = src_location + src_File_name;
            let dst_File_name = tempAlert._id + '_' + src_File_name; // alert ID + file_name
            let dst_location = 'public/alertSentInfo/floorsPhotos/';

            let redCross = './public/floorPlans/red_sniperResized.png';

            if(tempAlert.sniperCoordinateX && tempAlert.sniperCoordinateY){ //if user touch/ choose a specific location on floor

                redCrossResizedFunc(tempAlert, function (dimensions, redCrossResizedWidthCenter, redCrossResizedHeightCenter) {
                    let redCrossPos = {
                        x: tempAlert.sniperCoordinateX * dimensions.width / 100 - redCrossResizedWidthCenter,
                        y: tempAlert.sniperCoordinateY * dimensions.height / 100 - redCrossResizedHeightCenter
                    };

                    //merge redCross
                    mergeImages([
                        { src: src, x: 0, y: 0},
                        { src: redCross, x: redCrossPos.x, y: redCrossPos.y}
                    ], {
                        Canvas: Canvas,
                    })
                        .then(b64 => {
                            let base64Data = b64.replace(/^data:image\/png;base64,/, ""); //image merged

                            //get dimensions
                            let img = Buffer.from(base64Data, 'base64');
                            let dimensions = sizeOf(img);
                            console.log(dimensions);

                            //save file
                            fs.writeFile(dst_location + dst_File_name, base64Data, 'base64', function(err) { //save file
                                if (err) {
                                    console.error('merge floor and redCross failed. err - ',err);
                                } else {
                                    console.log("success merging floor and redCross! saved " + result.floorPlan);
                                }
                            });
                        });
                });
            }
            else { //if user skipped touch

                //save file
                fs.copy(src_location + src_File_name, dst_location + dst_File_name, function (err) { // copy floor file to new directory
                    if (err) {
                        console.error('copy floor failed. err - ',err);
                    } else {
                        console.log("success copy floor! saved " + result.floorPlan);
                    }
                });
            }

        }
    });
    //----------------- end of copy floor Photo from floor database to alertSentInfo database
};

function redCrossResizedFunc(tempAlert, callback) {
    //get floorPlan dimensions
    let dimensions = sizeOf('./public/floorPlans/' + tempAlert.floorPhoto);

    //resize redCross
    let redCrossResized = {
        width: dimensions.width*15/100,  //sendAlert.css .div1 size
        height: dimensions.height*15/100 // width same as height because redCross is a square
    };
    let redCrossResizedWidth = Number((redCrossResized.width).toFixed(0)); // before = 6.43534534; after = 6
    let redCrossResizedHeight = Number((redCrossResized.height).toFixed(0)); // before = 6.43534534; after = 6

    let redCrossResizedWidthCenter = redCrossResizedWidth / 2;
    let redCrossResizedHeightCenter = redCrossResizedHeight / 2;

    sharp('./public/floorPlans/red_sniper.png')
        .resize(redCrossResizedWidth, redCrossResizedHeight)
        .toFile('./public/floorPlans/red_sniperResized.png', function(err) {
            // output.jpg is a 200 pixels wide and 200 pixels high image
            // containing a scaled and cropped version of input.jpg
            callback(dimensions, redCrossResizedWidthCenter, redCrossResizedHeightCenter)
        });
}