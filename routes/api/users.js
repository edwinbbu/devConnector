const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const keys = require("../../config/keys");
const User = require("../../models/User");

const router = express.Router();

// Register User
router.post("/register", (req, res) => {
    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            return res.status(400).json({ email: "Email already exists" });
        } else {
            const avatar = gravatar.url(req.body.email, {
                s: 200, // size
                r: "pg", // rating
                d: "mm" // default
            });

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) {
                        throw err;
                    }
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => res.json(user))
                        .catch(err => res.send(err));
                });
            });
        }
    });
});

// Login User
router.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email }).then(user => {
        if (!user) {
            return res.status(404).json({ email: "User not found" });
        } else {
            bcrypt.compare(password, user.password).then(isMatch => {
                if (isMatch) {
                    //jwt token
                    const payload = {
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar
                    };
                    jwt.sign(
                        payload,
                        keys.jwtSecret,
                        { expiresIn: 3600 },
                        (err, token) => {
                            if (err) {
                                res.status(404).json({
                                    error: "JWT Token error"
                                });
                            } else {
                                res.json({
                                    success: true,
                                    token: "Bearer " + token
                                });
                            }
                        }
                    );
                } else {
                    res.status(400).json({ password: "Password incorrect" });
                }
            });
        }
    });
});

router.get('/home', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
})
module.exports = router;
