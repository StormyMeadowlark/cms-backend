const request = require("supertest");
const app = require("../app"); // Path to your Express app

describe("Post Routes", () => {
  let token;

  beforeAll(async () => {
    // Login as an Editor or Admin to get a token
    const response = await request(app).post("/api/users/login").send({
      email: "admin@example.com",
      password: "AdminPassword",
    });

    token = response.body.token;
  });

  it("should create a new post", async () => {
    const response = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Post",
        content: "This is a test post content",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Test Post");
  });
});
