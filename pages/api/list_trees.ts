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

	if (typeof authTokenArg === "string") {
		const authTokenBuffer = Buffer.from(authTokenArg, "hex");
		const rowOffset = +(typeof req.query.rowOffset !== "string" ? 0 : req.query.rowOffset);
		const rowLimit = +(typeof req.query.rowLimit !== "string" ? 50 : req.query.rowLimit);

		// If data provided aren't valid, send a 400 Bad request response code
		if (authTokenBuffer.length !== 64 || !(rowLimit <= 50) || Number.isNaN(rowOffset)) {
			res.status(400).end("Bad request");
			return;
		}

		try {
			// Obtain userID for provided authorization token (null if it is invalid)
			const userID = await getTokenOwnerID(mysql, authTokenBuffer);

			if (userID === null) {
				// If token provided is invalid, send a 401 Unauthorized response type to the client and return
				res.status(401).end("Unauthorized");
				return;
			}

			const results = await mysql.query({
				sql: "SELECT TreeName, TreeDescription, CreatedAt FROM Trees WHERE UserID = ? ORDER BY CreatedAt DESC LIMIT ? OFFSET ?",
				timeout: 2000,
				values: [userID, rowLimit, rowOffset]
			});

			res.status(200).end(JSON.stringify(results));
		} catch (error) {
			console.error(error);
			res.status(500).end("Internal server error");
		}

	} else {
		res.status(400).end("Bad request");
	}

	// Run MySQL clean up function
	await mysql.end()
}