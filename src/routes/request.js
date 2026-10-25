const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const { default: mongoose } = require("mongoose");
const ConnectionRequest = require("../models/connectionRequest.js");
const User = require("../models/user.js");
const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedstatus = ["interested", "ignored"];
      if (!allowedstatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status type",
        });
      }

      const user = await User.findById(toUserId);
      if (!user) {
        res.status(400).send({ message: "User does not exist" });
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        res.status(400).send({ message: "connection request already exists" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
      console.log(data);

      res.json({
        message: `${req.user.firstName} sent a ${status} Request to the ${toUserId}`,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR!!  " + err.message);
    }
  },
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;
    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).send("Invalid status");
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    });
    if (!connectionRequest) {
      return res.status(404).json({
        message: "Connection request Invalid",
      });
    }

    connectionRequest.status = status;
    const data = await connectionRequest.save();
    res.json({
      message: `Connection request ${status} successfully`,
      data,
    });
  },
);
module.exports = requestRouter;
