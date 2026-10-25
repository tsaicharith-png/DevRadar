const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const User = require("../models/user.js");
const {
  validateProfileEdit,
  validatePassword,
} = require("../utils/validation.js");
const bcrypt = require("bcrypt");
const profileRouter = express.Router();

// profileRouter.use(express.json());

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const userData = validateProfileEdit(req.body);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: userData },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.send({
      message: "Your data was edited successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, re_enternewPassword } = req.body;
    const user = req.user;
    const ispassword = await user.validatePassword(currentPassword);
    if (!ispassword) {
      throw new Error("current password is not valid");
    }
    if (validatePassword(newPassword)) {
      if (newPassword === re_enternewPassword) {
        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();
        res.send("Password changed succesfully");
      } else {
        throw new Error(
          "Please ebter new passord correctly in the both fields",
        );
      }
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});
module.exports = profileRouter;
