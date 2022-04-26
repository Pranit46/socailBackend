var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const Blog = require("../model/Blog");
const { dbUrl, mongodb, MongoClient } = require("../dbConfig");
const User = require("../model/User");

/* GET users listing. */

mongoose.connect(dbUrl);

router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().populate('user');
    if (!blogs) {
      res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json({ blogs });
  } catch (error) {
    res.status(404).send(error);
  }
});

router.post("/addblog", async (req, res) => {
  const { title, description, image, user } = req.body;

  let existingUser;
  try {
    existingUser = await User.findById(user);
  } catch (error) {
    return console.log(error);
  }
  if (!existingUser) {
    return res
      .status(400)
      .json({ message: "Unable to find the user by this ID" });
  }
  const blog = new Blog({
    title,
    description,
    image,
    user,
  });
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await blog.save({ session });
    existingUser.blogs.push(blog);
    await existingUser.save({ session });
    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
  return res.status(200).json({ blog });
});

router.put("/updateblog/:id", async (req, res) => {
  try {
    const blog = await Blog.findById({ _id: req.params.id });
    if (blog) {
      const blogs = await Blog.updateOne(req.body);
      res.status(200).json({ blogs });
    } else {
      res.json({ message: "Something wend wrong while updating the blog" });
    }
  } catch (error) {
    res.status(404).send(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById({ _id: req.params.id });
    res.status(200).send({ blog });
  } catch (error) {
    res.status(404).send(error);
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndRemove({ _id: req.params.id }).populate(
      "user"
    );
    await blog.user.blogs.pull(blog);
    await blog.user.save();
    res.status(200).send({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(404).send(error);
  }
});

router.get("/user/:id", async (req, res) => {
  const userId = req.params.id;
  let userBlogs;
  try {
    userBlogs = await User.findById(userId).populate("blogs");
  } catch (error) {
    return console.log(error);
  }

  if (!userBlogs) {
    return res.status(404).json({ message: "No Blog found" });
  }

  return res.status(200).json({ user: userBlogs });
});

module.exports = router;
