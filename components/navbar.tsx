import Cookies from "js-cookie";

export default function NavigationBar() {
	return (
		<div className="navBar">
			<div>
				<a href="/">Main Page</a>
			</div>
			<div style={{marginLeft: "auto"}}>
				<a href="#" onClick={() => {Cookies.remove("authToken");location.reload()}}>Logout</a>
			</div>
			<hr/>
		</div>
	)
}