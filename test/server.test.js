const db = require("../db");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const publicKey = fs.readFileSync(`${__dirname}/../public.key`);

const user = {
  username: "testuser1",
  password: "test123",
  firstName: "test",
  lastName: "user",
  roleid: 0
};

describe("Services", () => {
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

  describe("Login", () => {
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

  describe("User", () => {
    let token = null;

    beforeAll(async () => {
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
      token = response.token;
    });

    it("Valid get request", async () => {
      expect.assertions(4);

      const request = await fetch("http://localhost:5050/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newUsername
        })
      });

      const response1 = await request1.json();

      const request2 = await fetch("http://localhost:5050/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: user.username,
          password: user.password
        })
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
          Authorization: `Bearer ${token}`
        }
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
          Authorization: `Bearer ${token}a`
        }
      });

      const response = await request.json();
      expect(response.success).toBe(false);
    });

    it("Fail without auth token", async () => {
      expect.assertions(1);

      const request = await fetch("http://localhost:5050/users", {
        method: "GET"
      });

      const response = await request.json();
      expect(response.success).toBe(false);
    });
  });
});
