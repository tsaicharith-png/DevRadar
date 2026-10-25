const express = require("express");
const { connectDB } = require("./config/database.js");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");
const userRouter = require("./routes/user.js");

require("dotenv").config();

app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
connectDB()
  .then(() => {
    console.log("Connection with database is established!!");
    app.listen(3000, () => {
      console.log("The server is listening on port 3000...");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected and server is not listening");
    console.error(err);
  });
