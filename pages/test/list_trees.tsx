import { hasAuthToken } from "@/functions/authToken";
import Cookies from "js-cookie";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { FormEvent } from "react";

async function onSubmit(event: FormEvent) {
	event.preventDefault();

	const formData = (event.currentTarget as HTMLFormElement).elements;

	const response = await fetch('/api/list_trees?' + new URLSearchParams({
		authToken: (Cookies.get("authToken") as string),
		rowLimit: (formData.namedItem("limit") as HTMLInputElement).value,
		rowOffset: (formData.namedItem("offset") as HTMLInputElement).value
	}), {
		method: "POST",
	});

	const output = (document.getElementById("output") as HTMLTextAreaElement);
	output.textContent = `Status: ${response.status} ${response.statusText}\n${await response.text()}`;
}

export const getServerSideProps: GetServerSideProps<{}> = async (context: GetServerSidePropsContext) => {
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
		// Else, make the authorization token accessible to the main page
		return {
			props: {}
		}
	}
}

export default function ListTrees() {
	return (
		<div>
			<form onSubmit={onSubmit}>
				<label htmlFor="limit">Limit: </label>
				<input type="number" id="limit" name="limit"></input><br/>

				<label htmlFor="offset">Offset: </label>
				<input type="number" id="offset" name="offset"></input><br/>

				<button type="submit">Submit</button>
			</form>
			<textarea id="output" rows={10} cols={100}/>
		</div>
	)
}