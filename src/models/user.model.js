const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const workoutSchema = new mongoose.Schema({
  duration: String,
  focus: String,
  exercises: Array,
  completed: Boolean
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: true, // helps us to find by username,
    //note that this has a significant production impact
    unique: true,
    minlength: 3,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  workouts: [workoutSchema]
});

userSchema.pre("save", async function(next) {
  const rounds = 10;
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
