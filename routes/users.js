var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const User = require("../model/User");
const { dbUrl, mongodb, MongoClient } = require("../dbConfig");
const { hashing, hashCompare } = require("../library/auth");

/* GET users listing. */

mongoose.connect(dbUrl);

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      res.status(404).json({ message: "user not found" });
    }
    res.status(200).json({ users });
  } catch (error) {
    res.status(404).send(error);
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let users = await User.findOne({ email: email });
    if (users) {
      res.json({ message: "User already exists" });
    } else {
      const hash = await hashing(req.body.password);
      req.body.password = hash;
      req.body.Blog = [];
      const userData = await User.create(req.body);
      res.status(200).send(userData);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      const compare = await hashCompare(req.body.password, user.password);
      if (compare === true) {
        res.json({
          message: "Login Successful",
          user
        });
      } else {
        res.json({
          message: "Wrong password",
        });
      }
    } else {
      res.json({
        message: "user does not exist",
      });
    }
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
