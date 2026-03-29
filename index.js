const express = require("express");
const path = require("path");
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { checkAuthenticationCookie } = require("./middlewares/authentication");
const app = express();

// FIX 1: Use dynamic PORT for deployment
const PORT = process.env.PORT || 8000;

const Blog = require("./models/blog");

app.set("view engine", "ejs");

// Middleware to parse the request body
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve("./public")));
app.use(checkAuthenticationCookie("token"));

// connect to the database
mongoose
  .connect(
    "mongodb+srv://adi3182004:adi3182004@cluster0.ufwnhff.mongodb.net/blog-app?retryWrites=true&w=majority",
  )
  .then(() => {
    console.log("mongodb connection established");
  })
  .catch((err) => console.log(err.message));

// FIX 2: Root route (important for deployment)
app.get("/", (req, res) => {
  return res.redirect("/home");
});

// Home route
app.get("/home", async (req, res) => {
  const allBlogs = await Blog.find({}).sort({ createdAt: -1 });
  return res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

// user routes
app.use("/user", userRouter);

// blog routes
app.use("/blog", blogRouter);

// server configuration
const server = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

server.on("error", (err) => {
  console.log(`error: ${err.message}`);
});
