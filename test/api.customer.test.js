const db = require("../db");
const fetch = require("node-fetch");

const admin = require("./objects/admin");
const user = require("./objects/user");

const customer = {
  name: "testcustomer",
  street: "street",
  city: "city",
  zip: 12345,
  email: "test@mail.com",
  contactperson: "contactperson",
  phone: "0123456789"
};

describe("Customer service", () => {
  let adminToken = null;
  let userToken = null;

  beforeAll(async () => {
    await db.query(
      `
      INSERT INTO users (username, password, firstName, lastName, roleid)
      VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5); 
    `,
      [admin.username, admin.password, admin.firstName, admin.lastName, admin.roleid]
    );

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
      [admin.username]
    );

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

  beforeAll(async () => {
    const requestAdmin = await fetch("http://localhost:5050/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: admin.username,
        password: admin.password
      })
    });

    const requestUser = await fetch("http://localhost:5050/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: user.username,
        password: user.password
      })
    });

    const responseAdmin = await requestAdmin.json();
    const responseUser = await requestUser.json();

    adminToken = responseAdmin.token;
    userToken = responseUser.token;
  });

  it("Create customer as admin", async () => {
    expect.assertions(2);

    const request = await fetch ("http://localhost:5050/customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(customer)
    });

    const response = await request.json();

    const query = await db.query(
      `
        SELECT *
        FROM customers
        WHERE email = $1;
      `,
      [customer.email]
    );

    if (query.rows.length > 0) {
      await db.query(
        `
          DELETE
          FROM customers
          WHERE email = $1;
        `,
        [customer.email]
      );
    }

    expect(response.success).toBe(true);
    expect(query.rows.length).toBeGreaterThan(0);
  });

  it("Create customer as normal user", async () => {
    expect.assertions(2);

    const request = await fetch("http://localhost:5050/customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify(customer)
    });

    const response = await request.json();

    const query = await db.query(
      `
        SELECT *
        FROM customers
        WHERE email = $1;
      `,
      [customer.email]
    );

    if (query.rows.length > 0) {
      await db.query(
        `
          DELETE
          FROM customers
          WHERE email = $1;
        `,
        [customer.email]
      );
    }

    expect(response.success).toBe(false);
    expect(query.rows.length).toBe(0);
  });

});
