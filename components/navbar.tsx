import Cookies from "js-cookie";
import { useEffect, useState } from "react";

enum authTokenEnum {
	True,
	False,
	Unknown
}

function renderAuthComponets(hasAuthToken: authTokenEnum): JSX.Element {
	switch (hasAuthToken) {
		case authTokenEnum.True:
			return (
				<a href="#" onClick={() => {Cookies.remove("authToken");location.reload()}}>Logout</a>
			);
		case authTokenEnum.False:
			return (
				<>
					<a href="/login">Login</a>
					<a href="/signup">Signup</a>
				</>
			);
		default:
			return (
				<></>
			)
	}
}

export default function NavigationBar() {
	const [hasAuthToken, setHasAuthToken] = useState(authTokenEnum.Unknown);

	useEffect(() => {
		setHasAuthToken(typeof Cookies.get("authToken") === "string" ? authTokenEnum.True : authTokenEnum.False)
	}, [Cookies])

	return (
		<div className="navBar">
			<div>
				<a href="/">Main Page</a>
			</div>
			<div style={{marginLeft: "auto"}}>
				{renderAuthComponets(hasAuthToken)}
				
			</div>
			<hr/>
		</div>
	)
}