<template>
	<XWindow
		:initial-width="800"
		:can-resize="true"
		:front="true"
		class="thppypvi"
		@closed="emit('closed')"
	>
		<template #header>
			{{ title }}
		</template>
		<div class="zrgnubda">
			{{ description }}
		</div>
	</XWindow>
</template>

<script lang="ts" setup>
import XWindow from "@/components/MkWindow.vue";

defineProps<{
	title: string;
	description: string;
}>();

const emit = defineEmits<{
	(ev: "closed"): void;
}>();
</script>

<style lang="scss" scoped>
.thppypvi {
	max-height: 70%;
	overflow-y: scroll;
	-ms-overflow-style: none;
	scrollbar-width: none;
}

.thppypvi::-webkit-scrollbar {
	display: none;
}

.zrgnubda {
	white-space: pre-wrap;
	font-size: 1.2em;
	padding: 5px 20px 10px;
	margin: 5px;
}
</style>
