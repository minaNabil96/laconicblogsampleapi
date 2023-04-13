const mongoose = require("mongoose");
const postsSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    image: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    body: { type: Array },
    visible: { type: Boolean, default: true },
    date: { type: Date },
    section: [{ type: mongoose.Schema.Types.ObjectId, ref: "sections" }],
    // id: { type: String },
  },
  { timestamps: true }
);

const Post = mongoose.model("Posts", postsSchema);

module.exports = Post;
