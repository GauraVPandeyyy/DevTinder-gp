const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      trim: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    age: {
      type: Number,
      min: [18, "age should be greater than 18"],
      max: [100, "age should be lesser than 100"],
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender Data is not valid!");
        }
      },
    },
    photoUrl: {
      type: String,
      default: "https://img.freepik.com/premium-vector/avatar-profile",
    },
    about: {
      type: String,
      maxlength: [500, "About length can't exceed 500"],
      default: "There is nothing about this person",
    },
    skills: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.lenth < 10;
        },
        message: "Skills length should be lesser than 10",
      },
    },
    // skills: {
    //   type: [String],
    //   validate: {
    //     validator: function (v) {
    //       return v.length <= 10;
    //     },
    //     message: "Skills cannot exceed 10",
    //   },
    // },
  },
  {
    timestamps: true,
  },
);
const User = mongoose.model("User", userSchema);
module.exports = User;
