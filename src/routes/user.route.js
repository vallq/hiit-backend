const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const { protectRoute } = require("../middleware/auth");
const { removeId } = require("../utils/helperFunctions");
const WORKOUTS_FIELD = "workouts";
const returnWorkoutsOnly = `-__v -_id -username -password -${WORKOUTS_FIELD}._id -${WORKOUTS_FIELD}.isCompleted`;
const returnUsersOnly = `-__v -_id -password -${WORKOUTS_FIELD}._id -${WORKOUTS_FIELD}.isCompleted`;
const returnTargetUserAndWorkouts =  "-__v -_id -password";

router.get("/", async (req, res) => {
  const users = await User.find(
    {},
    returnUsersOnly
  );
  users.sort();
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
   returnTargetUserAndWorkouts
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
    returnWorkoutsOnly
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
      returnWorkoutsOnly
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

router.delete(
  "/:username/pastworkouts/:id",
  protectRoute,
  async (req, res, next) => {
    const INCORRECT_ERR = "Incorrect user";
    try {
      const targetUsername = req.params.username;
      const targetId = req.params.id;
      if (req.user.name !== targetUsername) {
        throw new Error(INCORRECT_ERR);
      }
      const targetWorkout = await User.findOneAndDelete(
        { username: targetUsername, "workouts.id": targetId },
        {
          projection: {
            __v: 0,
            _id: 0,
            username: 0,
            password: 0,
            "workouts._id": 0,
            "workouts.isCompleted": 0
          }
        }
      );
      workout = targetWorkout.workouts[0];
      res.status(200).send(workout);
    } catch (err) {
      err.messsage = INCORRECT_ERR;
      err.statusCode = 403;
      next(err);
    }
  }
);

router.patch(
  "/:username/pastworkouts",
  protectRoute,
  async (req, res, next) => {
    const INCORRECT_ERR = "Incorrect user";
    try {
      const targetUsername = req.params.username;
      if (req.user.name !== targetUsername) {
        throw new Error(INCORRECT_ERR);
      }
      const workoutToAdd = {
        id: 2,
        duration: 15,
        focus: "core",
        exercises: [
          "sit ups",
          "reverse crunches",
          "flutter kicks",
          "russian twists"
        ]
      };
      const { workouts } = await User.findOne(
        { username: targetUsername },
        returnWorkoutsOnly,
      );
      workouts.push(workoutToAdd);
      const updatedWorkouts = workouts.toObject().map(removeId);
      res.send(updatedWorkouts);
    } catch (err) {
      err.message = "Unable to add new workout";
      next(err);
    }
  }
);

module.exports = router;
