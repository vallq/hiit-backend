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

describe("/user/:username", () => {
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
        username: "knight567",
        password: "i4mDVeryBest",
        workouts: [
          {
            id: 1,
            duration: 15,
            focus: "upper body",
            exercises: ["pushups", "planks", "superman", "pull ups"],
            isCompleted: true
          }
        ]
      },
      {
        username: "warrior123",
        password: "iWannaB3DVeryBest",
        workouts: []
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

  it("GET / should return all users", async () => {
    const expectedResponse = [
      {
        username: "warrior123",
        workouts: []
      },
      {
        username: "knight567",
        workouts: [
          {
            id: 1,
            duration: 15,
            focus: "upper body",
            exercises: ["pushups", "planks", "superman", "pull ups"]
          }
        ]
      }
    ];
    const { body: response } = await request(app)
      .get("/user")
      .expect(200);
    //response.sort((a, b) => a.id > b.id);
    expect(response).toEqual(expectedResponse);
  });

  it("GET / should return username 'warrior123' and empty workout array", async () => {
    const expectedResponse = {
      username: "warrior123",
      workouts: []
    };
    const { body: response } = await request(app)
      .get(`/user/${expectedResponse.username}`)
      .expect(200);
    expect(response.workouts).toStrictEqual(expect.anything());
    expect(response).toMatchObject(expectedResponse);
  });

  it("GET / should return user's past workouts only", async () => {
    const targetUser = "knight567";
    const expectedResponse = {
      workouts: [
        {
          id: 1,
          duration: 15,
          focus: "upper body",
          exercises: ["pushups", "planks", "superman", "pull ups"]
        }
      ]
    };
    const { body: response } = await request(app)
      .get(`/user/${targetUser}/pastworkouts`)
      .expect(200);
    expect(response).toMatchObject(expectedResponse);
  });

  it("GET / should return user's past workout of id 1", async () => {
    const targetUser = "knight567";
    const expectedResponse = {
      id: 1,
      duration: 15,
      focus: "upper body",
      exercises: ["pushups", "planks", "superman", "pull ups"]
    };
    const { body: response } = await request(app)
      .get(`/user/${targetUser}/pastworkouts/${expectedResponse.id}`)
      .expect(200);
    expect(response).toMatchObject(expectedResponse);
  });

  it("GET / should return error message when there is no workout", async () => {
    const targetUser = "warrior123";
    const targetId = 1;
    const expectedResponse = { error: "Workout not found" };
    //const expectedResponse = `${targetUser} has no such workout!`;
    const { body: response } = await request(app)
      .get(`/user/${targetUser}/pastworkouts/${targetId}`)
      .expect(400);
    expect(response).toMatchObject(expectedResponse);
  });

  it("DELETE / should return workout that has been deleted", async () => {
    const targetUser = "knight567";
    const targetId = 1;
    const expectedResponse = {
      id: 1,
      duration: 15,
      focus: "upper body",
      exercises: ["pushups", "planks", "superman", "pull ups"]
    };
    jwt.verify.mockReturnValueOnce({ username: { targetUser } });
    const { body: response } = await request(app)
      .get(`/user/${targetUser}/pastworkouts/${targetId}`)
      .set("Cookie", "token=valid-token")
      .expect(200);
    expect(response).toMatchObject(expectedResponse);
  });
});
