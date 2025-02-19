<template>
	<div v-if="note" class="reacted-users">
		<div :class="$style.tabs">
			<button
				v-for="reaction in reactions"
				:key="reaction"
				:class="[$style.tab, { [$style.tabActive]: tab === reaction }]"
				class="_button"
				@click="tab = reaction"
			>
				<MkReactionIcon
					ref="reactionRef"
					:reaction="
						reaction
							? reaction.replace(/^:(\w+):$/, ':$1@.:')
							: reaction
					"
					:custom-emojis="note.emojis"
					style="max-width: 100%"
				/>
				<span style="margin-left: 4px">{{
					note.reactions[reaction]
				}}</span>
			</button>
		</div>
		<MkUserCardMini v-for="user in users" :key="user.id" :user="user" />
	</div>
	<div v-else>
		<MkLoading />
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import type { entities } from "firefish-js";
import MkReactionIcon from "@/components/MkReactionIcon.vue";
import MkUserCardMini from "@/components/MkUserCardMini.vue";
import * as os from "@/os";

const props = defineProps<{
	noteId: entities.Note["id"];
}>();

const note = ref<entities.Note>();
const tab = ref<string | null>(null);
const reactions = ref<string[]>();
const users = ref();

async function updateUsers(): void {
	const res = await os.api("notes/reactions", {
		noteId: props.noteId,
		type: tab.value,
		limit: 30,
	});

	users.value = res.map((x) => x.user);
}

watch(tab, updateUsers);

onMounted(() => {
	os.api("notes/show", {
		noteId: props.noteId,
	}).then(async (res) => {
		reactions.value = Object.keys(res.reactions);
		note.value = res;
		await updateUsers();
	});
});
</script>

<style lang="scss" module>
.tabs {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

.tab {
	padding: 4px 6px;
	border: solid 1px var(--divider);
	border-radius: 6px;
	max-width: 50%;
}

.tabActive {
	border-color: var(--accent);
}
</style>
