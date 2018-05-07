//Dependencies

var bcrypt = require('bcryptjs');

var models = require('./../models');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');
var crypto = require('crypto');

//FORGOT API
module.exports.forgotPost = function (req, res) {
    // find user by email address
    models.Users.findOne({
        email: req.body.email
    }, function (err, user) {

        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {
            var options = {
                service: 'gmail',
                auth: {
                    user: 'pdcpadr@gmail.com',
                    pass: '123pdcpadr'
                }
            };
            var transporter = nodemailer.createTransport(smtpTransport(options));

            var mailOptions = {
                to: user.email,
                from: 'passwordreset@demo.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            transporter.sendMail(mailOptions, function (err) {
            });

            res.json({
                success: true,
                message: 'Email sent',
                email: user.email
            });
        };
    });
}


//Get - FORGOT EJS
module.exports.show = function(req, res, next) {
    res.render('forgot', { title: 'SMECS Forgot Password', error: "", errorMessages:"" });
};
//post - FORGOT EJS
module.exports.post = function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            models.Users.findOne({ email: req.body.email }, function(err, user) {
                if (!user || user.softDeleted !== null) {
                    //req.flash('error', 'No account with that email address exists.');
                    return res.render('forgot', {
                        title: 'SMECS Forgot Password',
                        error: "No account with that email address exists",
                        errorMessages: ""
                    });
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.save(function(err) {
                    done(err, token, user);
                });

            });
        },
        function(token, user, done) {
            var options = {
                service: 'gmail',
                auth: {
                    user: 'pdcpadr@gmail.com',
                    pass: 'X'
                }
            };
            var transporter = nodemailer.createTransport(smtpTransport(options));

            // setup e-mail data with unicode symbols
            var mailOptions = {
                to: user.email,
                from: 'passwordreset@demo.com', //Gmail and many other email services don't allow you to send messages with various FROM field
                subject: 'SMECS Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(err) {
                //req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                res.render('forgot', {
                    title: 'SMECS Forgot Password',
                    error: "",
                    errorMessages: "An e-mail has been sent to " + user.email + " with further instructions."
                });
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        //res.redirect('/forgot');
    });
};


module.exports.sendAlertRequestAssistance = function(req, utilityName, next) {
    models.Utilities.findOne({'utilityName': utilityName}, function(err, utility){
        async.waterfall([
            function(done) {
                var options = {
                    service: 'gmail',
                    auth: {
                        user: 'pdcpadr@gmail.com',
                        pass: '123pdcpadr'
                    }
                };
                var transporter = nodemailer.createTransport(smtpTransport(options));

                // setup e-mail data with unicode symbols
                var mailOptions = {
                    to: utility.email,
                    from: 'passwordreset@demo.com', //Gmail and many other email services don't allow you to send messages with various FROM field
                    subject: 'St. Theresa School utility Problem',
                    text: 'You are receiving this because St. Theresa School has requested your help to fix a problem with: ' + utility.utilityName + '.'
                };
                // send mail with defined transport object
                transporter.sendMail(mailOptions, function(err) {
                    //req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                    console.log('AQUI ENVIOU EMAIL REQUEST ASSISTANCE PARA: ' + utility.email);
                    done(err, 'done');
                });
            }
        ], function(err) {
            if (err) return next(err);
            //res.redirect('/forgot');
        });
    });

};