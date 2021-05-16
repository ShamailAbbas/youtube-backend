const express = require("express");
const router = express.Router();
const { User } = require("../models/User");

//=================================
//             User
//=================================

router.post("/register", (req, res) => {
  const user = new User(req.body);
  console.log("you hitted /register route");
  user.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

router.post("/login", (req, res) => {
  console.log("login route received");
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        loginSuccess: false,
        message: "Auth failed, email not found",
      });

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "Wrong password" });

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        res.status(200).json({
          loginSuccess: true,
          userId: user._id,
          user,
        });
      });
    });
  });
});

module.exports = router;
