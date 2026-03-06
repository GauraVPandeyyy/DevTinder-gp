const express = require("express");
const profileRouter = express.Router();
const userAuth = require("../middleware/userAuth");
const { profileUpdateValidation } = require("../validators/userValidator");
const { validationResult } = require("express-validator");
profileRouter.get("/profile/view", userAuth, async (req, res) => {
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

//update profile

profileRouter.patch(
  "/profile/edit",
  userAuth,
  profileUpdateValidation,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const isAllowedData = [
      "firstName",
      "lastName",
      "age",
      "gender",
      "photoUrl",
      "about",
      "skills",
    ];

    const updateUserData = req.body;

    try {
      const loggedInUser = req.user;

      const isAllowed = Object.keys(updateUserData).every((key) =>
        isAllowedData.includes(key),
      );

      if (!isAllowed) {
        throw new Error("Invalid field Entered");
      }
      Object.assign(loggedInUser, updateUserData)

      await loggedInUser.save();

      return res.status(200).json({
        message: `${loggedInUser.firstName}, Your Data Updated Successfully.`,
        data: loggedInUser,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
);

module.exports = profileRouter;
