const express = require("express");
const app = express();

app.use(express.json());

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
