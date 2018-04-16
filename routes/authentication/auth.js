//Dependencies
var models = require('./../models');


/**
 * A simple authentication middleware for Express.
 *
 * This middleware will load users from session data, and handle all user
 * proxying for convenience.
 */

module.exports.simpleAuth = function(req, res, next) {
    if (req.session && req.session.user) {
        if (req.session.user.userPrivilegeID) {         // if it is a user from "User" database
            var typeUserAuth = 'Users';
        } else {                                        // if it is a user from "ParentSelfRegistration" database
            var typeUserAuth = 'ParentSelfRegistration';
        }
        authentication(req, res, typeUserAuth, next);
    } else {
        next();
    }
};

function authentication(req, res, typeUserAuth, next){
    models[typeUserAuth].findOne({ email: req.session.user.email }, function(err, user) {
        if (user) {
            req.user = user;
            delete req.user.pin;
            req.session.user = req.user;
            res.locals.user = req.user;
        }
        next();
    });

}

//if user is not logged in redirect to login page
module.exports.requireLogin = function(req, res, next) {
    if (!req.user) {
        res.redirect('/login');
    } else {
        next();
    }
};

