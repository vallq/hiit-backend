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
    //   jwt.verify.mockReturnValueOnce({ name: expectedUser.username });
    // const { body: user } = await request(app)
    //   .get(`/user/${expectedUser.username}`)
    //   .set("Cookie", "token=valid-token")
    //   .expect(200);
    // expect(jwt.verify).toHaveBeenCalledTimes(1);
    // expect(user[0]).toMatchObject(expectedUser);
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
});
