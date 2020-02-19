const app = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken");

mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", true);

describe("app", () => {
  it("should return 1", () => {
    expect(1).toBe(1);
  });

  let mongoServer;
  beforeAll(async () => {
    try {
      mongoServer = new MongoMemoryServer();
      const mongoUri = await mongoServer.getConnectionString();
      await mongoose.connect(mongoUri);
    } catch (err) {
      console.error(err);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const userData = [
      {
        username: "warrior123",
        password: "iWannaB3DVeryBest",
        workouts: []
      },
      {
        username: "knight567",
        password: "i4mDVeryBest",
        workouts: [
          {
            duration: 15,
            focus: "upper body",
            exercises: ["pushups", "planks", "superman", "pull ups"],
            isCompleted: true
          }
        ]
      }
    ];
    await User.create(userData);
    // jest.spyOn(console, "error");
    // console.error.mockReturnValue(() => {});
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await User.deleteMany();
  });

  it("GET / should return all API endpoints", async () => {
    const apiEndpoints = {
      "0": "GET / all API endpoints",
      "1": "POST /register new user",
      "2": "POST /login",
      "3": "POST /logout",
      "4": "GET /user returns user details",
      "5": "GET /user/pastworkouts",
      "6": "GET /user/pastworkouts/:id",
      "7": "DELETE /user/pastworkouts/:id",
      "8": "POST /user/pastworkouts"
    };
    const { body: response } = await request(app)
      .get("/")
      .expect(200)
      .send(apiEndpoints);
    expect(response).toEqual(apiEndpoints);
  });
  describe("/login", () => {
    it("POST / should return `Welcome!` when user is authenticated and valid", async () => {
      const expectedUser = {
        username: "warrior123",
        password: "iWannaB3DVeryBest"
      };
      const { text: correctMessage } = await request(app)
        .post("/login")
        .send(expectedUser)
        .expect(200);
      expect(correctMessage).toEqual("Welcome!");
    });

    it("POST / should return `Login Failed` when password is incorrect", async () => {
      const wrongPassword = {
        username: "warrior123",
        password: "iWannaB3DBest"
      };
      const { text: errorMessage } = await request(app)
        .post("/login")
        .send(wrongPassword)
        .expect(400);
      expect(errorMessage).toBe(`{"error":"Login Failed"}`);
    });

    it("POST / should return `You are now logged out!` when user goes to /logout", async () => {
      const { text: message } = await request(app)
        .post("/logout")
        .expect(200);
      expect(message).toBe("You are now logged out!");
    });
  });
});
