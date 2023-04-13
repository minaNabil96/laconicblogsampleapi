require("dotenv").config();
var cookieSession = require("cookie-session");
var express = require("express");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

var users = express.Router();
var usersSchema = require("../schemas/users.schema");

// login cheker
users.use(
  cookieSession({
    name: "refreshToken",
    keys: ["key1", "key2"],

    httpOnly: true,
    sameSite: "none",
  })
);

// log out
users.post("/logOut", async (req, res, next) => {
  const token = req.headers.cookie && req.headers.cookie.split("=")[1];

  try {
    res.clearCookie("token");
    res.status(200).json({ status: "success" });
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ status: error.message });
  }
  // const user = await usersSchema.find
});

//  login
users.post("/", async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(401).json({ status: "please enter your login info first" });
  }
  const userMatch = await usersSchema.findOne({
    username: username,
  });
  // if (username && password) {
  //   const comparedPassword = await bcrypt.compare(password, userMatch.password);
  // }

  if (!userMatch) {
    res.status(200).json({ status: "wrong username or password" });
  } else if (userMatch) {
    try {
      const comparedPassword = await bcrypt.compare(
        password,
        userMatch.password
      );
      if (comparedPassword === false) {
        res.status(200).json({ status: "wrong username or password" });
      } else if (comparedPassword === true) {
        const { username, arabicname } = userMatch;
        // const userObj = { username, arabicname };
        let convertFromMongoose = await userMatch.toJSON();

        let accessToken = jwt.sign(
          convertFromMongoose,
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "60s",
          }
        );
        let refreshToken = jwt.sign(
          convertFromMongoose,
          process.env.REFRESH_TOKEN_SECRET
        );
        if (accessToken && refreshToken) {
          // .setHeader("Set-Cookie", refreshToken, "Access-Control-Allow-Origin", "*")

          res
            .status(200)
            .cookie("token", refreshToken, {
              httpOnly: true,

              secure: true,
            })
            .json({
              status: "matched",
              username: userMatch.username,
              admin: userMatch.admin,
              isSuper: userMatch.isSuper,
              accessToken: accessToken,
            });
          // .cookie("token", refreshToken, {
          //   httpOnly: true,
          // })
        } else if (!accessToken || !refreshToken) {
          res.status(401).json({ status: "you don't have access" });
        }
      }
    } catch (error) {
      console.log(error.message);
      res.status(404).json(error.message);
    }
  }
});

// add users simple signup, not the final
users.post("/adduser", async (req, res, next) => {
  const { username, password, date, arabicname, admin, isSuper } = req.body;
  if (!username || !password || !arabicname) {
    res.status(401).json({ status: "please enter your full info first" });
  }

  const userMatch = await usersSchema.findOne({
    username: { $eq: username },
  });

  try {
    if (!userMatch) {
      const hashedPassword = await bcrypt.hash(password, 10);
      if (hashedPassword) {
        await new usersSchema({
          username,
          password: hashedPassword,
          arabicname,
          admin,
          isSuper,
          date,
        }).save();
        res.status(200).json({ status: "congratulation" });
      }
    }
    if (userMatch) {
      const {
        username: matchUname,
        password: matchPass,
        arabicname: matchAname,
      } = userMatch;
      const comparedPassword = await bcrypt.compare(password, matchPass);

      if (matchUname !== username) {
        if (matchAname === arabicname) {
          res
            .status(200)
            .json({ status: "arabic name is taken choose another one" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await new usersSchema({
          username,
          password: hashedPassword,
          arabicname,
          admin,
          isSuper,
          date,
        }).save();
        res.status(200).json({ status: "congratulation" });
      }

      if (matchUname === username) {
        if (comparedPassword === true) {
          res.status(200).json({ status: "you have already signed up" });
        } else res.status(200).json({ status: "username is taken" });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(200).json({ status: "error" });
  }
});

// get all users
users.get("/allusers/:adminId", async (req, res, next) => {
  const adminId = req.params.adminId;
  if (!adminId) {
    res.status(500).json({ status: "there's no id" });
  }

  try {
    let matched = await usersSchema.findById({ _id: adminId }).select("admin");

    if (!matched) {
      res.status(500).json({ status: "you don't have access" });
    }
    if (matched.admin === false) {
      res.status(401).json({ status: "you are not an admin" });
    }
    const users = await usersSchema.find({ _id: { $ne: adminId } });
    res.status(200).json(users);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "error" });
  }
});

// delete user

users.post("/deleteuser/:adminId", async (req, res, next) => {
  const { userIdForDelete } = req.body;
  const adminId = req.params.adminId;
  const token = req.headers.cookie && req.headers.cookie.split("=")[1];

  if (!token) {
    res.json({ status: "wrong token" }).status(401);
  }
  if (token && !adminId) {
    res.json({ status: "there's no id" }).status(401);
  }
  let verefiedUser;

  try {
    const verify = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      (err, user) => {
        if (err) {
          console.log({ status: "you don't have access" });
        }
        return (verefiedUser = user);
      }
    );

    if (!verefiedUser) {
      res.status(401).json({ status: "access denied" });
    } else if (!adminId) {
      res.status(401).json({ status: "access denied" });
    }
    const isAdmin = await usersSchema.findOne({
      _id: adminId,
    });
    if (!isAdmin || isAdmin.admin === false) {
      res.status(401).json({ status: "you are not an admin" });
    }
    const userMatch = await usersSchema.findOne({
      _id: userIdForDelete,
    });
    if (!userMatch) {
      res.status(401).json({ status: "user not found" });
    }
    const deleted = await usersSchema.findOneAndDelete({
      _id: userIdForDelete,
    });
    if (deleted) {
      res.status(200).json({ status: "delete success" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(401).json({ status: "error" });
  }
});

// update user by id

users.post("/:adminId", async (req, res, next) => {
  const adminId = req.params.adminId;
  const token = req.headers.cookie && req.headers.cookie.split("=")[1];
  const { superOrNot, userId, password, userfulldatafromform } = req.body;
  let userDataa;
  let userIdFromFormm;
  if (userfulldatafromform) {
    const [userData, { userIdFromForm }] = userfulldatafromform;
    userDataa = userData;
    userIdFromFormm = userIdFromForm;
  }

  // const { userConverted } = userData;

  if (!token) {
    res.json({ status: "wrong token" }).status(402);
  }
  if (token && !adminId) {
    res.json({ status: "there's no id" }).status(401);
  }
  let verefiedUser;

  const verify = jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET,
    (err, user) => {
      if (err) {
        console.log({ status: "you don't have access" });
      }
      return (verefiedUser = user);
    }
  );

  // if (!verefiedUser) {
  //   res.status(403).json({ status: "access denied" });
  // }
  const isAdmin = await usersSchema.findOne({
    _id: adminId,
  });
  if (!isAdmin || isAdmin.admin === false) {
    res.status(405).json({ status: "you are not an admin" });
  }
  const userMatch = await usersSchema.findOne({
    _id: userId || userIdFromFormm,
  });

  if (!userMatch) {
    res.status(406).json({ status: "user not found" });
  } else {
    try {
      if (userId && superOrNot !== undefined) {
        const edited = await usersSchema.findOneAndUpdate(
          { _id: userId },
          { isSuper: superOrNot },
          { new: true }
        );
        res.status(200).json({ status: "edit info success" });
      } else if (
        userfulldatafromform &&
        userIdFromFormm &&
        !superOrNot &&
        !userId
      ) {
        const editedMap = Object.keys(userDataa).map((user) => user);

        if (editedMap.includes("password")) {
          let objectWithPass = { ...userDataa };
          const hashedPassword = await bcrypt.hash(userDataa.password, 10);
          objectWithPass.password = hashedPassword;
          const edited = await usersSchema.findOneAndUpdate(
            { _id: userIdFromFormm },
            objectWithPass,
            { new: true }
          );
          res.status(200).json({ status: "edit info success" });
        } else if (!editedMap.includes("password")) {
          const edited = await usersSchema.findOneAndUpdate(
            { _id: userIdFromFormm },
            userDataa,
            { new: true }
          );

          res.status(200).json({ status: "edit info success" });
        }
      }
    } catch (error) {
      console.log(error.message);
      res.status(407).json({ status: "error" });
    }
  }
});

// get user info
users.get("/info", async (req, res, next) => {
  const token = req.headers.cookie && req.headers.cookie.split("=")[1];

  let verifiedUser;

  if (!token) {
    res.status(401).json({ status: "you don't have access" });
  } else {
    const verified = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      (err, user) => {
        if (err) {
          console.log({ status: "you don't have access" });
        }
        return (verifiedUser = user);
      }
    );
  }
  if (verifiedUser) {
    try {
      const { username, _id, admin, isSuper } = verifiedUser;
      res.status(200).json({ username, _id, admin, isSuper });
    } catch (error) {
      console.log(error.message);
      res.status(401).json({ status: "error" });
    }
    // const user = await usersSchema.find
  }
});

// get all user for devolopment
users.get("/allusers", async (req, res, next) => {
  try {
    const users = await usersSchema.find();
    res.status(200).json(users);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "error" });
  }
  // const user = await usersSchema.find
});

module.exports = users;
