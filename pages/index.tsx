import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Cookies from "js-cookie";
import mysqlInit from 'serverless-mysql';

import { getTokenOwnerID, hasAuthToken } from "@/functions/authToken";

function revealToken() {
	const button = (document.getElementById("revealButton") as HTMLButtonElement);
	const label = (document.getElementById("tokenLabel") as HTMLLabelElement);

	button.remove();
	label.innerText = (Cookies.get("authToken") as string);
	label.style.visibility = "visible";
}

function logOut() {
	Cookies.remove("authToken");
	location.reload();
}

export const getServerSideProps: GetServerSideProps<{}> = async (context: GetServerSidePropsContext) => {
	
	const mysql = mysqlInit({
		library: require('mysql2')
	})
	
	mysql.config({
		database: "TreeDB",
		user: "TreeDBAdmin",
		password: "TreeDBPass"
	})

	// Get the cookies out of the request object
	const cookies = context.req.cookies;

	// Check if there is an authToken cookies
	if (!hasAuthToken(cookies)) {
		// If not, redirect to login page
		return {
			redirect: {
				destination: '/login',
				permanent: false
			}
		}
	} else {
		// Else, check if the authorization token is valid by obtaining the ID of the user it belongs to
		const userID = await getTokenOwnerID(mysql, Buffer.from(cookies["authToken"] as string, "hex"));

		if (userID === null) {
			// If no userID is null, that means that the corresponding userID is invalid

			// Delete the authToken cookie
			context.res.setHeader('Set-Cookie', 'authToken=; Max-Age=0; Path=/');

			// Redirect to login page
			return {
				redirect: {
					destination: '/login',
					permanent: false
				}
			}
		}

		// Run MySQL clean up function
		await mysql.end()

		// Return empty props
		return {
			props: {}
		}
	}
}

export default function IndexPage() {
	return (
		<div>
			<p>Welcome to the main page. This is currently just a placeholder</p>
			<p>Your authorization token is :
				<button id="revealButton" onClick={revealToken}>Click to reveal</button>
				<label id="tokenLabel" style={{visibility: "hidden"}}/>
			</p>
			<p>
				Click <button onClick={logOut}>here</button> to log out
			</p>
		</div>	
	);
}