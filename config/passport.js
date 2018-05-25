const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');

module.exports = function(passport){
    // Local strategy
    passport.use(new LocalStrategy(
        function (username, password, done) {
            //Match username
            let query = {name: username};
            User.findOne(query, function (err, user) {
                if (err) throw console.log(err);
                if (!user) {
                    errors:{};
                    console.log('no user found');
                    return done(null, false, {message :'no user found'});
                }

                //Match password
                bcrypt.compare(password, user.password, function (err, isMatch) {
                    if (err) throw err;
                    if (isMatch) {
                        console.log('login success');
                        return done(null, user);
                    } else {
                        console.log('Wrong password');
                        return done(null, false, {message: 'wrong password'});
                    }
                });

            })

        }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};

