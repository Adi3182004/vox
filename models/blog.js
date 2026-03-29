const express = require("express");
const router = express.Router();
const Blog = require("../models/blog");
const upload = require("../middlewares/upload");
const cloudinary = require("../config/cloudinary");

router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    let imageURL = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageURL = result.secure_url;
    }

    const blog = await Blog.create({
      title: req.body.title,
      body: req.body.body,
      createdBy: req.user._id,
      coverImage: imageURL,
    });

    res.redirect("/home");
  } catch (err) {
    console.error("BLOG ERROR:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
