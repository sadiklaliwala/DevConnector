const mongoose = require('mongoose');
const User = mongoose.model('User');
const passport = require('passport');
const jwtstrategy = require('passport-jwt').Strategy;
const extractjwt = require('passport-jwt').ExtractJwt;
const keys = require('../config/keys');
const opts = {};

opts.jwtFromRequest = extractjwt.fromAuthHeaderAsBearerToken();
//make sure to write `secretOrKey` spelling correct   
opts.secretOrKey = keys.secretkey;

if (typeof keys.secretkey !== 'string') {
    throw new Error('Secret key must be a string');
}

module.exports = (passport) => {
    passport.use(
        new jwtstrategy(opts, (jwt_payload, done) => {
            // console.log(jwt_payload);
            User.findById(jwt_payload.id)
            .then(user => {
                if (user)
                    return done(null, user);
                else
                    return done(null, false);
            })
            .catch(err => console.log(err))
        })
    );
}