const express = require("express");
const User = require("../models/userModel");
const userAuth = require("../middleware/userAuth");
const ConnectionRequest = require("../models/connectionRequest");
const mongoose = require("mongoose");

const connectionReqRoute = express.Router();

connectionReqRoute.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    const toUserId = req.params.toUserId;
    const fromUserId = req.user._id;
    const status = req.params.status;

    // if (toUserId==fromUserId.toString()) {
    //   return res
    //     .status(400)
    //     .json({ message: "You can't sent connection Request yourself!!!" });
    // }
    const allowedStatus = ["interested", "ignored"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid Status type" });
    }

    try {
      if (!mongoose.Types.ObjectId.isValid(toUserId)) {
        throw new Error("Invalid UserId");
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        throw new Error("User not found");
      }

      const isConnectionReqExist = await ConnectionRequest.findOne({
        $or: [
          { toUserId, fromUserId },
          { toUserId: fromUserId, fromUserId: toUserId },
        ],
      });

      if (isConnectionReqExist) {
        throw new Error("Alredy exist this connection!");
      }

      const connectionRequest = new ConnectionRequest({
        toUserId,
        fromUserId,
        status,
      });

      const data = await connectionRequest.save();

      return res.status(201).json({
        message:
          status == "interested"
            ? `${req.user.firstName} is Interested in ${toUser.firstName}`
            : `${req.user.firstName} is Ignored ${toUser.firstName}`,
        data,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
);

connectionReqRoute.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      const loggedInUser = req.user;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid Status");
      }

      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        throw new Error("Invalid RequestID");
      }

      const requestData = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!requestData) {
        throw new Error("User Not Found!");
      }

      requestData.status = status;
      const data = await requestData.save();

      return res.status(200).json({
        message: `${loggedInUser.firstName} ${status} the request`,
        data,
      });
      // validate - status(accept, reject) , requestId
      // find- requestId, toUserId, status
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
);

module.exports = connectionReqRoute;
