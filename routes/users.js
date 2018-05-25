const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in Article Model
let User = require('../models/user');

//express-validator
const {check, validationResult} = require('express-validator/check');

// Register Form

router.get('/register', function (req, res) {
    res.render('register', {
        title: 'Register'
    });
});

//Login Form
router.get('/login', function (req, res) {
    res.render('login', {
        title: 'Login'
    });
});

//Login process
//TODO: Need to check null(username/password)
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.post('/register', [
    check('email').isEmail().withMessage('Email must be an email.'),
    check('name').isLength({min: 2}).withMessage('Name must more than 2 characters.'),
    check('password').isLength({min: 2}).withMessage('Password must more than 2 characters.'),
    check('username').isLength({min: 2}).withMessage('username must more than 2 characters.')
], function (req, res) {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        console.log('err: ' + errors.mapped());
        res.render('register', {
            title: 'Register',
            errors: errors
        })
    } else {
        let newUser = new User();
        newUser.name = req.body.name;
        newUser.username = req.body.username;
        newUser.email = req.body.email;
        newUser.password = req.body.password;
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function (err, hash) {
                if (err) {
                    console.log(err);
                } else {
                    newUser.password = hash;
                    console.log('Hash pwd: ' + newUser.password);
                    newUser.save(function (err) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log('submitted: ' + newUser.username);
                            req.flash('success', 'Welcome to my website <3');
                            res.render('login', {
                                title: 'Login',
                                errors: errors
                            });
                        }
                    })
                }

            });
        });

    }


});

router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});


module.exports = router;