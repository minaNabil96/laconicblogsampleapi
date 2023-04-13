var express = require("express");
var Index = express.Router();

Index.get("/", (req, res) => {
  res.send("<h1>Home</h1>");
});

module.exports = Index;
