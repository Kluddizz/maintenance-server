const db = require("../db");
const fetch = require("node-fetch");

const user = {
  username: "testuser1",
  password: "test123",
  firstName: "test",
  lastName: "user"
};

describe("Services", () => {
  beforeAll(async () => {
    await db.query(
      `
      INSERT INTO users (username, password, firstName, lastName)
      VALUES ($1, crypt($2, gen_salt('bf')), $3, $4); 
    `,
      [user.username, user.password, user.firstName, user.lastName]
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
