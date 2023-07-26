const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");

const path = require("path");
const cookieSession = require("cookie-session");
const Keygrip = require("keygrip");
const logger = require("morgan");
const cors = require("cors");
const ErrorApi = require("./helpers/ErrorApi");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
// mongoose connection file
const connection = require("./connection");

// schemas
const postsSchema = require("./schemas/posts.schema");

// routes
const PostsRouter = require("./routes/posts");
const IndexRouter = require("./routes/Index");
const SectionsRouter = require("./routes/sections");
const UsersRouter = require("./routes/users");
const app = express();

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
        // "http://192.168.1.7:3000/",
        // "http://192.168.1.7:3000",
        "https://mina-nabil-portfolio.vercel.app/",
        "https://mina-nabil-portfolio-minanabil96.vercel.app/",
        "https://mina-nabil-portfolio-git-main-minanabil96.vercel.app/",
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

app.all("*", function (req, res, next) {
  const err = new ErrorApi(
    `sorry can't find this route: ${req.originalUrl}`,
    404
  );
  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
