const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const User = require("./models/user.model");
require("dotenv").config();
const userRouter = require("./routes/user.route");

const corsOptions = {
  credentials: true,
  allowedHeaders: "content-type",
  origin: "http://localhost:3001"
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.json());
app.use("/user", userRouter);

app.get("/", (req, res) => {
  const apiEndpoints = {
    "0": "GET / all API endpoints",
    "1": "POST /login",
    "2": "POST /logout",
    "3": "GET /user returns user details",
    "4": "GET /user/pastworkouts",
    "5": "GET /user/pastworkouts/:id",
    "6": "DELETE /user/pastworkouts/:id",
    "7": "POST /user/pastworkouts"
  };
  res.send(apiEndpoints);
});

const createJWT = username => {
  const payload = { name: username };
  //console.log("secret key is" + process.env.JWT_SECRET_KEY);
  //console.log("payload is", payload);
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
  //console.log("Token is", token);
  return token;
};

app.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    //res.send("hi");
    ///const user = await User.findOne({ username });
    const user = {
      username,
      password
    };
    //const result = await bcrypt.compare(password, user.password);

    //console.log("hi");

    // if (!result) {
    //   throw new Error("Login Failed");
    // }

    const token = createJWT(user.username);
    //console.log("token 2 is", token);

    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = oneDay * 7;
    const expiryDate = new Date(Date.now() + oneWeek);

    res.cookie("token", token, {
      expires: expiryDate
    });

    res.send("Welcome!");
  } catch (err) {
    if (err.message === "Login Failed") {
      err.statusCode = 400;
    }
    next(err);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token").send("You are now logged out!");
});

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
