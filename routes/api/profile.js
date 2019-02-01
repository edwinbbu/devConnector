const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const User = require("../../models/User");
const Profile = require("../../models/Profile");

router.route("/test").get((req, res) => {
    res.json({ test: "test" });
});

router.get("/", passport.authenticate("jwt", { session: false }), (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (!profile) {
                errors.noprofile = "There is no profile for user";
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});

// Create/Edit user profile
router.post("/", passport.authenticate("jwt", { session: false }), (req, res) => {
    const profile = {};
    profile.user = req.user.id;
    if (req.body.handle) profile.handle = req.body.handle;
    if (req.body.company) profile.company = req.body.company;
    if (req.body.location) profile.location = req.body.location;
    if (req.body.bio) profile.bio = req.body.bio;
    if (req.body.status) profile.status = req.body.status;
    if (req.body.githubusername) profile.githubusername = req.body.githubusername;
    // skills
    if (typeof req.body.skills !== undefined) {
        profile.skills = req.body.skills.split(",");
    }
    profile.social = {};
    if (req.body.youtube) profile.social.youtube = req.body.youtube;
    if (req.body.twitter) profile.social.twitter = req.body.twitter;
    if (req.body.facebook) profile.social.facebook = req.body.facebook;
    if (req.body.linkedin) profile.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profile.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(validProfile => {
        if (validProfile) {
            //Update
            Profile.findOneAndUpdate({ user: req.user.id }, { $set: profile }, { new: true }).then(validProfile => {
                res.json(validProfile);
            });
        } else {
            //Create

            //Check if handle exists
            Profile.findOne({ handle: profile.handle }).then(validProfile => {
                if (validProfile) {
                    errors.handle = "The handle already exists";
                    res.status(400).json(errors);
                }
            });

            //Save Profile

            new Profile(profile).save().then(savedProfile => res.json(savedProfile));
        }
    });
});

//GET api/profile/handle/:handle
router.get("/handle/:handle", (req, res) => {
    Profile.findOne({ handle: req.params.handle })
        .populate("user", ["name", "avatar"])
        .then(profile => {
            if (!profile) {
                errors.noprofile = "There is no profile for this user";
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => {
            res.status(500).json(err);
        });
});

//GET api/profile/user/:id
router.get("/user/:id", (req, res) => {
    Profile.findOne({ user: req.params.id })
        .populate("user", ["name", "avatar"])
        .then(profile => {
            if (!profile) {
                errors.noprofile = "There is no profile for this user";
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => {
            res.status(404).json("There is no profile for this user");
        });
});

//list profile
router.get("/all", (req, res) => {
    Profile.find({})
        .populate("user", ["name", "avatar"])
        .then(profiles => {
            if (!profiles) {
                errors.noprofile = "There is no profiles";
                return res.status(404).json(errors);
            }
            res.json(profiles);
        })
        .catch(err => {
            res.status(500).json(err);
        });
});

module.exports = router;
