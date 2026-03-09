const mongoose = require("mongoose");

const connectionReqSchema = mongoose.Schema(
  {
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["interested", "ignored", "rejected", "accepted"],
        message: "Invalid Status type",
      },
    },
  },
  { timestamps: true },
);

connectionReqSchema.pre("save", function () {
  const connectionReq = this;
  if (connectionReq.fromUserId.equals(connectionReq.toUserId)) {
    throw new Error("You can't sent connection Request yourself!");
  }
});

connectionReqSchema.index(
  {
    fromUserId: 1,
    toUserId: 1,
  },
  {
    unique: true,
  },
);

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionReqSchema,
);

module.exports = ConnectionRequest;
