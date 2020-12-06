//Dependencies
var models = require('./../models');
var jwt = require('jsonwebtoken');
var config = require('../api/config');
var bcrypt = require('bcryptjs');


/**
 * A simple authentication middleware for Express.
 *
 * This middleware will load users from session data, and handle all user
 * proxying for convenience.
 */

module.exports.simpleAuth = function(req, res, next) {
    if (req.session && req.session.user) {
        if (req.session.user.userRoleID) {         // if it is a user from "User" database
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
        if(err || !user){
            console.log("error finding in model: " + typeUserAuth);
        }
        else {
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
        //res.redirect('/login');
        res.redirect('/loginSessionExpired');
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

// route middleware to remove pushToken from user when user logs out from cellphone app
module.exports.logout = function (req, res, next) {

    let pushTokenToRemove = req.body.pushToken;

    models.Users.findOne({'email': req.decoded.user.email}, function (err, user) {
        if (!user || err) {
            res.json({
                success: false
            });
            console.log("error -  finding user with pushToken to remove at logout");
        }
        else {
            if (user.pushToken.includes(pushTokenToRemove)) {
                let index = user.pushToken.indexOf(pushTokenToRemove);
                user.pushToken.splice(index, 1);
                user.save(function (err) {
                    if (err) {
                        res.json({
                            success: false
                        });
                        console.log("error removing pushToken at logged out");
                    } else {
                        res.json({
                            success: true
                        });
                        console.log("successfully logout and removing pushToken");
                    }
                });
            }
            else {
                res.json({
                    success: true
                });
                console.log("error -  finding pushToken to remove in the user at logout");
            }
        }

    });

};

module.exports.checkPushToken = function(req, res, next) {
    models.Users.findOne({ email: req.decoded.user.email, 'pushToken': req.body.pushToken }, function(err, user) {
        if(err || !user){
            res.json({
                success: false
            });
            console.log("error finding user");
        }
        else {
            res.json({
                success: true
            });
            console.log("OK - found user");
        }
    });
};




// route middleware to update pushToken
module.exports.updatePushToken = function (req, res, next) {
    let newPushToken = req.body.pushToken;
    models.Users.findOne({ email: req.decoded.user.email }, function(err, user) {
        if (err || !user) {
            console.log("error finding user to update pushToken");
        }
        else {
            user.pushToken.push(newPushToken);
            user.save(function (err2) {
                if(err2){
                    res.json({
                        success: false
                    });
                    console.log('err updating user pushToken = ',err2);
                }
                else {
                    res.json({
                        success: true
                    });
                    console.log('Success updating pushToken of user: ' + user.firstName + ' ' + user.lastName);
                }
            });
        }
    });
};
