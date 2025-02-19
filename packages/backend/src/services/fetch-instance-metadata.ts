import { URL } from "node:url";
import { Window } from "happy-dom";
import fetch from "node-fetch";
import tinycolor from "tinycolor2";
import { getJson, getAgentByUrl } from "@/misc/fetch.js";
import type { Instance } from "@/models/entities/instance.js";
import { Instances } from "@/models/index.js";
import { getFetchInstanceMetadataLock } from "@/misc/app-lock.js";
import Logger from "@/services/logger.js";
import { inspect } from "node:util";

const logger = new Logger("metadata", "cyan");

export async function fetchInstanceMetadata(
	instance: Instance,
	force = false,
): Promise<void> {
	const lock = await getFetchInstanceMetadataLock(instance.host);

	if (!force) {
		const _instance = await Instances.findOneBy({ host: instance.host });
		const now = Date.now();
		if (
			_instance?.infoUpdatedAt &&
			now - _instance.infoUpdatedAt.getTime() < 1000 * 60 * 60 * 24
		) {
			await lock.release();
			return;
		}
	}

	logger.info(`Fetching metadata of ${instance.host} ...`);

	try {
		const [info, dom, manifest] = await Promise.all([
			fetchNodeinfo(instance).catch(() => null),
			fetchDom(instance).catch(() => null),
			fetchManifest(instance).catch(() => null),
		]);

		const [favicon, icon, themeColor, name, description] = await Promise.all([
			fetchFaviconUrl(instance, dom).catch(() => null),
			fetchIconUrl(instance, dom, manifest).catch(() => null),
			getThemeColor(info, dom, manifest).catch(() => null),
			getSiteName(info, dom, manifest).catch(() => null),
			getDescription(info, dom, manifest).catch(() => null),
		]);

		logger.succ(`Successfuly fetched metadata of ${instance.host}`);

		const updates = {
			infoUpdatedAt: new Date(),
		} as Record<string, any>;

		if (info) {
			updates.softwareName = info.software?.name?.toLowerCase() || null;
			updates.softwareVersion = info.software?.version;
			updates.openRegistrations = info.openRegistrations;
			updates.maintainerName = info.metadata
				? info.metadata.maintainer
					? info.metadata.maintainer.name || null
					: null
				: null;
			updates.maintainerEmail = info.metadata
				? info.metadata.maintainer
					? info.metadata.maintainer.email || null
					: null
				: null;
		}

		if (name) updates.name = name;
		if (description) updates.description = description;
		if (icon || favicon) updates.iconUrl = icon || favicon;
		if (favicon) updates.faviconUrl = favicon;
		if (themeColor) updates.themeColor = themeColor;

		await Instances.update(instance.id, updates);

		logger.succ(`Successfuly updated metadata of ${instance.host}`);
	} catch (e) {
		logger.error(
			`Failed to update metadata of ${instance.host}:\n${inspect(e)}`,
		);
	} finally {
		await lock.release();
	}
}

type NodeInfo = {
	openRegistrations?: boolean;
	software?: {
		name?: string;
		version?: string;
	};
	metadata?: {
		name?: string;
		nodeName?: string;
		nodeDescription?: string;
		description?: string;
		maintainer?: {
			name?: string;
			email?: string;
		};
	};
};

async function fetchNodeinfo(instance: Instance): Promise<NodeInfo> {
	logger.info(`Fetching nodeinfo of ${instance.host} ...`);

	try {
		const wellknown = (await getJson(
			`https://${instance.host}/.well-known/nodeinfo`,
		).catch((e) => {
			if (e.statusCode === 404) {
				throw new Error("No nodeinfo provided");
			} else {
				throw new Error(inspect(e));
			}
		})) as Record<string, unknown>;

		if (wellknown.links == null || !Array.isArray(wellknown.links)) {
			throw new Error("No wellknown links");
		}

		const links = wellknown.links as any[];

		const lnik1_0 = links.find(
			(link) => link.rel === "http://nodeinfo.diaspora.software/ns/schema/1.0",
		);
		const lnik2_0 = links.find(
			(link) => link.rel === "http://nodeinfo.diaspora.software/ns/schema/2.0",
		);
		const lnik2_1 = links.find(
			(link) => link.rel === "http://nodeinfo.diaspora.software/ns/schema/2.1",
		);
		const link = lnik2_1 || lnik2_0 || lnik1_0;

		if (link == null) {
			throw new Error("No nodeinfo link provided");
		}

		const info = await getJson(link.href).catch((e) => {
			throw new Error(inspect(e));
		});

		logger.succ(`Successfuly fetched nodeinfo of ${instance.host}`);

		return info as NodeInfo;
	} catch (e) {
		logger.error(
			`Failed to fetch nodeinfo of ${instance.host}:\n${inspect(e)}`,
		);

		throw e;
	}
}

async function fetchDom(instance: Instance): Promise<Window["document"]> {
	logger.info(`Fetching HTML of ${instance.host} ...`);

	const window = new Window({
		url: `https://${instance.host}`,
	});
	const doc = window.document;

	return doc;
}

async function fetchManifest(
	instance: Instance,
): Promise<Record<string, unknown> | null> {
	const url = `https://${instance.host}`;

	const manifestUrl = `${url}/manifest.json`;

	const manifest = (await getJson(manifestUrl)) as Record<string, unknown>;

	return manifest;
}

async function fetchFaviconUrl(
	instance: Instance,
	doc: Window["document"] | null,
): Promise<string | null> {
	const url = `https://${instance.host}`;

	if (doc) {
		// https://github.com/misskey-dev/misskey/pull/8220#issuecomment-1025104043
		const href = Array.from(doc.getElementsByTagName("link"))
			.reverse()
			.find((link) => link.relList.contains("icon"))?.href;

		if (href) {
			return new URL(href, url).href;
		}
	}

	const faviconUrl = `${url}/favicon.ico`;

	const favicon = await fetch(faviconUrl, {
		// TODO
		//timeout: 10000,
		agent: getAgentByUrl,
	});

	if (favicon.ok) {
		return faviconUrl;
	}

	return null;
}

async function fetchIconUrl(
	instance: Instance,
	doc: Window["document"] | null,
	manifest: Record<string, any> | null,
): Promise<string | null> {
	if (manifest?.icons && manifest.icons.length > 0 && manifest.icons[0].src) {
		const url = `https://${instance.host}`;
		return new URL(manifest.icons[0].src, url).href;
	}

	if (doc) {
		const url = `https://${instance.host}`;

		// https://github.com/misskey-dev/misskey/pull/8220#issuecomment-1025104043
		const links = Array.from(doc.getElementsByTagName("link")).reverse();
		// https://github.com/misskey-dev/misskey/pull/8220/files/0ec4eba22a914e31b86874f12448f88b3e58dd5a#r796487559
		const href = [
			links.find((link) =>
				link.relList.contains("apple-touch-icon-precomposed"),
			)?.href,
			links.find((link) => link.relList.contains("apple-touch-icon"))?.href,
			links.find((link) => link.relList.contains("icon"))?.href,
		].find((href) => href);

		if (href) {
			return new URL(href, url).href;
		}
	}

	return null;
}

async function getThemeColor(
	info: NodeInfo | null,
	doc: Window["document"] | null,
	manifest: Record<string, any> | null,
): Promise<string | null> {
	const themeColor =
		info?.metadata?.themeColor ||
		doc?.querySelector('meta[name="theme-color"]')?.getAttribute("content") ||
		manifest?.theme_color;

	if (themeColor) {
		const color = new tinycolor(themeColor);
		if (color.isValid()) return color.toHexString();
	}

	return null;
}

async function getSiteName(
	info: NodeInfo | null,
	doc: Window["document"] | null,
	manifest: Record<string, any> | null,
): Promise<string | undefined | null> {
	if (info?.metadata) {
		if (info.metadata.nodeName || info.metadata.name) {
			return info.metadata.nodeName || info.metadata.name;
		}
	}

	if (doc) {
		const og = doc
			.querySelector('meta[property="og:title"]')
			?.getAttribute("content");

		if (og) {
			return og;
		}
	}

	if (manifest) {
		return manifest.name || manifest.short_name;
	}

	return null;
}

async function getDescription(
	info: NodeInfo | null,
	doc: Window["document"] | null,
	manifest: Record<string, any> | null,
): Promise<string | null> {
	if (info?.metadata) {
		if (info.metadata.nodeDescription || info.metadata.description) {
			return info.metadata.nodeDescription || info.metadata.description;
		}
	}

	if (doc) {
		const meta = doc
			.querySelector('meta[name="description"]')
			?.getAttribute("content");
		if (meta) {
			return meta;
		}

		const og = doc
			.querySelector('meta[property="og:description"]')
			?.getAttribute("content");
		if (og) {
			return og;
		}
	}

	if (manifest) {
		return manifest.name || manifest.short_name;
	}

	return null;
}
