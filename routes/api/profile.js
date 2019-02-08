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

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post("/experience", passport.authenticate("jwt", { session: false }), (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    // Check Validation
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
        const newExp = {
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        };

        // Add to exp array
        profile.experience.unshift(newExp);

        profile.save().then(profile => res.json(profile));
    });
});

// @route   POST api/profile/education
// @desc    Add education to profile
// @access  Private
router.post("/education", passport.authenticate("jwt", { session: false }), (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    // Check Validation
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
        const newEdu = {
            school: req.body.school,
            degree: req.body.degree,
            fieldofstudy: req.body.fieldofstudy,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        };

        // Add to exp array
        profile.education.unshift(newEdu);

        profile.save().then(profile => res.json(profile));
    });
});

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete("/experience/:exp_id", passport.authenticate("jwt", { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            // Get remove index
            const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

            // Splice out of array
            profile.experience.splice(removeIndex, 1);

            // Save
            profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.status(404).json(err));
});

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete("/education/:edu_id", passport.authenticate("jwt", { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            // Get remove index
            const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

            // Splice out of array
            profile.education.splice(removeIndex, 1);

            // Save
            profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.status(404).json(err));
});

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete("/", passport.authenticate("jwt", { session: false }), (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
        User.findOneAndRemove({ _id: req.user.id }).then(() => res.json({ success: true }));
    });
});

module.exports = router;
