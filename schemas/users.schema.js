const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema(
  {
    username: { type: String, requierd: true, unique: true, trim: true },
    password: { type: String, requierd: true, trim: true },
    arabicname: { type: String, requierd: true, unique: true },
    admin: { type: Boolean, default: false },
    isSuper: { type: Boolean, default: false },
    date: {
      type: String,
      default: new Date(),
    },
  },
  { timestamps: true }
);

const users = mongoose.model("users", usersSchema);

module.exports = users;
