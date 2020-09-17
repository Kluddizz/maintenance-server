const db = require("../db");
const fetch = require("node-fetch");

const admin = require("./objects/admin");
const user = require("./objects/user");
const customer = require("./objects/customer"):
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
  });

  afterAll(async () => {
    await database.deleteUser(admin.id);
    await database.deleteUser(user.id);
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

  test("Get a maintenance entry", async () => {
    // Insert a maintenance manually.
    const maintenanceId = await database.insertMaintenance(maintenance);
    
    const request = await fetch("http://localhost:5050/maintenance/${maintenanceId}")

    // Delete the maintenance.
    await database.deleteMaintenance(maintenanceId);
  });

  test("Get all maintenances of an user", async () => {

  });

  test("Get all maintenances as admin", async () => {

  });

  test("Create a new maintenance as admin", async () => {

  });

  test("Edit a mainenance as admin", async () => {

  });

  test("Delete maintenance as admin", async () => {

  });

});
