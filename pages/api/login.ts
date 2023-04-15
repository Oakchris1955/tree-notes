import { createAuthToken } from '@/functions/authToken';
import { pbkdf2Sync } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next'

import mysqlInit from 'serverless-mysql';

const mysql = mysqlInit({
	library: require('mysql2')
})

mysql.config({
	database: "TreeDB",
	user: "TreeDBAdmin",
	password: "TreeDBPass"
})

interface UserData {
	UserID: number
	Salt: Buffer,
	HashedPass: Buffer
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<boolean>) {
	const username = req.query.username;
	const password = req.query.password;

	if (typeof username === "string" && typeof password === "string") {
		// Try and obtain user's data from database
		try {
			const results: UserData[] = await mysql.query({
				sql: "SELECT UserID, Salt, HashedPass FROM Users WHERE Username = ?",
				timeout: 2000,
				values: [username]
			})

			if (Array.from(results).length === 0) {
				res.status(404).end("User not found");
			}

			// If query successful, calculate the hash of the password and the salt
			const hashedPassword = pbkdf2Sync(password, results[0].Salt, 10000, 255, 'sha512');

			// Check if the two hashes match (A.K.A. the password supplied by the user is right)
			if (hashedPassword.equals(results[0].HashedPass)) {
				// If yes, attempt a new authorization token and send it to the user
				try {
					const authToken = await createAuthToken(mysql, results[0].UserID);
					res.status(200).end(authToken.toString('hex'));
				} catch (error) {
					console.error(error);
					res.status(500).end("Internal server error");
				}
			} else {
				// Else, tell the client that the credentials they provided don't match
				res.status(401).end("Unauthorized");
			}
		} catch (error) {
			// If MySQL query raised an error, send a 500 Internal Server Error status code
			console.error(error);
			res.status(500).end("Internal server error");
		}
	} else {
		res.status(400).end("Bad request");
	}

	// Run MySQL clean up function
	await mysql.end()
}