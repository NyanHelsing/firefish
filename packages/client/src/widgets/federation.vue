<template>
	<MkContainer
		:show-header="widgetProps.showHeader"
		:foldable="foldable"
		:scrollable="scrollable"
		class="mkw-federation"
	>
		<template #header
			><i :class="icon('ph-planet')"></i
			>{{ i18n.ts._widgets.federation }}</template
		>

		<div class="wbrkwalb">
			<MkLoading v-if="fetching" />
			<transition-group
				v-else
				tag="div"
				:name="defaultStore.state.animation ? 'chart' : ''"
				class="instances"
			>
				<div
					v-for="(instance, i) in instances"
					:key="instance.id"
					class="instance"
				>
					<img :src="getInstanceIcon(instance)" alt="" />
					<div class="body">
						<a
							class="a"
							:href="'https://' + instance.host"
							target="_blank"
							:title="instance.host"
							>{{ instance.host }}</a
						>
						<p>
							{{ instance.softwareName || "?" }}
							{{ instance.softwareVersion }}
						</p>
					</div>
				</div>
			</transition-group>
		</div>
	</MkContainer>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { Widget, WidgetComponentExpose } from "./widget";
import { useWidgetPropsManager } from "./widget";
import type { GetFormResultType } from "@/scripts/form";
import MkContainer from "@/components/MkContainer.vue";
import * as os from "@/os";
import { useInterval } from "@/scripts/use-interval";
import { i18n } from "@/i18n";
import { getProxiedImageUrlNullable } from "@/scripts/media-proxy";
import { defaultStore } from "@/store";
import icon from "@/scripts/icon";

const name = "federation";

const widgetPropsDef = {
	showHeader: {
		type: "boolean" as const,
		default: true,
	},
};

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

// 現時点ではvueの制限によりimportしたtypeをジェネリックに渡せない
// const props = defineProps<WidgetComponentProps<WidgetProps> & { foldable?: boolean; scrollable?: boolean; }>();
// const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();
const props = defineProps<{
	widget?: Widget<WidgetProps>;
	foldable?: boolean;
	scrollable?: boolean;
}>();
const emit = defineEmits<{ (ev: "updateProps", props: WidgetProps) }>();

const { widgetProps, configure } = useWidgetPropsManager(
	name,
	widgetPropsDef,
	props,
	emit,
);

const instances = ref([]);
const fetching = ref(true);

const fetch = async () => {
	const fetchedInstances = await os.api("federation/instances", {
		sort: "+lastCommunicatedAt",
		limit: 5,
	});
	instances.value = fetchedInstances;
	fetching.value = false;
};

useInterval(fetch, 1000 * 60, {
	immediate: true,
	afterMounted: true,
});

function getInstanceIcon(instance): string {
	return (
		getProxiedImageUrlNullable(instance.faviconUrl, "preview") ??
		getProxiedImageUrlNullable(instance.iconUrl, "preview") ??
		"/client-assets/dummy.png"
	);
}

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});
</script>

<style lang="scss" scoped>
.wbrkwalb {
	$bodyTitleHieght: 18px;
	$bodyInfoHieght: 16px;

	height: (62px + 1px) + (62px + 1px) + (62px + 1px) + (62px + 1px) + 62px;
	overflow: hidden;

	> .instances {
		.chart-move {
			transition: transform 1s ease;
		}

		> .instance {
			display: flex;
			align-items: center;
			padding: 14px 16px;
			border-bottom: solid 0.5px var(--divider);

			> img {
				display: block;
				width: ($bodyTitleHieght + $bodyInfoHieght);
				height: ($bodyTitleHieght + $bodyInfoHieght);
				object-fit: cover;
				border-radius: 4px;
				margin-right: 8px;
			}

			> .body {
				flex: 1;
				overflow: hidden;
				font-size: 0.9em;
				color: var(--fg);
				padding-right: 8px;

				> .a {
					display: block;
					width: 100%;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					line-height: $bodyTitleHieght;
				}

				> p {
					margin: 0;
					font-size: 75%;
					opacity: 0.7;
					line-height: $bodyInfoHieght;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}

			> .chart {
				height: 30px;
			}
		}
	}
}
</style>
