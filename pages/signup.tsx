import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { FormEvent } from "react";
import Cookies from "js-cookie";

import { hasAuthToken } from "@/functions/authToken";

async function onSubmit(event: FormEvent) {
	event.preventDefault();

	const formData = (event.currentTarget as HTMLFormElement).elements;

	const username = (formData.namedItem("username") as HTMLInputElement).value;
	const password = (formData.namedItem("username") as HTMLInputElement).value;

	const signUpResponse = await fetch('/api/signup?' + new URLSearchParams({
		username: username,
		password: password
	}), {
		method: "POST",
	});

	if (signUpResponse.status === 200) {
		alert("Successfully created new user. Making a login attempt...");

		const loginResponse = await fetch('/api/login?' + new URLSearchParams({
			username: username,
			password: password
		}), {
			method: "POST",
		});
	
		if (loginResponse.status === 200) {
			Cookies.set("authToken", await loginResponse.text())
			alert("Login successful. Press OK to redirect to main page.");
			window.location.href = "/";
		} else {
			alert("Login attempt failed. Redirecting to login page...");
			window.location.href = "/login";
		}

	} else {
		alert("User creation failed");
	}
}

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
	// Get the cookies out of the request object
	const cookies = context.req.cookies;

	// Check if there is an authToken cookies
	if (hasAuthToken(cookies)) {
		// If not, redirect to index page
		return {
			redirect: {
				destination: '/',
				permanent: false
			}
		}
	} else {
		// Else, do nothing
		return {
			props: {}
		}
	}
}

export default function signUpPage() {
	return (
		<form onSubmit={onSubmit} className="formContainer">
			<div className="inputContainer">
				<label htmlFor="username" className="styledLabel">Username: </label>
				<input type="text" className="styledInput" id="username" name="username" autoComplete="off"/>
			</div>

			<div className="inputContainer">
				<label htmlFor="password" className="styledLabel">Password: </label>
				<input type="password" className="styledInput" id="password" name="password" autoComplete="off"/>
			</div>

			<button className="submitButton" type="submit">Signup</button>
		</form>
	)
}