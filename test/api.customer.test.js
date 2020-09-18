const db = require("../db");
const fetch = require("node-fetch");

const admin = require("./objects/admin");
const user = require("./objects/user");
const customer = require("./objects/customer");
const database = require("./functions/database");

describe("Customer service", () => {
  let adminToken = null;
  let userToken = null;

  beforeAll(async () => {
    await db.query(
      `
      INSERT INTO users (username, password, firstName, lastName, roleid)
      VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5); 
    `,
      [
        admin.username,
        admin.password,
        admin.firstName,
        admin.lastName,
        admin.roleid
      ]
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

  test("Create customer as admin", async () => {
    expect.assertions(2);

    const request = await fetch("http://localhost:5050/customer", {
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

  test("Create customer as normal user", async () => {
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

  test("Request customers as admin", async () => {
    expect.assertions(2);

    const request = await fetch("http://localhost:5050/customer", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });

    const response = await request.json();

    expect(response.success).toBe(true);
    expect(response.customers).not.toBe(undefined);
  });

  test("Request customers as normal user", async () => {
    expect.assertions(2);

    const request = await fetch("http://localhost:5050/customer", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });

    const response = await request.json();

    expect(response.success).toBe(false);
    expect(response.customers).toBe(undefined);
  });

  test("Request one customer as admin", async () => {
    expect.assertions(3);

    const customerId = await database.insertCustomer(customer);

    const request = await fetch(
      `http://localhost:5050/customer/${customerId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );

    const response = await request.json();
    await database.deleteCustomer(customerId);

    expect(response.success).toBe(true);
    expect(response.customer).not.toBe(undefined);
    expect(response.customer.name).toBe(customer.name);
  });

  test("Request one customer as normal user", async () => {
    expect.assertions(2);

    const customerId = await database.insertCustomer(customer);

    const request = await fetch(
      `http://localhost:5050/customer/${customerId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      }
    );

    const response = await request.json();
    await database.deleteCustomer(customerId);

    expect(response.success).toBe(false);
    expect(response.customer).toBe(undefined);
  });

  test("Delete customer as admin", async () => {
    expect.assertions(2);

    // Insert test customer
    const customerId = await database.insertCustomer(customer);

    // Request deletion of the test customer
    const request = await fetch(`http://localhost:5050/customer/${customerId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });

    const response = await request.json();
    
    // Try to get the test customer after the deletion request
    const query = await db.query(
      `
        SELECT *
        FROM customers
        WHERE id = $1;
      `,
      [customerId]
    );

    // Delete the test customer manually, if not done by the request
    if (query.rows.length > 0) {
      await database.deleteCustomer(customerId);
    }

    // Expectations
    expect(response.success).toBe(true);
    expect(query.rows.length).toBe(0);
  });

  test("Delete customer as normal user", async () => {
    expect.assertions(2);

    // Insert test customer
    const customerId = await database.insertCustomer(customer);

    // Request deletion of the test customer
    const request = await fetch(`http://localhost:5050/customer/${customerId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });

    const response = await request.json();
    
    // Try to get the test customer after the deletion request
    const query = await db.query(
      `
        SELECT *
        FROM customers
        WHERE id = $1;
      `,
      [customerId]
    );

    // Delete the test customer manually, if not done by the request
    if (query.rows.length > 0) {
      await database.deleteCustomer(customerId);
    }

    // Expectations
    expect(response.success).toBe(false);
    expect(query.rows.length).toBeGreaterThan(0);
  });

  test("Update customer as admin", async () => {
    expect.assertions(2);

    const customerId = await database.insertCustomer(customer);

    const updatedCustomer = { ...customer };
    updatedCustomer.name = "updatedTestCustomer";

    const request = await fetch(`http://localhost:5050/customer/${customerId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedCustomer)
    });

    const response = await request.json();

    const customerInDb = await database.getCustomer(customerId);
    await database.deleteCustomer(customerId);

    expect(response.success).toBe(true);
    expect(customerInDb.name).toBe(updatedCustomer.name);
  });

  test("Update customer as normal user", async () => {
    expect.assertions(2);

    const customerId = await database.insertCustomer(customer);

    const updatedCustomer = { ...customer };
    updatedCustomer.name = "updatedTestCustomer";

    const request = await fetch(`http://localhost:5050/customer/${customerId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedCustomer)
    });

    const response = await request.json();

    const customerInDb = await database.getCustomer(customerId);
    await database.deleteCustomer(customerId);

    expect(response.success).toBe(false);
    expect(customerInDb.name).toBe(customer.name);
  });
});
