var createError = require("http-errors");
var express = require("express");
var cookieParser = require("cookie-parser");

var path = require("path");
var cookieSession = require("cookie-session");
var Keygrip = require("keygrip");
var logger = require("morgan");
var cors = require("cors");

// mongoose connection file
var connection = require("./connection");

// schemas
var postsSchema = require("./schemas/posts.schema");

// routes
var PostsRouter = require("./routes/posts");
var IndexRouter = require("./routes/Index");
var SectionsRouter = require("./routes/sections");
var UsersRouter = require("./routes/users");
var app = express();

// // view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");

app.use(cookieParser());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    credentials: true,
    origin:
      true |
      [
        "https://laconic-blogsample.vercel.app/",
        "https://laconic-blogsample.vercel.app",
        "https://laconic-blogsample-git-main-minanabil96.vercel.app/",
        "https://laconic-blogsample-git-main-minanabil96.vercel.app",
        "https://laconic-blogsample-dcygog4ic-minanabil96.vercel.app/",
        "https://laconic-blogsample-dcygog4ic-minanabil96.vercel.app",
        // "http://192.168.1.5:3000/",
        // "http://192.168.1.5:3000",
      ],
    allowedHeaders: [
      "content-type ",
      "access-control-allow-origin",
      "access-control-allow-credentials",
      "Set-Cookie",
    ],
  })
);

// use routes
app.use("/posts", PostsRouter);
app.use("/", IndexRouter);
app.use("/sections", SectionsRouter);
app.use("/users", UsersRouter);
// catch 404 and forward to error handler
app.use("*", function (req, res, next) {
  next(createError(404));
});

// post requste for posts

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  console.log(err.message);
  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
