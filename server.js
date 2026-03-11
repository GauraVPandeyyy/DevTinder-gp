const express = require("express");
const dotenv = require("dotenv");
const app = express();
const ConnectDB = require("./config/db");
// const mongoSanitize = require("express-mongo-sanitize");

const cookiesParser = require("cookie-parser");
const authRouter = require("./routes/auth")
const profileRouter = require("./routes/profile");
const connectionReqRoute = require("./routes/request");
const userRouter = require("./routes/user");

// app.use(mongoSanitize());
dotenv.config();
ConnectDB();
app.use(express.json());
app.use(cookiesParser());

app.use("/api", authRouter)
app.use("/api", profileRouter)
app.use("/api", connectionReqRoute)
app.use("/api", userRouter)

app.listen(process.env.PORT, () => {
  console.log("Server is listening @ PORT", process.env.PORT);
});
