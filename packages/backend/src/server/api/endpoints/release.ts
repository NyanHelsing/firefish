import define from "@/server/api/define.js";

export const meta = {
	tags: ["meta"],
	description: "Get release notes from Codeberg",

	requireCredential: false,
	requireCredentialPrivateMode: false,
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async () => {
	let release;

	await fetch(
		"https://firefish.dev/firefish/firefish/-/raw/develop/release.json",
	)
		.then((response) => response.json())
		.then((data) => {
			release = data;
		});
	return release;
});
