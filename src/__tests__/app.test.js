const app = require("../app");
const request = require("supertest");

describe("app", () => {
  it("should return 1", () => {
    expect(1).toBe(1);
  });
  it("GET / should return all API endpoints", async () => {
    const apiEndpoints = {
      "0": "GET / all API endpoints",
      "1": "POST /login",
      "2": "POST /logout",
      "3": "GET /user returns user details",
      "4": "GET /user/pastworkouts",
      "5": "GET /user/pastworkouts/:id",
      "6": "DELETE /user/pastworkouts/:id",
      "7": "POST /user/pastworkouts"
    };
    const { body: response } = await request(app)
      .get("/")
      .expect(200)
      .send(apiEndpoints);
    expect(response).toEqual(apiEndpoints);
  });
});
