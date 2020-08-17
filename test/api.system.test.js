const db = require("../db");
const fetch = require("node-fetch");

const user = require("./objects/user");
const admin = require("./objects/admin");
const customer = require("./objects/customer");
const system = require("./objects/system");
const database = require("./functions/database");


describe("System service", () => {
  let adminToken = null;
  let userToken = null;

  beforeAll(async () => {
		const customerId = await database.insertCustomer(customer);
		system.customerid = customerId;

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
				DELETE FROM customers
				WHERE email = $1;
			`,
			[customer.email]
		);

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

	test("Add system as admin", async () => {
		expect.assertions(2);

		const request = await fetch("http://localhost:5050/system", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${adminToken}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(system)
		});

		const response = await request.json();
		
		const query = await db.query(
			`
				SELECT *
				FROM systems
				WHERE name = $1
			        AND customerid = $2;
			`,
			[system.name, system.customerid]
		);
		
		if (query.rows.length > 0) {
			await db.query(
				`
					DELETE FROM systems
					WHERE name = $1
				        AND customerid = $2
				`,
				[system.name, system.customerid]
			);
		}

		expect(response.success).toBe(true);
		expect(query.rows.length).toBeGreaterThan(0);
	});

	test("Add system as normal user", async () => {
		expect.assertions(2);

		const request = await fetch("http://localhost:5050/system", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${userToken}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(system)
		});

		const response = await request.json();
		
		const query = await db.query(
			`
				SELECT *
				FROM systems
				WHERE name = $1
			        AND customerid = $2;
			`,
			[system.name, system.customerid]
		);
		
		if (query.rows.length > 0) {
			await db.query(
				`
					DELETE FROM systems
					WHERE name = $1
				        AND customerid = $2
				`,
				[system.name, system.customerid]
			);
		}

		expect(response.success).toBe(false);
		expect(query.rows.length).toBe(0);
	});

	test("Update system as admin", async () => {
		expect.assertions(2);

		const systemId = await database.insertSystem(system);

		const updatedSystem = { ...system };
		updatedSystem.name = "updatedTestSystem";

		const request = await fetch(`http://localhost:5050/system/${systemId}`, {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${adminToken}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(updatedSystem)
		});

		const response = await request.json();

		const systemInDb = await database.getSystem(systemId);
		await database.deleteSystem(systemId);

		expect(response.success).toBe(true);
		expect(systemInDb.name).toBe(updatedSystem.name);
	});

	test("Update system as normal user", async () => {
		expect.assertions(2);

		const systemId = await database.insertSystem(system);

		const updatedSystem = { ...system };
		updatedSystem.name = "updatedTestSystem";

		const request = await fetch(`http://localhost:5050/system/${systemId}`, {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${userToken}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(updatedSystem)
		});

		const response = await request.json();

		const systemInDb = await database.getSystem(systemId);
		await database.deleteSystem(systemId);

		expect(response.success).toBe(false);
		expect(systemInDb.name).toBe(system.name);
	});

});
