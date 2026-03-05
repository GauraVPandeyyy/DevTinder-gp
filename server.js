const express = require("express");
const dotenv = require("dotenv");
const User = require("./models/userModel");
const app = express();
const ConnectDB = require("./config/db");
// const mongoSanitize = require("express-mongo-sanitize");
const { signupValidation } = require("./validators/userValidator");
const { loginValidation } = require("./validators/loginValidation");
const { validationResult } = require("express-validator");

const bcrypt = require("bcrypt");
const cookiesParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const userAuth = require("./middleware/userAuth");

// app.use(mongoSanitize());
dotenv.config();
ConnectDB();
app.use(express.json());
app.use(cookiesParser());

app.post("/api/signup", signupValidation, async (req, res) => {
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

app.post("/api/login", loginValidation, async (req, res) => {
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
    const isMatch = await user.comparePasword(password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const token = await user.getJWT()

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

app.get("/api/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      user: user,
      message: "Profile fetched successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: `failed- ${error.message}`,
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server is listening @ PORT", process.env.PORT);
});
