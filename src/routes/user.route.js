const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const WORKOUTS_FIELD = "workouts";

router.get("/", async (req, res) => {
  const users = await User.find(
    {},
    `-__v -_id -password -${WORKOUTS_FIELD}._id -${WORKOUTS_FIELD}.isCompleted`
  );
  users.sort((a, b) => a.username > b.username);
  res.status(200).send(users);
});

router.get("/:username", async (req, res) => {
  const targetUsername = req.params.username;
  // const expectedUser = {
  //   username: targetUsername,
  //   workouts: []
  // };
  const expectedUser = await User.findOne(
    { username: targetUsername },
    "-__v -_id -password"
  );
  res.status(200).send(expectedUser);
});

router.get("/:username/pastworkouts", async (req, res) => {
  const targetUsername = req.params.username;
  // const expectedUserWorkout = {
  //   workouts: [
  //     {
    //      id: 1
  //       duration: 15,
  //       focus: "upper body",
  //       exercises: ["pushups", "planks", "superman", "pull ups"]
  //     }
  //   ]
  // };
  const expectedUserWorkout = await User.findOne(
    { username: targetUsername },
    `-__v -_id -username -password -${WORKOUTS_FIELD}._id -${WORKOUTS_FIELD}.isCompleted`
  );
  res.status(200).send(expectedUserWorkout);
});

module.exports = router;
