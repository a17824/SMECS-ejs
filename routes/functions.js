var models = require('./models');

module.exports.redirectTo = function(req, res, page) {
    models.Users.findOneAndUpdate({_id: req.user.id}, {$set:{redirect:page}}, {new: true}, function(err, doc){
        if(err){
            console.log("Something wrong when updating user.redirect!");
        }
        console.log('successfully updated user.redirect');
    });
};
