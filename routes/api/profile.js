const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const User = require("../../models/User");
const Profile = require("../../models/Profile");

router.route("/test").get((req, res) => {
  res.json({ test: "test" });
});

module.exports = router;
