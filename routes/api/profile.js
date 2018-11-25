const express = require("express");
const router = express.Router();

router.route("/test").get((req, res) => {
  res.json({ test: "test" });
});

module.exports = router;
