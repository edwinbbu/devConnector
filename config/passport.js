const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");

const User = require("../models/User");
const keys = require("./keys");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.jwtSecret;

module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, (jwt_payload, callback) => {
            User.findById(jwt_payload.id)
                .then(user => {
                    if (user) {
                        return callback(null, user);
                    }
                    else {
                        return callback(null, false);
                    }
                })
                .catch(err => console.log(err));
        })
    );
};
