//Dependencies
var express = require('express');
var bcrypt = require('bcryptjs');
var csrf = require('csurf');
var models = require('./../models');
var router = express.Router();
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens

router.use(csrf());
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
router.get('/login', function(req, res) {
    res.render('login', { title: 'SMECS Login', error: "", csrfToken: req.csrfToken()}); // add this at login.ejs: <input type="hidden" name="_csrf" value="<%= csrfToken %>">
    //res.render('login', { title: 'SMECS Login', error: ""});
});

/**
 * Log a user into their account.
 *
 * Once a user is logged in, they will be sent to the dashboard page.
 */
router.post('/login', function(req, res) {

    if(req.body.pushToken){ // run SMECS API
        models.Users.findOne({
            email: req.body.email.toLowerCase()
        }, function (err, user) {

            if (err) throw err;

            if (!user) {
                res.json({ success: false, message: 'Authentication failed. User not found.' });
            } else if (user) {

                //check if password matches
                if (!bcrypt.compareSync(req.body.pin, user.pin)) {
                    res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                } else {
                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign({user: user}, config.secret, {
                        //expiresIn: 1440 // expires in 24 hours
                    });
                    user.pushToken = req.body.pushToken;
                    user.save(function (err) {
                        if (err) {
                            console.log("rrrrrrrrrrrrrrrrrrrrrrrrrr");
                            res.json({ success: false, message: 'contact your system administrator. pushToken not saved' });
                        }else{
                            // return the information including token as JSON
                            res.json({
                                success: true,
                                message: 'Welcome aboard!',
                                token: token,
                                userRoleID: user.userRoleID,
                                userRoleName: user.userRoleName,
                                userPrivilegeID: user.userPrivilegeID,
                                userPrivilegeName: user.userPrivilegeName,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email
                            });
                        }
                    });


                }
            }
        });
    }
    else{ //run SMECS EJS
        models.Users.findOne({ email: req.body.email.toLowerCase()}, function(err, user) {
            if (!user || user.softDeleted !== null) {

                //checks for users in UtilityUsers database
                models.UtilityUsers.findOne({ email: req.body.email }, function(err, utilityUser) {
                    if (!utilityUser || utilityUser.softDeleted !== null) {
                        res.render('login', { error: "ERROR: Incorrect email or pin.", csrfToken: req.csrfToken()});
                    } else {
                        if (bcrypt.compareSync(req.body.pin, utilityUser.pin)) {
                            req.session.user = utilityUser;
                            res.redirect('/reports/requestAssistance');
                        } else {
                            res.render('login', { error: "ERROR: Incorrect email or pin.", csrfToken: req.csrfToken()});
                        }
                    }
                });
                //END OF checks for users in UtilityUsers database

                //res.render('login', { error: "ERROR: Incorrect email or pin.", csrfToken: req.csrfToken()});
                //res.render('login', { error: "ERROR: Incorrect email or pin."});
            } else {
                //console.log(user);
                if (bcrypt.compareSync(req.body.pin, user.pin)) { // if user is found and password is right
                    req.session.user = user;
                    /*
                    if (user.userPrivilegeID == 4){ // If user Privilege is "Regular User" then redirects to "choosing alert" page
                        res.redirect('/alerts/sending/chooseAlert');
                    } else {
                    */
                    res.redirect('/dashboard');
                    //}
                } else {
                    //res.status(400).send('Current password does not match');
                    res.render('login', { error: "ERROR: Incorrect email or pin.", csrfToken: req.csrfToken()});
                    //res.render('login', { error: "ERROR: Incorrect email or pin."});
                }
            }
        });
    }

});

/**
 * Log a user out of their account, then redirect them to the home page.
 */
router.get('/logout', function(req, res) {
    //if (req.session) {
        req.session.reset();
    //}
    res.redirect('/');
});

module.exports = router;