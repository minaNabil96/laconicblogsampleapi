var express = require("express");
var Index = express.Router();

Index.get("/", (req, res) => {
  res.status(200).json({status:'success'})
});

module.exports = Index;
