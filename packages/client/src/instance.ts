import type { entities } from "firefish-js";
import { computed, reactive } from "vue";
import { api } from "./os";

// TODO: 他のタブと永続化されたstateを同期

const instanceData = localStorage.getItem("instance");
// TODO: instanceをリアクティブにするかは再考の余地あり

export const instance: entities.DetailedInstanceMetadata = reactive(
	instanceData
		? JSON.parse(instanceData)
		: {
				// TODO: set default values
		  },
);

export async function fetchInstance() {
	const meta = await api("meta", {
		detail: true,
	});

	for (const [k, v] of Object.entries(meta)) {
		instance[k] = v;
	}

	localStorage.setItem("instance", JSON.stringify(instance));
}

export const emojiCategories = computed(() => {
	if (instance.emojis == null) return [];
	const categories = new Set();
	for (const emoji of instance.emojis) {
		categories.add(emoji.category);
	}
	return Array.from(categories);
});

export const emojiTags = computed(() => {
	if (instance.emojis == null) return [];
	const tags = new Set();
	for (const emoji of instance.emojis) {
		for (const tag of emoji.aliases) {
			tags.add(tag);
		}
	}
	return Array.from(tags);
});
