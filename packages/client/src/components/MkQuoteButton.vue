<template>
	<button
		v-if="canRenote && defaultStore.state.seperateRenoteQuote"
		v-tooltip.noDelay.bottom="i18n.ts.quote"
		class="eddddedb _button"
		@click.stop="quote()"
	>
		<i :class="icon('ph-quotes')"></i>
	</button>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { entities } from "firefish-js";
import { pleaseLogin } from "@/scripts/please-login";
import * as os from "@/os";
import { me } from "@/me";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import icon from "@/scripts/icon";

const props = defineProps<{
	note: entities.Note;
}>();

const canRenote = computed(
	() =>
		["public", "home"].includes(props.note.visibility) ||
		props.note.userId === me?.id,
);

function quote(): void {
	pleaseLogin();
	os.post({
		renote: props.note,
	});
}
</script>

<style lang="scss" scoped>
.eddddedb {
	display: inline-block;
	height: 32px;
	margin: 2px;
	padding: 0 6px;
	border-radius: 4px;

	&.renoted {
		background: var(--accent);
	}

	> .count {
		display: inline;
		margin-left: 8px;
		opacity: 0.7;
	}
}
</style>
