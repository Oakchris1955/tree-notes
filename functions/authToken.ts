import { NextApiRequestCookies } from "next/dist/server/api-utils";
import { ServerlessMysql } from "serverless-mysql";

export function hasAuthToken(cookies: NextApiRequestCookies): boolean {
	const authToken = cookies["authToken"];
	return typeof authToken !== "undefined";
}

/** The function below will return null if the token is invalid or expires in the next minute (the later one is to prevent internal server errors) */
export function getTokenOwnerID(mysqlConnection: ServerlessMysql, authToken: Buffer): Promise<number | null> {
	return new Promise(async (resolve, reject) => {
		try {
			const results: [{UserID: number}] = await mysqlConnection.query({
				sql: "SELECT UserID FROM AuthTokens WHERE AuthToken = ? AND ExpiresAt > CURRENT_TIMESTAMP + INTERVAL '1' MINUTE",
				timeout: 2000,
				values: [authToken]
			});

			if (Array.from(results).length === 0) {
				// If the MySQL server returns an empty array, resolve with null (A.K.A. the authorization token provided is invalid)
				resolve(null)
			} else {
				// Else, resolve with the user's ID
				resolve(results[0].UserID)
			}
		} catch (error) {
			reject(error);
		}
	})
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