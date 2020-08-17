const db = require("../../db");

module.exports = {

	insertCustomer: async (customer) => {
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
			`
			,
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
	}
}
