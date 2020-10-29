const db = require("../../db");

module.exports = {
  deleteState: async (stateid) => {
    await db.query(
      `
      DELETE FROM states
      WHERE id = $1;
      `,
      [stateid]
    );
  },

  insertState: async (state) => {
    const query = await db.query(
      `
      INSERT INTO states (name, color)
      VALUES ($1, $2)
      RETURNING id;
      `,
      [state.name, state.color]
    );

    return query.rows[0].id;
  },

  insertMaintenance: async (maintenance) => {
    await db.query(
      `
        INSERT INTO maintenances (name, frequency, systemid, userid, start_date)
        VALUES ($1, $2, $3, $4, $5);
      `,
      [
        maintenance.name,
        maintenance.frequency,
        maintenance.systemid,
        maintenance.userid,
        maintenance.start_date,
      ]
    );

    const query = await db.query(
      `
        SELECT id
        FROM maintenances
        WHERE name = $1
              AND systemid = $2;
      `,
      [maintenance.name, maintenance.systemid]
    );

    return query.rows[0].id;
  },

  deleteMaintenance: async (maintenanceId) => {
    await db.query(
      `
        DELETE
        FROM maintenances
        WHERE id = $1;
      `,
      [maintenanceId]
    );
  },

  insertUser: async (user) => {
    await db.query(
      `
      INSERT INTO users (username, password, firstName, lastName, roleid)
      VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5); 
    `,
      [user.username, user.password, user.firstName, user.lastName, user.roleid]
    );

    const query = await db.query(
      `
        SELECT id
        FROM users
        WHERE username = $1;
      `,
      [user.username]
    );

    return query.rows[0].id;
  },

  deleteUser: async (userId) => {
    await db.query(
      `
      DELETE
      FROM users
      WHERE id = $1;
    `,
      [userId]
    );
  },

  insertCustomer: async (customer) => {
    await db.query(
      `
				INSERT
				INTO customers (name, street, city, zip, email, contactperson, phone)
				VALUES ($1, $2, $3, $4, $5, $6, $7);
			`,
      [
        customer.name,
        customer.street,
        customer.city,
        customer.zip,
        customer.email,
        customer.contactperson,
        customer.phone,
      ]
    );

    const query = await db.query(
      `
				SELECT id
				FROM customers
				WHERE name = $1;
			`,
      [customer.name]
    );

    return query.rows[0].id;
  },

  deleteCustomer: async (customerId) => {
    await db.query(
      `
				DELETE FROM customers
				WHERE id = $1;
			`,
      [customerId]
    );
  },

  getCustomer: async (customerId) => {
    const query = await db.query(
      `
				SELECT *
				FROM customers
				WHERE id = $1;
			`,
      [customerId]
    );

    return query.rows[0];
  },

  insertSystem: async (system) => {
    await db.query(
      `
				INSERT
				INTO systems (name, street, city, zip, customerid)
				VALUES ($1, $2, $3, $4, $5);
			`,
      [system.name, system.street, system.city, system.zip, system.customerid]
    );

    const query = await db.query(
      `
				SELECT id
				FROM systems
				WHERE name = $1
						  AND customerid = $2;
			`,
      [system.name, system.customerid]
    );

    return query.rows[0].id;
  },

  deleteSystem: async (systemId) => {
    await db.query(
      `
				DELETE FROM customers
				WHERE id = $1;
			`,
      [systemId]
    );
  },

  getSystem: async (systemId) => {
    const query = await db.query(
      `
				SELECT *
				FROM systems
				WHERE id = $1;
			`,
      [systemId]
    );

    return query.rows[0];
  },
};
