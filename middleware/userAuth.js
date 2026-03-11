const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Invalid Token - Please Login Again !");
    }
    const decodedData = await jwt.verify(token, "DevTinder@123");
    const { id } = decodedData;
    const user = await User.findById(id).select("-password");
    if (!user) {
      throw new Error("User Does Not Exist !!");
    }

    req.user = user;
    next()
  } catch (error) {
    res.status(400).json({
        success: false,
        message : error.message
    })
  }
};


module.exports = userAuth