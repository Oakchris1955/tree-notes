import type { NextApiRequest, NextApiResponse } from 'next';
import mysqlInit from 'serverless-mysql';
import { pbkdf2Sync, randomBytes } from 'crypto';

const mysql = mysqlInit({
	library: require('mysql2')
})

mysql.config({
	database: "TreeDB",
	user: "TreeDBAdmin",
	password: "TreeDBPass"
})

export default async function handler(req: NextApiRequest, res: NextApiResponse<boolean>) {
	const username = req.query.username;
	const password = req.query.password;

	if (typeof username === "string" && typeof password === "string") {
		// Generate random salt and hash for the password
		const salt = randomBytes(128);
		const hashedPassword = pbkdf2Sync(password, salt, 10000, 255, 'sha512');

		// Log into MySQL database
		try {
			await mysql.query({
				sql: 'INSERT INTO Users (Username, Salt, HashedPass) VALUES (?, ?, ?)',
				timeout: 2000,
				values: [username, salt, hashedPassword]
			});
			// If query successful, respond with a 200 HTTP OK status code...
			res.status(200).end("OK");
		} catch (error) {
			// ...else, send a 500 Internal Server Error status code
			console.error(error);
			res.status(500).end("Internal server error");
		}
	} else {
		res.status(400).end("Bad request");
	}

	// Run MySQL clean up function
	await mysql.end()
}