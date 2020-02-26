require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const User = require("./models/user.model");
const userRouter = require("./routes/user.route");
const { wrapAsync } = require("./utils/helperFunctions");

const corsOptions = {
  credentials: true,
  allowedHeaders: "content-type",
  origin: [
    process.env.FRONTEND_URI,
    "http://localhost:3000",
    "http://localhost:3001"
  ]
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.json());
app.use("/user", userRouter);

app.get(
  "/",
  wrapAsync(async (req, res) => {
    const apiEndpoints = {
      "0": "GET / all API endpoints",
      "1": "GET /user returns user details",
      "2": "POST /user/register new user",
      "3": "POST /user/login",
      "4": "POST /user/logout",
      "5": "GET /user/pastworkouts",
      "6": "GET /user/pastworkouts/:id",
      "7": "POST /user/pastworkouts",
      "8": "DELETE /user/pastworkouts/:id"
    };
    await res.send(apiEndpoints);
  })
);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500);
  console.log(err);
  if (err.statusCode) {
    res.send({ error: err.message });
  } else {
    res.send({ error: "internal server error" });
  }
});

module.exports = app;
