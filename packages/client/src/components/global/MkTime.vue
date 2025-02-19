<template>
	<time :title="absolute">
		<template v-if="invalid">{{ i18n.ts._ago.invalid }}</template>
		<template v-else-if="mode === 'relative'">{{ relative }}</template>
		<template v-else-if="mode === 'absolute'">{{ absolute }}</template>
		<template v-else-if="mode === 'detail'"
			>{{ absolute }} ({{ relative }})</template
		>
	</time>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { i18n } from "@/i18n";
import { dateTimeFormat } from "@/scripts/intl-const";

const props = withDefaults(
	defineProps<{
		time: Date | string | number | null;
		origin?: Date | null;
		mode?: "relative" | "absolute" | "detail";
	}>(),
	{
		mode: "relative",
	},
);

const _time =
	props.time == null
		? NaN
		: typeof props.time === "number"
			? props.time
			: (props.time instanceof Date
					? props.time
					: new Date(props.time)
				).getTime();
const invalid = Number.isNaN(_time);
const absolute = !invalid ? dateTimeFormat.format(_time) : i18n.ts._ago.invalid;

const now = ref((props.origin ?? new Date()).getTime());
const relative = computed<string>(() => {
	if (props.mode === "absolute") return ""; // absoluteではrelativeを使わないので計算しない
	if (invalid) return i18n.ts._ago.invalid;

	const ago = (now.value - _time) / 1000; /* ms */
	return ago >= 31536000
		? i18n.t("_ago.yearsAgo", { n: Math.floor(ago / 31536000).toString() })
		: ago >= 2592000
			? i18n.t("_ago.monthsAgo", {
					n: Math.floor(ago / 2592000).toString(),
				})
			: ago >= 604800
				? i18n.t("_ago.weeksAgo", {
						n: Math.floor(ago / 604800).toString(),
					})
				: ago >= 86400
					? i18n.t("_ago.daysAgo", {
							n: Math.floor(ago / 86400).toString(),
						})
					: ago >= 3600
						? i18n.t("_ago.hoursAgo", {
								n: Math.floor(ago / 3600).toString(),
							})
						: ago >= 60
							? i18n.t("_ago.minutesAgo", {
									n: (~~(ago / 60)).toString(),
								})
							: ago >= 10
								? i18n.t("_ago.secondsAgo", {
										n: (~~(ago % 60)).toString(),
									})
								: ago >= -1
									? i18n.ts._ago.justNow
									: i18n.ts._ago.future;
});

let tickId: number;

function tick() {
	const _now = new Date().getTime();
	const agoPrev = (now.value - _time) / 1000; /* ms */ // 現状のinterval

	now.value = _now;

	const ago = (now.value - _time) / 1000; /* ms */ // 次のinterval
	const prev = agoPrev < 60 ? 10000 : agoPrev < 3600 ? 60000 : 180000;
	const next = ago < 60 ? 10000 : ago < 3600 ? 60000 : 180000;

	if (!tickId) {
		tickId = window.setInterval(tick, next);
	} else if (prev < next) {
		window.clearInterval(tickId);
		tickId = window.setInterval(tick, next);
	}
}

if (
	!invalid &&
	!props.origin &&
	(props.mode === "relative" || props.mode === "detail")
) {
	onMounted(() => {
		tick();
	});
	onUnmounted(() => {
		if (tickId) window.clearInterval(tickId);
	});
}
</script>
