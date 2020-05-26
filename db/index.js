const fs = require("fs");
const { Pool } = require("pg");

const database = JSON.parse(fs.readFileSync(`${__dirname}/../database.json`));

const pool = new Pool(database);

module.exports = {
	query: (text, params, callback) => pool.query(text, params, callback),
	close: () => pool.end()
};
