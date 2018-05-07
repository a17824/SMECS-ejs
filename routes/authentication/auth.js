//Dependencies
var models = require('./../models');
var jwt = require('jsonwebtoken');
var config = require('../api/config');

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


/*****  CALL HERE NOTIFICATION API  ****
                     *
 *          API                             *
 ***************************************/


// route middleware to verify a token
module.exports.auth = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
};

// route middleware to verify pin
module.exports.pin = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var email;
    var pushToken = req.body.pushToken;
    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) {
            return res.json({
                success: false,
                message: 'Failed to authenticate token.'
            });
        } else {
            email = decoded.user.email;
        }
    });
    models.Users.findOne({'email': email}, function (err, user) {
        if (err) {
            return res.json({
                success: false,
                message: 'Failed to locate user.'
            });
        } else {
            if (pushToken) {
                user.pushToken = req.body.pushToken;
                user.save();
                res.json({
                    success: true,
                    message: 'Push token updated'
                });
            } else {
                if (!bcrypt.compareSync(req.body.pin, user.pin)) {
                    res.json({
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    });
                } else {
                    console.log('Pin OK');
                    next();
                }
            }
        }
    });
};