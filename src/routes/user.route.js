const express = require("express");
const router = express.Router();
const User = require("../models/user.model");

router.get("/", async (req, res) => {
  const WORKOUTS_FIELD = "workouts";
  const users = await User.find(
    {},
    `-__v -_id -password -${WORKOUTS_FIELD}._id -${WORKOUTS_FIELD}.isCompleted`
  );
  users.sort((a, b) => a.username > b.username);
  res.status(200).send(users);
});

// router.get("/:username", async (req, res) => {
//   const username = req.params.username;
//   const user = {
//     username: username,
//     workouts = []
//   }
//   console.log(res.body);
//   console.log(res.params);
//   //const user = await User.findOne({ username }, "-password");
//   res.send(user);
// });

module.exports = router;
