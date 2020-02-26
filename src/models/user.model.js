const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const workoutSchema = new mongoose.Schema({
  id: Number,
  duration: Number,
  focus: String,
  exercises: Array,
  isCompleted: Boolean
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: true,
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
  if (this.isModified("password")) {
    const rounds = 10;
    this.password = await bcrypt.hash(this.password, rounds);
    next();
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
