const db = require("../db");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const user = require("./objects/user");
const publicKey = fs.readFileSync(`${__dirname}/../public.key`);

describe("Login", () => {
  beforeAll(async () => {
    await db.query(
      `
      INSERT INTO users (username, password, firstName, lastName, roleid)
      VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5); 
    `,
      [user.username, user.password, user.firstName, user.lastName, user.roleid]
    );
  });

  afterAll(async () => {
    await db.query(
      `
      DELETE
      FROM users
      WHERE username = $1;
    `,
      [user.username]
    );

    await db.close();
  });
  it("Valid credentials and receive token", async () => {
    expect.assertions(2);

    const request = await fetch("http://localhost:5050/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: user.username,
        password: user.password
      })
    });

    const response = await request.json();
    expect(response.success).toBe(true);
    expect(response.token).not.toBeUndefined();
  });

  it("Invalid credentials", async () => {
    expect.assertions(2);

    const request = await fetch("http://localhost:5050/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: user.username,
        password: user.password + "a"
      })
    });

    const response = await request.json();
    expect(response.success).toBe(false);
    expect(response.token).toBeUndefined();
  });

  it("Test security against forging attack", async () => {
    expect.assertions(2);

    // First login to retreive a token.
    const request = await fetch("http://localhost:5050/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: user.username,
        password: user.password
      })
    });

    const response = await request.json();
    const token = response.token;

    // Now forge the payload of the token by changing the username in it.
    const tokenParts = token.split(".");
    const payloadString = Buffer.from(tokenParts[1], "base64").toString(
      "utf-8"
    );

    const payload = JSON.parse(payloadString);
    payload.username = "forgedusername";

    const forgedPayloadString = JSON.stringify(payload);
    const forgedPayload = Buffer.from(forgedPayloadString);
    const forgedToken =
      tokenParts[0] +
      "." +
      forgedPayload.toString("base64") +
      "." +
      tokenParts[2];

    // Try to verify both tokens (the original and the forged one).
    let tokenVerified = true;
    let forgedTokenVerified = true;

    jwt.verify(token, publicKey, err => {
      if (err) {
        tokenVerified = false;
      }
    });

    jwt.verify(forgedToken, publicKey, err => {
      if (err) {
        forgedTokenVerified = false;
      }
    });

    // Assertions
    expect(tokenVerified).toBe(true);
    expect(forgedTokenVerified).toBe(false);
  });
});
