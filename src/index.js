const PORT = 3000;
const app = require("./app");

const server = app.listen(process.env.PORT || PORT, () => {
  console.log(`Express app started on http://localhost:${PORT}`);
});
