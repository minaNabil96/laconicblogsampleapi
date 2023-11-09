const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cookie = require("cookie");
const { arabicFullDate } = require("../helpers/setOfHelpers");
const posts = express.Router();
const postsSchema = require("../schemas/posts.schema");
const usersSchema = require("../schemas/users.schema");

/* GET Posts listing. */
// posts.get("/", (req, res, next) => {
//   res.send("<h1>respond with a resource</h1>");
// });
posts.use(cookieParser());

// search in articles by term
posts.get("/search", async (req, res, next) => {
  const term = req.query.term;
  if (!term) {
    res.status(200).json({ status: "there's no results" });
  }
  const search = await postsSchema
    .find({
      $or: [{ title: { $regex: term } }, { text: { $regex: term } }],
      visible: true,
    })
    .limit(6);

  try {
    if (search.length >= 1) res.status(200).json({ status: "success", search });
    else res.status(200).json({ status: "there's no results" });
  } catch (error) {
    console.log(error.message);
    res.status(404).json({ status: "error" });
  }
});
// add post
posts.post("/", async (req, res, next) => {
  const { text, image, title, author, body, section } = req.body;

  const token = req.headers.cookie && req.headers.cookie.split("=")[1];
  let verefiedUser;
  let date = await arabicFullDate();
  if (!token) {
    res.json({ status: "wrong token" }).status(401);
  } else {
    const verified = await jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      (err, user) => {
        if (err) {
          console.log({ status: "you don't have access" });
        }
        return (verefiedUser = user);
      },
    );
  }
  if (!verefiedUser) {
    res.status(401).json({ status: "failed" });
  } else {
    const post = new postsSchema({
      text,
      image,
      title,
      author,
      body,
      date,
      section,
    });
    await post
      .save()
      .then((post) => {
        res.status(200).json([post, { status: "success" }]);
      })
      .catch((err) => {
        console.log(err.message);
        res.status(403).json({ status: "failed" });
      });
  }

  // const post = await new this.Post(req.body);

  // res.send(post);
});

// edit one post
posts.put("/:id", async (req, res, next) => {
  const { text, image, title, author, body, date, section } = req.body;
  const postId = req.params.id;
  const token = req.headers.cookie && req.headers.cookie.split("=")[1];
  let verefiedUser;
  // console.log(`section : ${section} author : ${author} image : ${image} title : ${title}
  // body : ${body} text : ${text} `);

  if (!token) {
    res.status(401).json({ status: "wrong token" });
  } else {
    const verified = await jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      (error, user) => {
        if (error) {
          res.json({ status: "you don't have access" });
        }
        return (verefiedUser = user);
      },
    );
  }

  if (!verefiedUser) {
    res.status(401).json({ status: "you don't have access" });
  }
  try {
    const obj1 = { text, image, title, body, date, section };
    const obj2 = Object.entries(obj1).filter(([, value]) => value !== "");
    const obj3 = Object.fromEntries(obj2);

    if (obj3) {
      const post = await postsSchema.findOneAndUpdate({ _id: postId }, obj3, {
        new: true,
      });
      post.save();
      res.status(200).json({ status: "success", post });
    }
    // if (image) {
    //   if (section && !title) {
    //     const post = await postsSchema.findOneAndUpdate(
    //       { _id: postId },
    //       {
    //         image,
    //         section,
    //         body,
    //         text,
    //       },
    //       { new: true }
    //     );
    //     post.save();
    //     res.status(200).json({ status: "success", post });
    //   } else if (title && !section) {
    //     const post = await postsSchema.findOneAndUpdate(
    //       { _id: postId },
    //       {
    //         image,
    //         title,
    //         body,
    //         text,
    //       },
    //       { new: true }
    //     );
    //     post.save();
    //     res.status(200).json({ status: "success", post });
    //   } else if (section && title && text) {
    //     const post = await postsSchema.findOneAndUpdate(
    //       { _id: postId },
    //       {
    //         image,
    //         section,
    //         title,
    //         body,
    //         text,
    //       },
    //       { new: true }
    //     );
    //     post.save();
    //     res.status(200).json({ status: "success", post });
    //   } else if (!section && !title) {
    //     const post = await postsSchema.findOneAndUpdate(
    //       { _id: postId },
    //       {
    //         image,
    //         body,
    //         text,
    //       },
    //       { new: true }
    //     );
    //     post.save();
    //     res.status(200).json({ status: "success", post });
    //   }
    // }
    // // end if there's an image
    // if (!image) {
    //   if (title && section) {
    //     const post = await postsSchema.findOneAndUpdate(
    //       { _id: postId },
    //       {
    //         title,
    //         section,
    //         body,
    //         text,
    //       },
    //       { new: true }
    //     );
    //     post.save();
    //     res.status(200).json({ status: "success", post });
    //   } else if (section && !title) {
    //     const post = await postsSchema.findOneAndUpdate(
    //       { _id: postId },
    //       {
    //         section,
    //         body,
    //         text,
    //       },
    //       { new: true }
    //     );
    //     post.save();
    //     res.status(200).json({ status: "success", post });
    //   } else if (!section && title) {
    //     const post = await postsSchema.findOneAndUpdate(
    //       { _id: postId },
    //       {
    //         section,
    //         body,
    //         text,
    //       },
    //       { new: true }
    //     );
    //     post.save();
    //     res.status(200).json({ status: "success", post });
    //   } else if (section && title && text) {
    //     const post = await postsSchema.findOneAndUpdate(
    //       { _id: postId },
    //       {
    //         section,
    //         title,
    //         body,
    //         text,
    //       },
    //       { new: true }
    //     );
    //     post.save();
    //     res.status(200).json({ status: "success", post });
    //   }
    // }
  } catch (error) {
    console.log(error.message);
    res.status(403).json({ status: "failed to update" });
  }
});
// send all posts
posts.get("/", async (req, res, next) => {
  // const { section } = req.body;

  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 3;

    const skip = (page - 1) * limit;
    const numOfDocuments = await postsSchema.countDocuments({ visible: true });
    const numOfPages = Math.ceil(numOfDocuments / limit);
    const endIdx = page * limit;
    const nextPage = endIdx < numOfDocuments ? page + 1 : "nonext";
    const prevPage = skip > 0 ? page - 1 : "noprev";

    const posts = await postsSchema
      .find({ visible: true })
      .populate({ path: "section" })
      .populate({ path: "author", select: "-password" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    if (!posts) {
      res.status(200).json({ status: "there's no articles" });
    } else {
      res
        .status(200)
        .json({ numOfDocuments, numOfPages, nextPage, prevPage, posts });
    }
  } catch (error) {
    res.status(404).json({ status: "error" });
  }
});

// get posts by userlogin
posts.post("/user-articles", async (req, res, next) => {
  // const token = req.headers["authorization"];
  const token = req.headers.cookie && req.headers.cookie.split("=")[1];
  let verefiedUser;

  if (!token) {
    res.json({ status: "wrong token" }).status(401);
  }
  const verify = jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET,
    (err, user) => {
      if (err) {
        console.log({ status: "you don't have access" });
      }
      return (verefiedUser = user);
    },
  );

  if (token && !verefiedUser) {
    res.status(401).json({ status: "you don't have access" });
  }

  if (token && verefiedUser) {
    const posts = postsSchema;
    await posts
      .find({ author: verefiedUser, visible: true })
      .populate({ path: "section" })
      .populate({ path: "author", select: "-password" })
      .sort({ createdAt: -1 })

      .then((data) => {
        res.status(200).json(data);
      })
      .catch((error) => {
        console.log(error.message);
        res.status(403).json({ status: "error" });
      });
  }
});

// get all articles for admin
posts.post("/all-user-articles", async (req, res, next) => {
  // const token = req.headers["authorization"];
  const token = req.headers.cookie && req.headers.cookie.split("=")[1];
  const { userId } = req.body;

  try {
    let verefiedUser;

    if (!token || !userId) {
      res.json({ status: "wrong token" }).status(401);
    }
    const verify = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      (err, user) => {
        if (err) {
          console.log({ status: "you don't have access" });
        }
        return (verefiedUser = user);
      },
    );

    if (token && !verefiedUser) {
      res.status(401).json({ status: "you don't have access" });
    }

    if (token && verefiedUser) {
      const isAdmin = await usersSchema.findOne({
        _id: verefiedUser._id,
      });
      if (!isAdmin || isAdmin.admin === false) {
        res.status(401).json({ status: "you are not an admin" });
      } else {
        const posts = await postsSchema
          .find({ author: userId })
          .populate({ path: "section" })
          .populate({ path: "author" })
          .sort({ createdAt: -1 });

        const invisiblePosts = await postsSchema
          .find({ author: userId, visible: false })
          .populate({ path: "section" })
          .populate({ path: "author" })
          .sort({ createdAt: -1 });

        if (posts || invisiblePosts) {
          res.status(200).json({ posts, invisiblePosts });
        } else {
          res.status(403).json({ status: "error" });
        }
      }
    }
  } catch (error) {
    console.log(error.message);

    res.status(403).json({ status: "error" });
  }
});

// get all posts in one section
posts.get("/sections/:id", async (req, res, next) => {
  try {
    const sectionId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;
    const numOfDocuments = await postsSchema.countDocuments({
      section: sectionId,
      visible: true,
    });
    const numOfPages = Math.ceil(numOfDocuments / limit);
    const endIdx = page * limit;
    const nextPage = endIdx < numOfDocuments ? page + 1 : "nonext";
    const prevPage = skip > 0 ? page - 1 : "noprev";

    const posts = await postsSchema
      .find({ section: sectionId, visible: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "section" });

    if (posts.length < 1) {
      console.log({ posts });
      res.status(200).json({ status: "there's no articles" });
    } else {
      res
        .status(200)
        .json({ numOfDocuments, numOfPages, nextPage, prevPage, posts });
    }
  } catch (error) {
    console.log(error.message);
    res.status(403).json({ status: "error" });
  }
});

// get post by id
posts.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    res.status(401).json({ status: "there's no id" });
  }
  // prettier-ignore
  const matched = await postsSchema.findById({_id:id}).populate({ path: "section" }).populate([
   { path: "author",select:"-password"}
  ] )

  const {
    author: { _id, arabicname },
    title,
    image,
  } = await matched;
  const sep = title.split(" ");
  const [one, tow, three, four, five, six, ...rest] = sep;
  const related = await postsSchema
    .find({
      $or: [
        {
          title: {
            $regex: `${one || tow || three || four || five || six || rest}`,
          },
        },
        {
          text: {
            $regex: `${one || tow || three || four || five || six || rest}`,
          },
        },
        { author: _id },
      ],
      _id: { $ne: id },
      visible: true,
    })
    .populate([{ path: "author", select: "arabicname" }])
    .limit(2)
    .select("-body -text");
  // .select({ arabicname });

  const latestThree = await postsSchema
    .find({ author: _id })
    .sort({ date: +1 })
    .limit(3)
    .select("_id title image");

  try {
    res.status(200).json({ matched, latestThree, related });
  } catch (error) {
    console.log(error.message);
    res.status(403).json({ status: "error" });
  }

  // .then((data) => {

  //   res.status(200).json(data);
  // })
  // .catch((error) => {
  //   console.log(error)

  // });
});

posts.get("/nppost/:id", async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    res.status(404).json({ status: "error" });
  }
  if (id) {
    const matchedPost = postsSchema;

    const nextPost = await matchedPost
      .findOne({ _id: { $gt: id } })
      .sort({ _id: 1 })
      .limit(1);
    const prevPost = await matchedPost
      .findOne({ _id: { $lt: id } })
      .sort({ _id: -1 })
      .limit(1);

    try {
      if (nextPost === null && prevPost) {
        res
          .status(200)
          .json({ prevPostId: prevPost._id, nextPostId: "nonext" });
      } else if (nextPost && prevPost === null) {
        res
          .status(200)
          .json({ nextPostId: nextPost._id, prevPostId: "noprev" });
      } else
        res
          .status(200)
          .json({ nextPostId: nextPost._id, prevPostId: prevPost._id });
    } catch (error) {
      console.log(error.message);
      res.status(403).json({ status: "error" });
    }
  }
});

posts.post("/delete-article/:id", async (req, res, next) => {
  try {
    const PostId = req.params.id;
    const token = req.headers.cookie && req.headers.cookie.split("=")[1];
    let verefiedUser;
    if (!PostId) {
      res.status(403).json({ status: "error" });
    }
    if (!token) {
      res.json({ status: "wrong token" }).status(401);
    } else {
      const verified = await jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET,
        (err, user) => {
          if (err) {
            console.log({ status: "you don't have access" });
          }
          return (verefiedUser = user);
        },
      );
    }
    if (!verefiedUser) {
      res.status(401).json({ status: "you don't have access" });
    }
    if (verefiedUser) {
      const post = await postsSchema
        .findByIdAndUpdate({ _id: PostId }, { visible: false }, { new: true })
        .then((post) => {
          res.status(200).json({ status: "deleted" });
        })
        .catch((err) => {
          console.log(err.message);
          res.status(403).json({ status: "failed" });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(403).json({ error });
  }
});

// delete all articles by one user id
posts.post("/deleteall/:adminId", async (req, res, next) => {
  const adminId = req.params.adminId;
  const token = req.headers.cookie && req.headers.cookie.split("=")[1];
  const { userIdForDelete: userId } = req.body;
  let verefiedUser;

  if (!token) {
    res.json({ status: "wrong token" }).status(401);
  }
  if (token && !adminId) {
    res.json({ status: "there's no id" }).status(401);
  }
  try {
    const verify = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      (err, user) => {
        if (err) {
          console.log({ status: "you don't have access" });
        }
        return (verefiedUser = user);
      },
    );

    if (!verefiedUser) {
      res.status(401).json({ status: "access denied" });

      const isAdmin = await usersSchema.findOne({
        _id: adminId,
      });
      if (!isAdmin || isAdmin.admin === false) {
        res.status(401).json({ status: "you are not an admin" });
      }
      const userMatch = await usersSchema.findOne({
        _id: userId,
      });
      if (!userMatch) {
        res.status(401).json({ status: "user not found" });
      }
      const deleted = await postsSchema.updateMany(
        { author: userId },
        { visible: false },
        { new: true },
      );
      if (deleted) {
        res.status(200).json({ status: "delete success" });
      } else res.status(200).json({ status: "failed to delete" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(401).json({ status: "error" });
  }

  //
  // const id = req.params.id;
  // if (!id) {
  //   res.status(401).json({ status: "you don't have access" });
  // }
  // const allArticles = await postsSchema.deleteMany(
  //   { author: id },
  //   { new: true }
  // );
  // try {
  //   if (allArticles) {
  //     res.status(200).json({ status: "succes" });
  //   } else {
  //     res.status(401).json({ status: "failed to delete" });
  //   }
  // } catch (error) {
  //   console.log(error.message);
  //   res.status(403).json({ status: "failed to delete" });
  // }
});

// make an article invisible for admin

posts.post("/deleteforadmin/:adminId", async (req, res, next) => {
  const postId = req.body.postId && req.body.postId;
  const adminId = req.params.adminId;
  const token = req.headers.cookie && req.headers.cookie.split("=")[1];
  console.log(postId, adminId);
  let verefiedUser;

  if (!token) {
    res.json({ status: "wrong token" }).status(401);
  }
  if (token && (!adminId || !postId)) {
    res.json({ status: "there's no id" }).status(401);
  }
  try {
    const verify = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      (err, user) => {
        if (err) {
          console.log({ status: "you don't have access" });
        }
        return (verefiedUser = user);
      },
    );

    if (verefiedUser) {
      const isAdmin = await usersSchema.findOne({
        _id: adminId,
      });
      if (!isAdmin || isAdmin.admin === false) {
        res.status(406).json({ status: "you are not an admin" });
      }
      const deleted = await postsSchema.findByIdAndUpdate(
        { _id: postId },
        { visible: false },
        { new: true },
      );

      if (deleted) {
        res.status(200).json({ status: "deleted" });
      } else res.status(500).json({ status: "failed" });
    } else {
      res.status(403).json({ status: "access denied" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(407).json({ status: "error" });
  }
});

posts.post("/retrieveforadmin/:adminId", async (req, res, next) => {
  const postId = req.body.postId && req.body.postId;
  const adminId = req.params.adminId;
  const token = req.headers.cookie && req.headers.cookie.split("=")[1];

  let verefiedUser;

  if (!token) {
    res.json({ status: "wrong token" }).status(401);
  }
  if (token && (!adminId || !postId)) {
    res.json({ status: "there's no id" }).status(401);
  }
  try {
    const verify = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      (err, user) => {
        if (err) {
          console.log({ status: "you don't have access" });
        }
        return (verefiedUser = user);
      },
    );

    if (verefiedUser) {
      const isAdmin = await usersSchema.findOne({
        _id: adminId,
      });
      if (!isAdmin || isAdmin.admin === false) {
        res.status(406).json({ status: "you are not an admin" });
      }
      const retrieved = await postsSchema.findByIdAndUpdate(
        { _id: postId },
        { visible: true },
        { new: true },
      );

      if (retrieved) {
        res.status(200).json({ status: "retrieved" });
      } else res.status(500).json({ status: "failed" });
    } else {
      res.status(403).json({ status: "access denied" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(407).json({ status: "error" });
  }
});

module.exports = posts;
