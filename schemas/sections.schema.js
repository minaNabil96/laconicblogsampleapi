const mongoose = require("mongoose");

const sectionsSchema = new mongoose.Schema(
  {
    sectionName: { type: String, required: true, unique: true },
    // articles: { type: mongoose.Schema.Types.ObjectId, ref: "Posts" },
    desc: { type: String, required: true },
    image: { type: String, required: true },
    visible: { type: Boolean, default: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const sections = mongoose.model("sections", sectionsSchema);
module.exports = sections;
