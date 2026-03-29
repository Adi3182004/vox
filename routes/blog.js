const { Router } = require("express");
const router = Router();

const Blog = require("../models/blog");
const Comment = require("../models/comments");

const upload = require("../middlewares/upload");
const cloudinary = require("../config/cloudinary");

// ADD BLOG PAGE
router.get("/add-new", (req, res) => {
  if (req.user) {
    return res.render("addBlog", {
      user: req.user,
    });
  }

  return res.redirect("/user/signin");
});

// CREATE BLOG (CLOUDINARY VERSION)
router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    const { title, body } = req.body;

    let imageURL = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageURL = result.secure_url;
    }

    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      coverImage: imageURL,
    });

    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error("BLOG CREATE ERROR:", error);
    return res.status(500).send("Internal Server Error");
  }
});

// VIEW BLOG
router.get("/:blogId", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId).populate("createdBy");

    const comments = await Comment.find({
      blogId: req.params.blogId,
    })
      .populate("commentedBy")
      .sort({ createdAt: -1 });

    return res.render("blog", {
      blog,
      comments,
      user: req.user,
    });
  } catch (error) {
    console.error("BLOG FETCH ERROR:", error);
    return res.status(500).send("Internal Server Error");
  }
});

// ADD COMMENT
router.post("/comment/:blogId", async (req, res) => {
  try {
    const { content } = req.body;

    await Comment.create({
      content,
      commentedBy: req.user._id,
      blogId: req.params.blogId,
    });

    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (error) {
    console.error("COMMENT ERROR:", error);
    return res.status(500).send("Internal Server Error");
  }
});

// DELETE BLOG
router.delete("/:blogId", async (req, res) => {
  try {
    const result = await Blog.deleteOne({ _id: req.params.blogId });

    if (result.deletedCount > 0) {
      return res.status(200).json({ message: "Blog deleted successfully" });
    } else {
      return res.status(404).json({ message: "No matching blog found" });
    }
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
