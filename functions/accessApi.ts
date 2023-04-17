import { RawTreeTable, TreeTable } from "@/interfaces/tables";

export function getTrees(authToken: string, rowLimit: number | string, rowOffset: number | string): Promise<TreeTable[]> {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await fetch('/api/list_trees?' + new URLSearchParams({
				authToken: authToken,
				rowLimit: rowLimit.toString(),
				rowOffset: rowOffset.toString()
			}), {
				method: "POST",
			});

			if (response.status === 200) {
				const responseText = await response.text();
				const rawTrees: RawTreeTable[] = JSON.parse(responseText);
				const Trees: TreeTable[] = rawTrees.map(rawTree => ({ ...rawTree, CreatedAt: new Date(rawTree.CreatedAt) }));
				resolve(Trees);
			} else {
				reject(`HTTP error: ${response.status} - ${response.statusText}`)
			}
		} catch (error) {
			reject(`Fetch API error: ${error}`)
		}
	})
}

export function createTrees(authToken: string, treeName: string, treeDescription: string): Promise<[]> {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await fetch('/api/list_trees?' + new URLSearchParams({
				authToken: authToken,
				treeName: treeName,
				treeDescription: treeDescription
			}), {
				method: "POST",
			});

			if (response.status === 200) {
				resolve([])
			} else {
				reject(`HTTP error: ${response.status} - ${response.statusText}`)
			}
		} catch (error) {
			reject(`Fetch API error: ${error}`)
		}
	})
}