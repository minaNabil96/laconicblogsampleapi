var express = require("express");
var jwt = require("jsonwebtoken");

var sections = express.Router();
var sectionsSchema = require("../schemas/sections.schema");
const usersSchema = require("../schemas/users.schema");
const postsSchema = require("../schemas/posts.schema");

// get all sections
sections.get("/", async (req, res, next) => {
  try {
    const sections = await sectionsSchema.find({ visible: true });
    if (sections) {
      res.status(200).json(sections);
    } else {
      res.status(500).json({ status: "failed" });
    }
  } catch (error) {
    res.status(501).json(error.message);
    console.log(error);
  }
});

// get all sections for admin
sections.get("/sections-admin", async (req, res, next) => {
  const token = req.headers.cookie && req.headers.cookie.split("=")[1];
  let verefiedUser;

  if (!token) {
    res.status(501).json({ status: "failed" });
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
      }
    );

    const isAdmin = verefiedUser.admin;
    if (!isAdmin) {
      res.status(502).json({ status: "id not found" });
    } else {
      const sections = await sectionsSchema.find();
      if (sections) {
        res.status(200).json(sections);
      } else {
        res.status(500).json({ status: "failed" });
      }
    }
  } catch (error) {
    res.status(501).json(error.message);
    console.log(error);
  }
});

// get section by id
sections.get("/:sectionId", async (req, res, next) => {
  const sectionId = req.params.sectionId;

  if (!sectionId) {
    res.status(500).json({ status: "internal error" });
  }

  try {
    const sectionDetails = await postsSchema.count({ section: sectionId });
    if (!sectionDetails) {
      res.status(203).json({ status: "section have no articles" });
    } else {
      res.status(200).json(sectionDetails);
    }
  } catch (error) {
    res.status(501).json(error.message);
    console.log(error);
  }
});

// add a section
sections.post("/", async (req, res, next) => {
  // const adminId = req.params.adminId;
  const token = req.headers.cookie && req.headers.cookie.split("=")[1];
  const { sectionName, desc, image } = req.body;
  let verefiedUser;

  if (!token) {
    res.status(501).json({ status: "failed" });
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
      }
    );

    const isAdmin = verefiedUser.admin;
    if (!isAdmin) {
      res.status(502).json({ status: "id not found" });
    } else {
      const section = await new sectionsSchema({
        sectionName,
        desc,
        image,
      }).save();
      if (section) {
        res.status(200).json({ status: "success", section });
      }
    }
  } catch (error) {
    res.status(504).json(error.message);
    console.log(error);
  }
});

// edit a section
sections.post("/edit", async (req, res, next) => {
  const token = req.headers.cookie && req.headers.cookie.split("=")[1];
  const { payload } = req.body;
  let verefiedUser;
  if (!token) {
    res.status(500).json({ status: "there's no token" });
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
      }
    );

    const isAdmin = verefiedUser.admin;
    if (!isAdmin) {
      res.status(502).json({ status: "id not found" });
    } else {
      const obj = { ...payload };
      delete obj.sectionId;
      const editedSection = await sectionsSchema.findOneAndUpdate(
        { _id: payload.sectionId },
        obj,
        { new: true }
      );

      res.status(200).json({ status: "success", editedSection });
    }
  } catch (error) {
    res.status(504).json(error.message);
    console.log(error);
  }
});

//  retrieve section
sections.post("/retrieve-section", async (req, res, next) => {
  const token = req.headers.cookie && req.headers.cookie.split("=")[1];
  let verefiedUser;
  const { sectionId } = req.body;

  if (!sectionId || !token) {
    res.status(501).json({ status: "failed" });
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
      }
    );

    const isAdmin = verefiedUser.admin;
    if (!isAdmin) {
      res.status(502).json({ status: "id not found" });
    } else {
      const deletedSection = await sectionsSchema.findByIdAndUpdate(
        {
          _id: sectionId,
        },
        { visible: true },
        { new: true }
      );
      if (deletedSection) {
        res.status(200).json({ status: "success deleted" });
      } else {
        res.status(504).json({ status: "failed" });
      }
    }
  } catch (error) {
    res.status(505).json(error.message);
    console.log(error);
  }
});

//  delete section
sections.post("/delete", async (req, res, next) => {
  const token = req.headers.cookie && req.headers.cookie.split("=")[1];
  let verefiedUser;
  const { sectionId } = req.body;

  if (!sectionId || !token) {
    res.status(501).json({ status: "failed" });
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
      }
    );

    const isAdmin = verefiedUser.admin;
    if (!isAdmin) {
      res.status(502).json({ status: "id not found" });
    } else {
      const deletedSection = await sectionsSchema.findByIdAndUpdate(
        {
          _id: sectionId,
        },
        { visible: false },
        { new: true }
      );
      if (deletedSection) {
        res.status(200).json({ status: "success deleted" });
      } else {
        res.status(504).json({ status: "failed" });
      }
    }
  } catch (error) {
    res.status(505).json(error.message);
    console.log(error);
  }
});

module.exports = sections;
