const db = require("../db");

const fetch = require("node-fetch");

const admin = require("./objects/admin");
const user = require("./objects/user");
const customer = require("./objects/customer");
const system = require("./objects/system");
const maintenance = require("./objects/maintenance");
const database = require("./functions/database");

describe("Maintenance service", () => {
  let adminToken = null;
  let userToken = null;

  beforeAll(async () => {
    // Insert an administrator and a normal account.
    admin.id = await database.insertUser(admin);
    user.id = await database.insertUser(user);

    // Insert a customer and a system before each test.
    customer.id = await database.insertCustomer(customer);
    system.customerid = customer.id;
    system.id = await database.insertSystem(system);
    maintenance.systemid = system.id;

    const requestAdmin = await fetch("http://localhost:5050/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: admin.username,
        password: admin.password,
      }),
    });

    const requestUser = await fetch("http://localhost:5050/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: user.username,
        password: user.password,
      }),
    });

    const responseAdmin = await requestAdmin.json();
    const responseUser = await requestUser.json();

    adminToken = responseAdmin.token;
    userToken = responseUser.token;
  });

  afterAll(async () => {
    await database.deleteUser(admin.id);
    await database.deleteUser(user.id);
    user.id = undefined;
    admin.id = undefined;
  });

  test("Get a maintenance entry", async () => {
    expect.assertions(3);

    // Insert a maintenance manually.
    const maintenanceId = await database.insertMaintenance(maintenance);

    // Send the API request.
    const request = await fetch(
      `http://localhost:5050/maintenance/${maintenanceId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    // The response is in JSON format.
    const response = await request.json();

    // Delete the maintenance.
    await database.deleteMaintenance(maintenanceId);

    // Expectations.
    if (!response.success) {
      console.log(response.message);
    }
    console.log(response);
    expect(response.success).toBe(true);
    expect(response.maintenance.name).toBe(maintenance.name);
    expect(response.maintenance.systemid).toBe(maintenance.systemid);
  });

  test("Get all maintenances of an user", async () => {
    expect.assertions(4);

    // Create a mainenance for a specific user.
    maintenance.userid = user.id;
    const maintenanceId = await database.insertMaintenance(maintenance);

    // Send the API request.
    const request = await fetch(
      `http://localhost:5050/maintenance/user/${user.id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    // The response is in JSON format.
    const response = await request.json();

    // Delete the maintenance.
    await database.deleteMaintenance(maintenanceId);

    // Expectations.
    expect(response.success).toBe(true);
    expect(response.maintenances).not.toBe(undefined);
    expect(response.maintenances.length).toBeGreaterThan(0);
    expect(response.maintenances[0].userid).toBe(user.id);
  });

  test("Get all maintenances as admin", async () => {
    expect.assertions(3);

    const numberMaintenances = 10;
    const ids = [];

    const beforeInsertRequest = await fetch(
      "http://localhost:5050/maintenance",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const beforeInsertResponse = await beforeInsertRequest.json();

    // Insert some maintenances into the database.
    for (let i = 0; i < numberMaintenances; i++) {
      const m = { ...maintenance };
      m.name = m.name + i;
      m.userid = user.id;

      const mId = await database.insertMaintenance(m);
      ids.push(mId);
    }

    // Send API request.
    const request = await fetch("http://localhost:5050/maintenance", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    // The response is in JSON format.
    const response = await request.json();

    // Delete all maintenances.
    for (let i = 0; i < numberMaintenances; i++) {
      const id = ids[i];
      await database.deleteMaintenance(id);
    }

    // Expectations.
    expect(response.success).toBe(true);
    expect(response.maintenances).not.toBeUndefined();
    expect(response.maintenances.length).toBe(
      numberMaintenances + beforeInsertResponse.maintenances.length
    );
  });

  test("Get all maintenances as user (should fail)", async () => {
    expect.assertions(2);

    const numberMaintenances = 10;
    const ids = [];

    // Insert some maintenances into the database.
    for (let i = 0; i < numberMaintenances; i++) {
      const m = { ...maintenance };
      m.name = m.name + i;
      m.userid = user.id;

      const mId = await database.insertMaintenance(m);
      ids.push(mId);
    }

    // Send API request.
    const request = await fetch("http://localhost:5050/maintenance", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    // The response is in JSON format.
    const response = await request.json();

    // Delete all maintenances.
    for (let i = 0; i < numberMaintenances; i++) {
      const id = ids[i];
      await database.deleteMaintenance(id);
    }

    // Expectations.
    expect(response.success).toBe(false);
    expect(response.maintenances).toBeUndefined();
  });

  test("Create a new maintenance as admin", async () => {
    expect.assertions(2);

    // Send API request.
    const request = await fetch("http://localhost:5050/maintenance", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(maintenance),
    });

    // The response is in JSON format.
    const response = await request.json();

    const query = await db.query(
      `
        SELECT *
        FROM maintenances
        WHERE name = $1
              AND systemid = $2;
      `,
      [maintenance.name, maintenance.systemid]
    );

    // Delete the maintenance entry.
    await db.query(
      `
        DELETE
        FROM maintenances
        WHERE name = $1
              AND systemid = $2;
      `,
      [maintenance.name, maintenance.systemid]
    );

    // Expectations.
    expect(response.success).toBe(true);
    expect(query.rows.length).toBeGreaterThan(0);
  });

  test("Create a new maintenance as normal user (should fail)", async () => {
    expect.assertions(2);

    // Send API request.
    const request = await fetch("http://localhost:5050/maintenance", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(maintenance),
    });

    // The response is in JSON format.
    const response = await request.json();

    const query = await db.query(
      `
        SELECT *
        FROM maintenances
        WHERE name = $1
              AND systemid = $2;
      `,
      [maintenance.name, maintenance.systemid]
    );

    // Delete the maintenance entry.
    await db.query(
      `
        DELETE
        FROM maintenances
        WHERE name = $1
              AND systemid = $2;
      `,
      [maintenance.name, maintenance.systemid]
    );

    // Expectations.
    expect(response.success).toBe(false);
    expect(query.rows.length).toBe(0);
  });

  test("Edit a maintenance as admin", async () => {
    expect.assertions(4);

    const maintenanceId = await database.insertMaintenance(maintenance);
    const modifiedMaintenance = {
      ...maintenance,
      name: "testMaintenanceModified",
    };

    const request = await fetch(
      `http://localhost:5050/maintenance/${maintenanceId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(modifiedMaintenance),
      }
    );

    const query = await db.query(
      `
        SELECT *
        FROM maintenances
        WHERE id = $1;
      `,
      [maintenanceId]
    );

    const response = await request.json();
    await database.deleteMaintenance(maintenanceId);

    expect(response.success).toBe(true);
    expect(query.rows.length).toBeGreaterThan(0);
    expect(query.rows[0].name).toEqual(modifiedMaintenance.name);
    expect(query.rows[0].name).not.toEqual(maintenance.name);
  });

  test("Edit a maintenance as normal user (should fail)", async () => {
    expect.assertions(4);

    const maintenanceId = await database.insertMaintenance(maintenance);
    const modifiedMaintenance = {
      ...maintenance,
      name: "testMaintenanceModified",
    };

    const request = await fetch(
      `http://localhost:5050/maintenance/${maintenanceId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(modifiedMaintenance),
      }
    );

    const query = await db.query(
      `
        SELECT *
        FROM maintenances
        WHERE id = $1;
      `,
      [maintenanceId]
    );

    const response = await request.json();
    await database.deleteMaintenance(maintenanceId);

    expect(response.success).toBe(false);
    expect(query.rows.length).toBeGreaterThan(0);
    expect(query.rows[0].name).not.toEqual(modifiedMaintenance.name);
    expect(query.rows[0].name).toEqual(maintenance.name);
  });

  test("Delete maintenance as admin", async () => {
    const maintenanceId = await database.insertMaintenance(maintenance);

    const request = await fetch(
      `http://localhost:5050/maintenance/${maintenanceId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const response = await request.json();
    const query = await db.query(
      `
        SELECT *
        FROM maintenances
        WHERE id = $1;
      `,
      [maintenanceId]
    );

    await database.deleteMaintenance(maintenanceId);

    expect(response.success).toBe(true);
    expect(query.rows.length).toBe(0);
  });

  test("Delete maintenance as normal user (should fail)", async () => {
    const maintenanceId = await database.insertMaintenance(maintenance);

    const request = await fetch(
      `http://localhost:5050/maintenance/${maintenanceId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const response = await request.json();
    const query = await db.query(
      `
        SELECT *
        FROM maintenances
        WHERE id = $1;
      `,
      [maintenanceId]
    );

    await database.deleteMaintenance(maintenanceId);

    expect(response.success).toBe(false);
    expect(query.rows.length).toBeGreaterThan(0);
  });
});
