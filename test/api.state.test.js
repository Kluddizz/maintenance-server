const fetch = require("node-fetch");
const database = require("./functions/database");
const user = require("./objects/user");
const state = require("./objects/state");

describe("State tests", () => {
  let userToken = null;

  beforeAll(async () => {
    // Insert an user account, so we can fetch a token.
    user.id = await database.insertUser(user);

    // Login the user and get the token.
    const request = await fetch(`http://localhost:5050/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    // Store the token value in variable.
    const response = await request.json();
    userToken = response.token;
  });

  afterAll(async () => {
    await database.deleteUser(user.id);
    user.id = undefined;
  });

  test("Get all states", async () => {
    expect.assertions(3);

    const request = await fetch(`http://localhost:5050/state`, {
      mehtod: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    const response = await request.json();

    expect(response.success).toBe(true);
    expect(response.states).not.toBeUndefined();
    expect(response.states.length).toBeGreaterThanOrEqual(0);
  });

  test("Get a specific state", async () => {
    expect.assertions(2);
    state.id = await database.insertState(state);

    const request = await fetch(`http://localhost:5050/state/${state.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const response = await request.json();
    await database.deleteState(state.id);

    expect(response.success).toBe(true);
    expect(response.state).not.toBeUndefined();
  });
});
