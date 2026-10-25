const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { validateUserData } = require("../utils/validation.js");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const authRouter = express.Router();

// authRouter.use(express.json());
// authRouter.use(cookieParser());

authRouter.post("/signup", async (req, res) => {
  try {
    // 1. Validate and get cleaned data
    const userData = validateUserData(req.body);

    // 2. Check for an existing email
    const existingUser = await User.findOne({
      emailId: userData.emailId,
    });

    if (existingUser) {
      return res.status(409).send("Email already exists");
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);
    userData.password = passwordHash;
    console.log(passwordHash);

    // 3. Create the user
    const user = new User(userData);

    // 4. Save to database
    await user.save();

    // 5. Send response
    return res.status(201).send("User created successfully");
  } catch (err) {
    console.error(err.message);

    if (err.code === 11000) {
      return res.status(409).send("Email already exists");
    }

    if (err.statusCode) {
      return res.status(err.statusCode).send(err.message);
    }

    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).send(err.message);
    }

    return res.status(500).send("Something went wrong");
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validator.isEmail(email)) {
      throw new Error("Enter a valid emailId");
    } else {
      const user = await User.findOne({ emailId: email });
      if (!user) {
        throw new Error("Invalid credentials");
      }
      // const ispassword=await bcrypt.compare(password,user.password);
      const ispassword = await user.validatePassword(password);
      if (ispassword) {
        const token = await user.getJWT();
        res.cookie("token", token, {
          expires: new Date(Date.now() + 7 * 3600000),
        });

        res.send("Loggedin successfully");
      } else {
        throw new Error("invalid credentails");
      }
    }
  } catch (err) {
    res.status(400).send("ERROR!! :" + err.message);
    console.error(err);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });

  res.send("User loggedout succesfully");
});
module.exports = authRouter;
