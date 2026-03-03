const express = require("express");
const dotenv = require("dotenv");
const User = require("./models/userModel");
const app = express();
const ConnectDB = require("./config/db");
// const mongoSanitize = require("express-mongo-sanitize");
const { signupValidation } = require("./validators/userValidator");
const {loginValidation} = require('./validators/loginValidation')
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
// app.use(mongoSanitize());
dotenv.config();
app.use(express.json());
ConnectDB();

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
  console.log(hashPassword);

  try {
    //  if(response?.skills?.length >10){
    //   throw new Error("Skills length can't be more than 10");

    // }
    // if(response?.age >100){
    //   throw new Error("Age can't be more than 100");

    // }
    // if(response?.about?.length >500){
    //   throw new Error("About length can't be more than 100");
    // }

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

app.post("/api/login",loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({
      success:false,
      errors : errors.array()
    })
  }


  try {
    const { email, password } = req.body;
    console.log(email, password);
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error("Invalid email or password");
    }

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

app.get("/api/user/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // const email = req.body.email;
    // const user = await User.findOne({ email: email });
    const user = await User.findById(id).select("-password");
    if (!user) {
      res.status(400).json({ message: "User not found!" });
    } else {
      res.send(user);
    }
  } catch (error) {
    res.send("something went wrong");
  }
});

app.get("/api/feed", async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    if (users.length === 0) {
      res.send("No user found");
    } else {
      res.send(users);
    }
  } catch (error) {
    res.send("something went wrong - " + error.message);
  }
});

app.patch("/api/user/:id", async (req, res) => {
  const data = req.body;
  try {
    if (Object.keys(data).length === 0)
      throw new Error("Nothing provided to update");

    const isAllowedData = ["age", "gender", "photoUrl", "about", "skills"];
    const isAllowed = Object.keys(data).every((k) => isAllowedData.includes(k));
    if (!isAllowed) {
      throw new Error("Can't update");
    }

    // if (data?.skills?.length > 10) {
    //   throw new Error("Skills length can't be more than 10");
    // }
    // if (data?.age > 100) {
    //   throw new Error("Age can't be more than 100");
    // }
    // if (data?.about?.length > 500) {
    //   throw new Error("About length can't be more than 100");
    // }

    const user = await User.findByIdAndUpdate(req.params.id, data, {
      returnDocument: "after",
      runValidators: true,
    });
    console.log(user);
    res.status(200).json("Updated successfully!");
  } catch (error) {
    res.status(400).json("Update Failded - " + error.message);
  }
});
app.delete("/api/user/:id", async (req, res) => {
  const data = req.body;
  try {
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    console.log(user);
    res.status(200).json("Delete successfully!");
  } catch (error) {
    res.status(400).json("Something went wrong!! - " + error.message);
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server is listening @ PORT", process.env.PORT);
});
