import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { FormEvent } from "react";

import { hasAuthToken } from "@/functions/authToken";

async function onSubmit(event: FormEvent) {
	event.preventDefault();

	const formData = (event.currentTarget as HTMLFormElement).elements;

	const response = await fetch('/api/signup?' + new URLSearchParams({
		username: (formData.namedItem("username") as HTMLInputElement).value,
		password: (formData.namedItem("password") as HTMLInputElement).value
	}), {
		method: "POST",
	});

	if (response.status === 200) {
		alert("Successfully created new user");
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
		<form onSubmit={onSubmit}>
			<label htmlFor="username">Username: </label>
			<input type="text" id="username" name="username"/><br/>

			<label htmlFor="password">Password: </label>
			<input type="password" id="password" name="password"/><br/>

			<button type="submit">Signup</button>
		</form>
	)
}