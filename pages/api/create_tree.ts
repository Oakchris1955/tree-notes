import { getTokenOwnerID } from '@/functions/authToken';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse<boolean>) {
	const authTokenArg = req.query.authToken;
	const treeName = req.query.treeName;
	const treeDescription = req.query.treeDescription;

	if (typeof authTokenArg === "string" && typeof treeName === "string" && typeof treeDescription === "string") {
		const authTokenBuffer = Buffer.from(authTokenArg, "hex");

		// If authorization token provided isn't 64 bytes in length, send a 400 Bad request response code
		if (authTokenBuffer.length !== 64) {
			res.status(400).end("Bad request");
			return;
		}

		try {
			const userID = await getTokenOwnerID(mysql, authTokenBuffer);

			if (userID === null) {
				// If token provided is invalid, send a 401 Unauthorized response type to the client and return
				res.status(401).end("Unauthorized");
				return;
			}

			await mysql.query({
				sql: "INSERT INTO Tables (UserID, TreeName, TreeDescription) VALUES (?, ?, ?)",
				timeout: 2000,
				values: [userID, treeName, treeDescription]
			})

			// If MySQL query is successfull, respond with a 200 OK HTTP request code
			res.status(200).end("OK")
		} catch (error) {
			console.error(error);
			res.status(500).end("Internal server error");
		}
	} else {
		res.status(400).end("Bad request")
	}

	// Run MySQL clean up function
	await mysql.end()
}