<template>
	<MkPagination ref="pagingComponent" :pagination="pagination">
		<template #empty>
			<div class="_fullinfo">
				<img
					src="/static-assets/badges/info.webp"
					class="_ghost"
					alt="Info"
				/>
				<div>{{ i18n.ts.noNotifications }}</div>
			</div>
		</template>

		<template #default="{ items: notifications }">
			<XList
				v-slot="{ item: notification }"
				class="elsfgstc"
				:items="notifications"
				:no-gap="true"
			>
				<XNote
					v-if="
						['reply', 'quote', 'mention'].includes(
							notification.type,
						)
					"
					:key="notification.id"
					:note="notification.note"
					:collapsed-reply="
						notification.type === 'reply' ||
						(notification.type === 'mention' &&
							notification.note.replyId != null)
					"
				/>
				<XNotification
					v-else
					:key="notification.id"
					:notification="notification"
					:with-time="true"
					:full="true"
					class="_panel notification"
				/>
			</XList>
		</template>
	</MkPagination>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { notificationTypes } from "firefish-js";
import type { Paging } from "@/components/MkPagination.vue";
import MkPagination from "@/components/MkPagination.vue";
import XNotification from "@/components/MkNotification.vue";
import XList from "@/components/MkDateSeparatedList.vue";
import XNote from "@/components/MkNote.vue";
import { useStream } from "@/stream";
import { me } from "@/me";
import { i18n } from "@/i18n";

const props = defineProps<{
	includeTypes?: (typeof notificationTypes)[number][];
	unreadOnly?: boolean;
}>();

const stream = useStream();

const pagingComponent = ref<InstanceType<typeof MkPagination>>();

const pagination: Paging = {
	endpoint: "i/notifications" as const,
	limit: 10,
	params: computed(() => ({
		includeTypes: props.includeTypes ?? undefined,
		excludeTypes: props.includeTypes
			? undefined
			: me.mutingNotificationTypes,
		unreadOnly: props.unreadOnly,
	})),
};

const onNotification = (notification) => {
	const isMuted = props.includeTypes
		? !props.includeTypes.includes(notification.type)
		: me.mutingNotificationTypes.includes(notification.type);
	if (isMuted || document.visibilityState === "visible") {
		stream.send("readNotification", {
			id: notification.id,
		});
	}

	if (!isMuted) {
		pagingComponent.value?.prepend({
			...notification,
			isRead: document.visibilityState === "visible",
		});
	}
};

let connection;

onMounted(() => {
	connection = stream.useChannel("main");
	connection.on("notification", onNotification);
	connection.on("readAllNotifications", () => {
		if (pagingComponent.value) {
			for (const item of pagingComponent.value.queue) {
				item.isRead = true;
			}
			for (const item of pagingComponent.value.items) {
				item.isRead = true;
			}
		}
	});
	connection.on("readNotifications", (notificationIds) => {
		if (pagingComponent.value) {
			for (let i = 0; i < pagingComponent.value.queue.length; i++) {
				if (
					notificationIds.includes(pagingComponent.value.queue[i].id)
				) {
					pagingComponent.value.queue[i].isRead = true;
				}
			}
			for (
				let i = 0;
				i < (pagingComponent.value.items || []).length;
				i++
			) {
				if (
					notificationIds.includes(pagingComponent.value.items[i].id)
				) {
					pagingComponent.value.items[i].isRead = true;
				}
			}
		}
	});
});

onUnmounted(() => {
	if (connection) connection.dispose();
});
</script>

<style lang="scss" scoped>
.elsfgstc {
	background: var(--panel);
	border-radius: var(--radius);
}
</style>
