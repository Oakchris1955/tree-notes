import { NextApiRequestCookies } from "next/dist/server/api-utils";
import { ServerlessMysql } from "serverless-mysql";

export function hasAuthToken(cookies: NextApiRequestCookies): boolean {
	const authToken = cookies["authToken"];
	return typeof authToken !== "undefined";
}

export function createAuthToken(mysqlConnection: ServerlessMysql, userID: number): Promise<Buffer> {
	return new Promise(async (resolve, reject) => {
		try {
			// Create new Authorization token
			mysqlConnection.query({
				sql: "INSERT INTO AuthTokens (UserID) VALUES (?)",
				timeout: 2000,
				values: [userID]
			})
			// Then obtain it from the database
			const results: [{AuthToken: Buffer}] = await mysqlConnection.query({
				sql: "SELECT AuthToken FROM AuthTokens WHERE UserID = ? ORDER BY CreatedAt DESC LIMIT 1",
				timeout: 2000,
				values: [userID]
			});
			resolve(results[0].AuthToken);
		} catch (error) {
			reject(error);
		}
	})
}