//Dependencies
var mongoose = require('mongoose');
var csv = require('fast-csv');

module.exports.importFile = function(filePath, fileHeaders, modelName) {
    csv
        .fromPath(filePath, {headers: fileHeaders})
        .on('data', function(data) {

            var Obj = mongoose.model(modelName);

            var obj = new Obj();

            Object.keys(data).forEach(function(key) {
                var val = data[key];

                if (val !== '') {
                    obj.set(key, val);
                } else {
                    obj.set(key, "")
                }
            });

            obj.save(function (err) {
                if (err)
                    console.log(err);
            });
        })
        .on('end', function() {
            console.log("done");
        });
}