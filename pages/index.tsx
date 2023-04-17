import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Cookies from "js-cookie";
import mysqlInit from 'serverless-mysql';
import { useEffect, useState } from "react";

import { getTokenOwnerID, hasAuthToken } from "@/functions/authToken";
import { getTrees } from "@/functions/accessApi";
import { TreeTable } from "@/interfaces/tables";
import Layout from "@/components/layout";

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
	const [trees, setTrees] = useState<TreeTable[]>([]);
	const rowLimit = 50;
	const [rowOffset, setRowOffset] = useState(0);

	useEffect(() => {
		getTrees(Cookies.get("authToken") as string, rowLimit, rowOffset)
		.then(setTrees)
		.catch((error) => {
			alert("Unexpected error occured while trying to pbtain user's trees. Check console for more info");
			console.error(error);
		})
	}, [Cookies])

	return (
		<Layout>
			<p className="treesDescriptor">Your trees: </p>
			
			<div className="treesContainer">
				{trees.map((treeTable) => 
					<div className="treeDisplay">
						<span className="treeName">{treeTable.TreeName}</span>
						<hr/>
						<span className="treeDescription">{treeTable.TreeDescription}</span>
						<br/>
						<span className="treeDate">
							Created at {treeTable.CreatedAt.toLocaleDateString(undefined, {
								year: "numeric",
								month: "long",
								day: "numeric",
								hour12: false,
								hour: "numeric",
								minute: "numeric",
								second: "numeric"
							})}
						</span>
					</div>
				)}
			</div>

		</Layout>	
	);
}