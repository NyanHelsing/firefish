<template>
	<div class="mk-google" @click.stop>
		<input v-model="query" type="search" :placeholder="q" />
		<button @click="search">
			<i :class="icon('ph-magnifying-glass')"></i>
			{{ i18n.ts.searchByGoogle }}
		</button>
	</div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { i18n } from "@/i18n";
import { useRouter } from "@/router";
import icon from "@/scripts/icon";
import { defaultStore } from "@/store";

const router = useRouter();

const props = defineProps<{
	q: string;
}>();

const query = ref(props.q);

const search = () => {
	if (defaultStore.state.searchURL === "")
		router.push(`/search?q=${query.value}`);
	else window.open(`${defaultStore.state.searchURL}${query.value}`, "_blank");
};
</script>

<style lang="scss" scoped>
.mk-google {
	display: flex;
	margin: 8px 0;

	> input {
		flex-shrink: 1;
		padding: 10px;
		width: 100%;
		height: 40px;
		font-size: 16px;
		border: solid 1px var(--divider);
		border-radius: 4px 0 0 4px;
		-webkit-appearance: none;
		-webkit-border-radius: 4px 0 0 4px;
	}

	> button {
		flex-shrink: 0;
		margin: 0;
		padding: 0 16px;
		border: solid 1px var(--divider);
		border-left: none;
		border-radius: 0 4px 4px 0;

		&:active {
			box-shadow: 0 2px 4px rgba(#000, 0.15) inset;
		}
	}
}
</style>
