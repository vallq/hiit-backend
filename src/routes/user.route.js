const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const { protectRoute } = require("../middleware/auth");
const WORKOUTS_FIELD = "workouts";

router.get("/", async (req, res) => {
  const users = await User.find(
    {},
    `-__v -_id -password -${WORKOUTS_FIELD}._id -${WORKOUTS_FIELD}.isCompleted`
  );
  users.sort((a, b) => b.username > a.username);
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
  //      id: 1,
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

router.get("/:username/pastworkouts/:id", async (req, res, next) => {
  try {
    const targetUsername = req.params.username;
    const targetId = req.params.id;
    // const expectedUserWorkout = {
    //        id: 1,
    //       duration: 15,
    //       focus: "upper body",
    //       exercises: ["pushups", "planks", "superman", "pull ups"]
    // };

    const userWorkouts = await User.findOne(
      { username: targetUsername, "workouts.id": targetId },
      `-__v -_id -username -password -${WORKOUTS_FIELD}._id -${WORKOUTS_FIELD}.isCompleted`
    );
    if (userWorkouts === null) {
      throw new Error("Workout not found");
    }
    const expectedUserWorkout = userWorkouts.workouts[0];
    res.status(200).send(expectedUserWorkout);
  } catch (err) {
    if (err.message === "Workout not found") {
      err.statusCode = 400;
    }
    next(err);
  }
});

router.delete("/:username/pastworkouts/:id", protectRoute, async (req, res) => {
  const targetUsername = req.params.username;
  const targetId = req.params.id;
  const targetWorkout = await User.findOneAndDelete({ username: targetUsername, "workouts.id": targetId },
  `-__v -_id -username -password -${WORKOUTS_FIELD}._id -${WORKOUTS_FIELD}.isCompleted`);
  res.status(200).send(targetWorkout);
})
module.exports = router;
