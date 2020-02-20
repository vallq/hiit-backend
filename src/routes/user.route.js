const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const { protectRoute } = require("../middleware/auth");
const { removeId, wrapAsync } = require("../utils/helperFunctions");
const WORKOUTS_FIELD = "workouts";
const returnWorkoutsOnly = `-__v -_id -username -password -${WORKOUTS_FIELD}._id -${WORKOUTS_FIELD}.isCompleted`;
const returnUsersOnly = `-__v -_id -password -${WORKOUTS_FIELD}._id -${WORKOUTS_FIELD}.isCompleted`;

router.get("/", async (req, res) => {
  const users = await User.find({}, returnUsersOnly);
  users.sort();
  res.status(200).send(users);
});

router.get("/:username", async (req, res) => {
  const targetUsername = req.params.username;
  const expectedUser = await User.findOne(
    { username: targetUsername },
    returnUsersOnly
  );
  res.status(200).send(expectedUser);
});

router.get("/:username/pastworkouts", async (req, res) => {
  const targetUsername = req.params.username;
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
    err.statusCode = 400;
    err.message = "Workout not found";
    next(err);
  }
});

router.post(
  "/",
  wrapAsync(async (req, res, next) => {
    const userData = req.body;
    const createNewUser = new User(userData);
    await User.init();
    const newUser = await createNewUser.save();
    res.status(201).send(newUser);
  })
);

router.delete(
  "/:username/pastworkouts/:id",
  protectRoute,
  async (req, res, next) => {
    const INCORRECT_ERR = "You are not authorized to be here";
    try {
      const targetUsername = req.params.username;
      const targetId = req.params.id;
      if (req.user.name !== targetUsername) {
        throw new Error(INCORRECT_ERR);
      }
      const user = await User.findOne({ username: targetUsername });
      const currentWorkouts = user.workouts;
      const workoutToRemove = currentWorkouts.find(
        exercise => (exercise.id = targetId)
      );
      const indexToRemove = currentWorkouts.indexOf(workoutToRemove);
      user.workouts.splice(indexToRemove, 1);
      await user.save();
      res.status(200).send(workoutToRemove);
    } catch (err) {
      if (err.message === INCORRECT_ERR) {
        err.statusCode = 401;
      }
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
      const workoutToAdd = req.body;
      const user = await User.findOne(
        { username: targetUsername }
        //returnWorkoutsOnly
      );
      user.workouts.push(workoutToAdd);
      await user.save();
      const workoutsObj = user.workouts.toObject();
      const updatedWorkoutsWithoutId = workoutsObj.map(removeId);
      const updatedWorkoutsWithoutIsCompleted = updatedWorkoutsWithoutId.map(
        ({ isCompleted, ...rest }) => ({ ...rest })
      );
      res.send(updatedWorkoutsWithoutIsCompleted);
    } catch (err) {
      if (err.message === INCORRECT_ERR) {
        err.statusCode = 401;
      }
      // } else {
      //   err.statusCode = 403
      //   err.message = "Forbidden: Unable to add new workout";
      // }

      next(err);
    }
  }
);

module.exports = router;
