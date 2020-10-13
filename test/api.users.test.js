const db = require("../db");
const database = require("./functions/database");
const fetch = require("node-fetch");

const user = require("./objects/user");

describe("User", () => {
  let token = null;

  beforeAll(async () => {
    user.id = await database.insertUser(user);
  });

  afterAll(async () => {
    await database.deleteUser(user.id);
    user.id = undefined;
  });

  beforeAll(async () => {
    const request = await fetch("http://localhost:5050/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: user.username,
        password: user.password,
      }),
    });

    const response = await request.json();
    token = response.token;
  });

  it("Valid get request", async () => {
    expect.assertions(4);

    const request = await fetch(`http://localhost:5050/users/${user.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await request.json();
    expect(response.success).toBe(true);
    expect(response.user.username).toBe(user.username);
    expect(response.user.firstname).toBe(user.firstName);
    expect(response.user.lastname).toBe(user.lastName);
  });

  it("Update user", async () => {
    expect.assertions(4);

    const newUsername = "newusername";
    const newPassword = "newpassword";

    const request1 = await fetch("http://localhost:5050/users", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: newUsername,
      }),
    });

    const response1 = await request1.json();

    const request2 = await fetch("http://localhost:5050/users", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: user.username,
        password: user.password,
      }),
    });

    const response2 = await request2.json();

    expect(response1.success).toBe(true);
    expect(response1.message).toBe("Updated user");
    expect(response2.success).toBe(true);
    expect(response2.message).toBe("Updated user");
  });

  it("Update user with empty request", async () => {
    expect.assertions(2);

    const newUsername = "newusername";

    const request = await fetch("http://localhost:5050/users", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await request.json();

    expect(response.success).toBe(true);
    expect(response.message).toBe("Updated user");
  });

  it("False authorization", async () => {
    expect.assertions(1);

    const request = await fetch("http://localhost:5050/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}a`,
      },
    });

    const response = await request.json();
    expect(response.success).toBe(false);
  });

  it("Fail without auth token", async () => {
    expect.assertions(1);

    const request = await fetch("http://localhost:5050/users", {
      method: "GET",
    });

    const response = await request.json();
    expect(response.success).toBe(false);
  });
});
