const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");

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
                    res.json({ msg: "Success" });
                } else {
                    res.status(400).json({ password: "Password incorrect" });
                }
            });
        }
    });
});

module.exports = router;
