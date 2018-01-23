//Dependencies
var models = require('./../models');
var bcrypt = require('bcryptjs');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');






module.exports.show = function(req, res, next) {
    models.Users.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            req.flash('error_messages', 'Password reset token is invalid or has expired (token is valid for 1 hour after request). Please, try again');
            return res.redirect('/forgot');
            /*
            res.render('forgot', {
                title: 'SMECS Forgot Password',
                error: "Password reset token is invalid or has expired (token is valid for 1 hour after request). Please, try again",
                errorMessages: ""
            });
            */
        }
        res.render('reset', {
            title: "Reset Password",
            user: user
        });
    });
};
module.exports.post = function(req, res) {
    async.waterfall([
        function(done) {
            console.log(req.params.token);
            var userToUpdate = req.body.userToUpdate;
            models.Users.findOne({ resetPasswordToken: userToUpdate, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    //req.flash('error', 'Password reset token is invalid or has expired.');
                    //return res.redirect('back');
                    return res.render('forgot', {
                        title: 'SMECS Forgot Password',
                        error: "Password reset token is invalid or has expired. Try again",
                        errorMessages: ""
                    });
                }
                var hash = bcrypt.hashSync(req.body.pin, bcrypt.genSaltSync(10));
                user.pin = hash; //req.body.pin;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;



                user.save(function(err, user) {
                    console.log('3');
                    req.session.user = user;
                    req.flash('success_messages', 'Success! Your password has been changed.');
                    res.send({redirect:'/dashboard'});
                    done(err, user);


                 });
            });
        },
        function(user, done) {
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
            transporter.sendMail(mailOptions, function(err) {
                //req.flash('success_messages', 'Success! Your password has been changed.');
                done(err);
            });

        }
    ], function(err) {
        console.log("Redirecionamento Aqui ");
        //res.redirect('/dashboard');
        //res.send({redirect: '/dashboard'});
        //res.writeHead(302, {location: '/dashboard'});
        //res.end();
        //res.writeHead(301, { 'Location': '/dashboard'});
        //res.end();
        //res.status(302).render('/dashboard');
        //res.redirect(301, '/dashboard')
        //link;
    });
};
/*-------------------------------------------end of reset password*/