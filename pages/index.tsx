import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Cookies from "js-cookie";

import { hasAuthToken } from "@/functions/authToken";

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

export const getServerSideProps: GetServerSideProps<{ authToken: string }> = async (context: GetServerSidePropsContext) => {
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
		// Else, make the authorization token accesible to the main page
		return {
			props: {
				authToken: cookies["authToken"] as string
			}
		}
	}
}

export default function IndexPage(authToken: string) {
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