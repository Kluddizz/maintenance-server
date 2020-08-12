const db = require("../db");
const fetch = require("node-fetch");

const admin = require("./objects/admin");

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
  let token = null;

  beforeAll(async () => {
    await db.query(
      `
      INSERT INTO users (username, password, firstName, lastName, roleid)
      VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5); 
    `,
      [admin.username, admin.password, admin.firstName, admin.lastName, admin.roleid]
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

    await db.close();
  });

  beforeAll(async () => {
    const request = await fetch("http://localhost:5050/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: admin.username,
        password: admin.password
      })
    });

    const response = await request.json();
    token = response.token;
  });

  it("Create customer", async () => {
    expect.assertions(2);

    const request = await fetch ("http://localhost:5050/customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
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

    await db.query(
      `
        DELETE
        FROM customers
        WHERE email = $1;
      `,
      [customer.email]
    );

    expect(response.success).toBe(true);
    expect(query.rows.length).toBeGreaterThan(0);
  });

});
