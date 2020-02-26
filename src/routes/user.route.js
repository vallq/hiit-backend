const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { protectRoute } = require("../middleware/auth");
const { removeId, wrapAsync } = require("../utils/helperFunctions");
const WORKOUTS_FIELD = "workouts";
const returnWorkoutsOnly = `-__v -_id -username -password -${WORKOUTS_FIELD}._id -${WORKOUTS_FIELD}.isCompleted`;
const returnUsersOnly = `-__v -_id -password -${WORKOUTS_FIELD}._id -${WORKOUTS_FIELD}.isCompleted`;

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const users = await User.find({}, returnUsersOnly);
    users.sort();
    res.status(200).send(users);
  })
);

const createJWT = username => {
  const payload = { name: username };
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
  return token;
};

router.post(
  "/login",
  wrapAsync(async (req, res, next) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    const result = await bcrypt.compare(password, user.password);

    if (!result) {
      throw new Error("Login Failed");
    }

    const token = createJWT(user.username);

    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = oneDay * 7;
    const expiryDate = new Date(Date.now() + oneWeek);

    res.cookie("token", token, {
      expires: expiryDate
    });

    res.send("Welcome!");
  })
);

router.post(
  "/logout",
  wrapAsync((req, res, next) => {
    res.clearCookie("token").send("You are now logged out!");
  })
);

router.get(
  "/:username",
  wrapAsync(async (req, res) => {
    const targetUsername = req.params.username;
    const expectedUser = await User.findOne(
      { username: targetUsername },
      returnUsersOnly
    );
    res.status(200).send(expectedUser);
  })
);

router.get(
  "/:username/pastworkouts",
  wrapAsync(async (req, res) => {
    const targetUsername = req.params.username;
    const expectedUserWorkout = await User.findOne(
      { username: targetUsername },
      returnWorkoutsOnly
    );
    res.status(200).send(expectedUserWorkout);
  })
);

router.get(
  "/:username/pastworkouts/:id",
  wrapAsync(async (req, res, next) => {
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
  })
);

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
  wrapAsync(async (req, res, next) => {
    const targetUsername = req.params.username;
    const targetId = req.params.id;
    if (req.user.name !== targetUsername) {
      throw new Error(
        "Forbidden: You are not authorized to perform this action"
      );
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
  })
);

router.post(
  "/:username/pastworkouts",
  protectRoute,
  wrapAsync(async (req, res, next) => {
    const targetUsername = req.params.username;
    if (req.user.name !== targetUsername) {
      throw new Error(
        "Forbidden: You are not authorized to perform this action"
      );
    }
    const workoutToAdd = req.body;
    const user = await User.findOne({ username: targetUsername });
    user.workouts.push(workoutToAdd);
    await user.save();
    const workoutsObj = user.workouts.toObject();
    const updatedWorkoutsWithoutId = workoutsObj.map(removeId);
    const updatedWorkoutsWithoutIsCompleted = updatedWorkoutsWithoutId.map(
      ({ isCompleted, ...rest }) => ({ ...rest })
    );
    res.send(updatedWorkoutsWithoutIsCompleted);
  })
);

router.use((err, req, res, next) => {
  if (err.message === "Login Failed") {
    err.statusCode = 401;
  }
  if (
    err.message === "Forbidden: You are not authorized to perform this action"
  ) {
    err.statusCode = 403;
  }
  if (err.message === "Workout not found") {
    err.statusCode = 404;
  }
  if (err.name === "ValidationError") {
    err.statusCode = 400;
  }
  if (err.name === "MongoError" && err.code === 11000) {
    err.statusCode = 422;
    err.message = "E11000 duplicate error.";
  }
  next(err);
});

module.exports = router;
