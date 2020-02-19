require("./utils/db");

const PORT = 3000;
const app = require("./app");

const server = app.listen(process.env.PORT || PORT, () => {
  console.log(`Express app started on http://localhost:${PORT}`);
});

// const User = require("./models/user.model");
// const userData = [
//   {
//     username: "knight567",
//     password: "i4mDVeryBest",
//     workouts: [
//       {
//         id: 1,
//         duration: 15,
//         focus: "upper body",
//         exercises: ["pushups", "planks", "superman", "pull ups"],
//         isCompleted: true
//       }
//     ]
//   },
//   {
//     username: "warrior123",
//     password: "iWannaB3DVeryBest",
//     workouts: []
//   }
// ];
// const createInitialDB = async userData => {
//   try {
//     await User.create(userData);
//   } catch (err) {
//     console.log(err);
//   }
// };

// createInitialDB(userData);
