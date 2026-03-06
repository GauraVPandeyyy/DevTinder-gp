const express = require("express");
const authRouter = express.Router();

const {
  signupValidation,
  passwordValidation,
} = require("../validators/userValidator");
const { loginValidation } = require("../validators/loginValidation");
const { validationResult } = require("express-validator");

const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const userAuth = require("../middleware/userAuth");

authRouter.post("/signup", signupValidation, async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    age,
    photoUrl,
    skills,
    gender,
    about,
  } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  try {
    const data = await User.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
      age,
      photoUrl,
      skills,
      gender,
      about,
    });

    return res.status(201).json({
      user: data,
      message: "New User Created",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

//login
authRouter.post("/login", loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password");
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const token = await user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
    });

    return res.status(200).json({
      message: "User Login Successfully!",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: `failed- ${error.message}`,
    });
  }
});
//update password
authRouter.patch(
  "/updatePassword",
  userAuth,
  passwordValidation,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const loggedInUser = req.user;
      const passwordInputByUser = req.body.password;

      const paswordHash = await bcrypt.hash(passwordInputByUser, 10);

      loggedInUser.password = paswordHash;

      await loggedInUser.save();

      return res.status(200).json({
        success: true,
        message: "Password Updated succesfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
);

//logout
authRouter.post("/logout", userAuth, (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  //res.clearCookie("token")
  return res.status(200).json({
    message: "Logout successfully",
  });
});

module.exports = authRouter;
