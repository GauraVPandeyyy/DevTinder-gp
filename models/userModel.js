const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

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
      // match: /.+\@.+\..+/,
      validate(v) {
        if (!validator.isEmail(v)) {
          throw new Error("Invalid email value - " + v);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return validator.isStrongPassword(value);
        },
        message: `Weak password`,
      },
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
          throw new Error(
            "Gender Data is not valid! eg:(male , female , others)",
          );
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
          return v.length>0 && v.length <= 10;
        },
        message: "Skills cannot exceed 10",
      },
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.comparePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;
  const isMatch = await bcrypt.compare(passwordInputByUser, passwordHash);
  return isMatch;
};

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ id: user._id }, "DevTinder@123", {
    expiresIn: "1h",
  });

  return token
};

const User = mongoose.model("User", userSchema);
module.exports = User;
