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

const insertCustomer = async () => {
  await db.query(
    `
      INSERT
      INTO customers (name, street, city, zip, email, contactperson, phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `
    ,
    [customer.name, customer.street, customer.city, customer.zip, customer.email, customer.contactperson, customer.phone]
  );

  const query = await db.query(
    `
      SELECT id
      FROM customers
      WHERE name = $1;
    `,
    [customer.name]
  );

  console.log(query.rows);

  return query.rows[0].id;
};

const deleteCustomer = async (customerId) => {
  await db.query(
    `
      DELETE FROM customers
      WHERE id = $1;
    `,
    [customerId]
  );
};

const getCustomer = async (customerId) => {
  const query = await db.query(
    `
      SELECT *
      FROM customers
      WHERE id = $1;
    `,
    [customerId]
  );

  return query.rows[0];
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

  it("Create customer as admin", async () => {
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

  it("Request customers as admin", async () => {
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

  it("Request customers as normal user", async () => {
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

  it("Request one customer as admin", async () => {
    expect.assertions(3);

    const customerId = await insertCustomer();

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
    await deleteCustomer(customerId);

    expect(response.success).toBe(true);
    expect(response.customer).not.toBe(undefined);
    expect(response.customer.name).toBe(customer.name);
  });

  it("Request one customer as normal user", async () => {
    expect.assertions(2);

    const customerId = await insertCustomer();

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
    await deleteCustomer(customerId);

    expect(response.success).toBe(false);
    expect(response.customer).toBe(undefined);
  });

  it("Delete customer as admin", async () => {
    expect.assertions(2);

    // Insert test customer
    const customerId = await insertCustomer();

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
      await deleteCustomer(customerId);
    }

    // Expectations
    expect(response.success).toBe(true);
    expect(query.rows.length).toBe(0);
  });

  it("Delete customer as normal user", async () => {
    expect.assertions(2);

    // Insert test customer
    const customerId = await insertCustomer();

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
      await deleteCustomer(customerId);
    }

    // Expectations
    expect(response.success).toBe(false);
    expect(query.rows.length).toBeGreaterThan(0);
  });

  it("Update customer as admin", async () => {
    expect.assertions(2);

    const customerId = await insertCustomer();

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

    const customerInDb = await getCustomer(customerId);
    await deleteCustomer(customerId);

    expect(response.success).toBe(true);
    expect(customerInDb.name).toBe(updatedCustomer.name);
  });

  it("Update customer as normal user", async () => {
    expect.assertions(2);

    const customerId = await insertCustomer();

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

    const customerInDb = await getCustomer(customerId);
    await deleteCustomer(customerId);

    expect(response.success).toBe(false);
    expect(customerInDb.name).toBe(customer.name);
  });
});
