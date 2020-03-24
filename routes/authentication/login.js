//Dependencies
var bcrypt = require('bcryptjs');
var models = require('./../models');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../api/config');

let OneSignal = require('onesignal-node'); //for OneSignal
let pushNotification = require('./../alerts/sendingReceiving/pushNotification.js');





/**
 * Render the registration page.
 */
/*
router.get('/register', function(req, res) {
    res.render('register.jade', { csrfToken: req.csrfToken() });
});
*/
/**
 * Create a new user account.
 *
 * Once a user is logged in, they will be sent to the dashboard page.
 */
/*
router.post('/register', function(req, res) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);

    var user = new models.User({
        firstName:  req.body.firstName,
        lastName:   req.body.lastName,
        email:      req.body.email,
        password:   hash
    });
    user.save(function(err) {
        if (err) {
            var error = 'Something bad happened! Please try again.';

            if (err.code === 11000) {
                error = 'That email is already taken, please try another.';
            }

            res.render('register.jade', { error: error });
        } else {
            utils.createUserSession(req, res, user);
            res.redirect('/dashboard');
        }
    });
});
*/
/**
 * Render the login page.
 */
module.exports.getLogin = function(req, res, next) {

    res.render('login', {
        title: 'SMECS Login',
        error: "",
        csrfToken: req.csrfToken()}); // add this at login.ejs: <input type="hidden" name="_csrf" value="<%= csrfToken %>">

};
module.exports.getLoginParentSelfRegistration = function(req, res, next) {
    res.render('login', {
        title: 'SMECS Login',
        error: "Registration completed",
        csrfToken: req.csrfToken()}); // add this at login.ejs: <input type="hidden" name="_csrf" value="<%= csrfToken %>">

};
module.exports.getLoginFurtherInstructions = function(req, res) {
    console.log('req.params.emailMessage = ', req.params.emailMessage);
    res.render('login', {
        title: 'SMECS Login',
        error: req.params.emailMessage,
        csrfToken: req.csrfToken()}); // add this at login.ejs: <input type="hidden" name="_csrf" value="<%= csrfToken %>">

};
module.exports.getLoginResetPassword = function(req, res) {
    res.render('login', {
        title: 'SMECS Login',
        error: "Success! Your Pin has been changed.",
        csrfToken: req.csrfToken()}); // add this at login.ejs: <input type="hidden" name="_csrf" value="<%= csrfToken %>">

};
/**
 * Log a user into their account.
 *
 * Once a user is logged in, they will be sent to the dashboard page.
 */
module.exports.postLogin = function(req, res, next) {

    if (req.body.isIonic) { // run SMECS API
        models.Users.findOne({email: req.body.email.toLowerCase()}, function (err, user) {
            if (err) throw err;

            if (!user) {
                res.json({success: false, message: 'Authentication failed. User not found.'});
            } else if (user) {

                //check if password matches
                if (!bcrypt.compareSync(req.body.pin, user.pin)) {
                    res.json({success: false, message: 'Authentication failed. Wrong password.'});
                } else {
                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign({user: user}, config.secret, {
                        //expiresIn: 1440 // expires in 24 hours
                    });
                    let newPushToken = req.body.pushToken;

                    if (user.pushToken.includes(null)) { //deletes all null pushTokens from user
                        let filtered = user.pushToken.filter(function (el) {
                            return el != null;
                        });
                        //console.log(filtered);
                        user.pushToken = filtered;
                    }

                    if(newPushToken !== null && newPushToken !== undefined){
                        if (!user.pushToken.includes(newPushToken)) { //adds new pushToken
                            user.pushToken.push(newPushToken);
                            user.save(function (err) {
                                if (err) {
                                    res.json({
                                        success: false,
                                        message: 'contact your system administrator. pushToken not saved'
                                    });
                                } else {
                                    //delete new push token from other users (if a user log
                                    models.Users.find({}, function (err, users2) {
                                        if (err || !users2) console.log("No users to delete push token");
                                        else {
                                            users2.forEach(function (user3) {
                                                if (user.email != user3.email) {
                                                    if (user3.pushToken.includes(newPushToken)) {
                                                        let index = user3.pushToken.indexOf(newPushToken);
                                                        user3.pushToken.splice(index, 1);
                                                        user3.save();
                                                        console.log("push token deleted successfully from " + user3.firstName + ' ' + user3.lastName);
                                                    }
                                                    if (user3.pushToken.includes(null)) {   //deletes null pushTokens from other users
                                                        let filtered = user3.pushToken.filter(function (el) {
                                                            return el != null;
                                                        });
                                                        user3.pushToken = filtered;
                                                        user3.save();
                                                        console.log("push token NULL deleted successfully from " + user3.firstName + ' ' + user3.lastName);
                                                    }
                                                }
                                            });
                                        }
                                    });
                                    console.log("New token added");
                                }
                            });
                        }
                        // return the information including token as JSON
                        res.json({
                            success: true,
                            message: 'Welcome aboard!',
                            token: token,
                            user: user
                        });
                    }
                    else {
                        res.json({
                            success: false,
                            message: 'token is null',
                            token: token,
                            user: user
                        });
                    }

                }
            }
        });
    }
    else { //run SMECS EJS

        models.Users.findOne({email: req.body.email.toLowerCase()}, function (err, user) {

            if (!user || user.softDeleted !== null) {   //Parent Self Registration Login
                models.ParentSelfRegistration.findOne({email: req.body.email.toLowerCase()}, function (err, parentSelfRegistration) {
                    if (!parentSelfRegistration) {
                        res.render('login', {error: "ERROR: Incorrect email or pin.", csrfToken: req.csrfToken()});
                    } else {
                        if (req.body.pin == parentSelfRegistration.pin) {
                            req.session.user = parentSelfRegistration;
                            res.redirect('/parentsSelfRegistration/registerParentStep1');
                        } else {
                            res.render('login', {error: "Incorrect email or pin", csrfToken: req.csrfToken()});
                        }
                    }
                });
                //END OF Parent Self Registration Login

            } else {    //Users  Login
                if (bcrypt.compareSync(req.body.pin, user.pin)) { // if user is found and password is right
                    req.session.user = user;
                    res.redirect('/reports/homeReports');

                } else {
                    //res.status(400).send('Current password does not match');
                    res.render('login', {error: "Incorrect email or pin", warning: '', csrfToken: req.csrfToken()}); //final error message is been written in login.ejs
                }
            }
        });
    }
};

/**
 * Log a user out of their account, then redirect them to the home page.
 */
module.exports.getLogout = function(req, res) {
    //if (req.session) {
    req.session.reset();
    //}
    res.redirect('/');
};

module.exports.heartBeat = function (){
    console.log('heartBeat');
    let arrayTokensToSend = [];
    models.Users.find({}, function (err, users) {
        if (err) {
            console.log('err - finding Users');
        } else {
            users.forEach(function (user) {
                user.pushToken.forEach(function (token) {
                    arrayTokensToSend.push(token);
                });

            });
            /*****  CALL HERE NOTIFICATION API  *****/
            pushNotification.icons(arrayTokensToSend,'heartBeat');
        }
    });
};

module.exports.heartBeatResponse = function (){ //response with pushTokens to remove

};


//module.exports = router;