<template>
	<div
		class="dkgtipfy"
		:class="{ wallpaper, isMobile, centered: ui === 'classic' }"
	>
		<XSidebar v-if="!isMobile" />

		<MkStickyContainer class="contents">
			<template #header
				><XStatusBars :class="$style.statusbars"
			/></template>
			<main
				id="maincontent"
				style="min-width: 0"
				:style="{ background: pageMetadata?.value?.bg }"
				@contextmenu.stop="onContextmenu"
			>
				<RouterView />
			</main>
		</MkStickyContainer>

		<div v-if="isDesktop" ref="widgetsEl" class="widgets-container">
			<XWidgets @mounted="attachSticky" />
		</div>

		<button
			v-if="!isDesktop && !isMobile"
			v-vibrate="5"
			class="widgetButton _button"
			@click="widgetsShowing = true"
		>
			<i :class="icon('ph-stack')"></i>
		</button>

		<div v-if="isMobile" class="buttons">
			<button
				v-vibrate="5"
				:aria-label="i18n.t('menu')"
				class="button nav _button"
				@click="drawerMenuShowing = true"
			>
				<div class="button-wrapper">
					<i :class="icon('ph-list')"></i
					><span
						v-if="menuIndicated"
						class="indicator"
						:class="{
							animateIndicator: defaultStore.state.animation,
						}"
						><i class="ph-circle ph-fill"></i
					></span>
				</div>
			</button>
			<button
				v-vibrate="5"
				:aria-label="i18n.t('home')"
				class="button home _button"
				@click="
					mainRouter.currentRoute.value.name === 'index'
						? top()
						: mainRouter.push('/');
					updateButtonState();
				"
			>
				<div
					class="button-wrapper"
					:class="buttonAnimIndex === 0 ? 'on' : ''"
				>
					<i :class="icon('ph-house')"></i>
				</div>
			</button>
			<button
				v-vibrate="5"
				:aria-label="i18n.t('notifications')"
				class="button notifications _button"
				@click="
					mainRouter.push('/my/notifications');
					updateButtonState();
				"
			>
				<div
					v-vibrate="5"
					class="button-wrapper"
					:class="buttonAnimIndex === 1 ? 'on' : ''"
				>
					<i :class="icon('ph-bell')"></i
					><span
						v-if="me?.hasUnreadNotification"
						class="indicator"
						:class="{
							animateIndicator: defaultStore.state.animation,
						}"
						><i class="ph-circle ph-fill"></i
					></span>
				</div>
			</button>
			<button
				v-if="replaceChatButtonWithAccountButton"
				:aria-label="i18n.t('accounts')"
				class="button messaging _button"
				@click="openAccountMenu"
			>
				<div class="button-wrapper">
					<i class="ph-users ph-bold ph-lg"></i>
				</div>
			</button>
			<button
				v-else
				v-vibrate="5"
				:aria-label="i18n.t('messaging')"
				class="button messaging _button"
				@click="
					mainRouter.push('/my/messaging');
					updateButtonState();
				"
			>
				<div
					class="button-wrapper"
					:class="buttonAnimIndex === 2 ? 'on' : ''"
				>
					<i :class="icon('ph-chats-teardrop')"></i
					><span
						v-if="me?.hasUnreadMessagingMessage"
						class="indicator"
						:class="{
							animateIndicator: defaultStore.state.animation,
						}"
						><i class="ph-circle ph-fill"></i
					></span>
				</div>
			</button>
			<button
				v-if="replaceWidgetsButtonWithReloadButton"
				:aria-label="i18n.ts.reload"
				class="button widget _button"
				@click="reload"
			>
				<div class="button-wrapper">
					<i class="ph-arrows-clockwise ph-bold ph-lg"></i>
				</div>
			</button>
			<button
				v-else
				v-vibrate="5"
				:aria-label="i18n.t('_deck._columns.widgets')"
				class="button widget _button"
				@click="widgetsShowing = true"
			>
				<div class="button-wrapper">
					<i :class="icon('ph-stack')"></i>
				</div>
			</button>
		</div>

		<button
			v-if="isMobile && mainRouter.currentRoute.value.name === 'index'"
			ref="postButton"
			v-vibrate="5"
			:aria-label="i18n.t('note')"
			class="postButton button post _button"
			@click="os.post()"
		>
			<i :class="icon('ph-pencil')"></i>
		</button>
		<button
			v-if="
				isMobile && mainRouter.currentRoute.value.name === 'messaging'
			"
			ref="postButton"
			class="postButton button post _button"
			:aria-label="i18n.t('startMessaging')"
			@click="messagingStart"
		>
			<i :class="icon('ph-user-plus')"></i>
		</button>

		<transition
			:name="defaultStore.state.animation ? 'menuDrawer-back' : ''"
		>
			<div
				v-if="drawerMenuShowing"
				class="menuDrawer-back _modalBg"
				@click="drawerMenuShowing = false"
				@touchstart.passive="drawerMenuShowing = false"
			></div>
		</transition>

		<transition :name="defaultStore.state.animation ? 'menuDrawer' : ''">
			<XDrawerMenu v-if="drawerMenuShowing" class="menuDrawer" />
		</transition>

		<transition
			:name="defaultStore.state.animation ? 'widgetsDrawer-back' : ''"
		>
			<div
				v-if="widgetsShowing"
				class="widgetsDrawer-back _modalBg"
				@click="widgetsShowing = false"
				@touchstart.passive="widgetsShowing = false"
			></div>
		</transition>

		<transition :name="defaultStore.state.animation ? 'widgetsDrawer' : ''">
			<XWidgets v-if="widgetsShowing" class="widgetsDrawer" />
		</transition>

		<XCommon />
	</div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, onMounted, provide, ref } from "vue";
import { acct } from "firefish-js";
import type { ComputedRef } from "vue";
import XCommon from "./_common_/common.vue";
import type { PageMetadata } from "@/scripts/page-metadata";
import { instanceName, ui } from "@/config";
import XDrawerMenu from "@/ui/_common_/navbar-for-mobile.vue";
import XSidebar from "@/ui/_common_/navbar.vue";
import * as os from "@/os";
import { defaultStore } from "@/store";
import { navbarItemDef } from "@/navbar";
import { i18n } from "@/i18n";
import { openAccountMenu as openAccountMenuImpl } from "@/account";
import { me } from "@/me";
import { mainRouter } from "@/router";
import { provideMetadataReceiver } from "@/scripts/page-metadata";
import { deviceKind } from "@/scripts/device-kind";
import icon from "@/scripts/icon";

const XWidgets = defineAsyncComponent(() => import("./universal.widgets.vue"));
const XStatusBars = defineAsyncComponent(
	() => import("@/ui/_common_/statusbars.vue"),
);

const DESKTOP_THRESHOLD = 1100;
const MOBILE_THRESHOLD = 500;

// デスクトップでウィンドウを狭くしたときモバイルUIが表示されて欲しいことはあるので deviceKind === 'desktop' の判定は行わない
const isDesktop = ref(window.innerWidth >= DESKTOP_THRESHOLD);
const isMobile = ref(
	deviceKind === "smartphone" || window.innerWidth <= MOBILE_THRESHOLD,
);
window.addEventListener("resize", () => {
	isMobile.value =
		deviceKind === "smartphone" || window.innerWidth <= MOBILE_THRESHOLD;
});

const replaceChatButtonWithAccountButton =
	defaultStore.state.replaceChatButtonWithAccountButton;
const openAccountMenu = (ev: MouseEvent) => {
	openAccountMenuImpl(
		{
			withExtraOperation: true,
		},
		ev,
		isMobile.value,
	);
};

const replaceWidgetsButtonWithReloadButton =
	defaultStore.state.replaceWidgetsButtonWithReloadButton;
const reload = () => {
	window.location.reload();
};

const buttonAnimIndex = ref(0);
const drawerMenuShowing = ref(false);

const pageMetadata = ref<null | ComputedRef<PageMetadata>>();
const widgetsEl = ref<HTMLElement>();
const postButton = ref<HTMLElement>();
const widgetsShowing = ref(false);

provide("router", mainRouter);
provideMetadataReceiver((info) => {
	pageMetadata.value = info;
	if (pageMetadata.value.value) {
		document.title = `${pageMetadata.value.value.title} | ${instanceName}`;
	}
});

const menuIndicated = computed(() => {
	for (const def in navbarItemDef) {
		if (def === "notifications" || def === "messaging") continue; // Notifications & Messaging are bottom nav buttons and thus shouldn't be highlighted in the sidebar
		if (navbarItemDef[def].indicated) return true;
	}
	return false;
});

function updateButtonState(): void {
	const routerState = window.location.pathname;
	if (routerState === "/") {
		buttonAnimIndex.value = 0;
		return;
	}
	if (routerState.includes("/my/notifications")) {
		buttonAnimIndex.value = 1;
		return;
	}
	if (routerState.includes("/my/messaging")) {
		buttonAnimIndex.value = 2;
		return;
	}
	buttonAnimIndex.value = 3;
}

updateButtonState();

mainRouter.on("change", () => {
	drawerMenuShowing.value = false;
	updateButtonState();
});

if (defaultStore.state.widgets.length === 0) {
	defaultStore.set("widgets", [
		{
			name: "calendar",
			id: "a",
			place: "right",
			data: {},
		},
		{
			name: "notifications",
			id: "b",
			place: "right",
			data: {},
		},
		{
			name: "trends",
			id: "c",
			place: "right",
			data: {},
		},
	]);
}

function messagingStart(ev) {
	os.popupMenu(
		[
			{
				text: i18n.ts.messagingWithUser,
				icon: `${icon("ph-user")}`,
				action: () => {
					startUser();
				},
			},
			{
				text: i18n.ts.messagingWithGroup,
				icon: `${icon("ph-users-three")}`,
				action: () => {
					startGroup();
				},
			},
			{
				text: i18n.ts.manageGroups,
				icon: `${icon("ph-user-circle-gear")}`,
				action: () => {
					mainRouter.push("/my/groups");
				},
			},
		],
		ev.currentTarget ?? ev.target,
	);
}

async function startUser(): void {
	os.selectUser().then((user) => {
		mainRouter.push(`/my/messaging/${acct.toString(user)}`);
	});
}

async function startGroup(): void {
	const groups1 = await os.api("users/groups/owned");
	const groups2 = await os.api("users/groups/joined");
	if (groups1.length === 0 && groups2.length === 0) {
		os.alert({
			type: "warning",
			title: i18n.ts.youHaveNoGroups,
			text: i18n.ts.joinOrCreateGroup,
		});
		return;
	}
	const { canceled, result: group } = await os.select({
		title: i18n.ts.group,
		items: groups1.concat(groups2).map((group) => ({
			value: group,
			text: group.name,
		})),
	});
	if (canceled) return;
	mainRouter.push(`/my/messaging/group/${group.id}`);
}

onMounted(() => {
	if (!isDesktop.value) {
		matchMedia(`(min-width: ${DESKTOP_THRESHOLD - 1}px)`).onchange = (
			mql,
		) => {
			if (mql.matches) isDesktop.value = true;
		};
	}
});

const onContextmenu = (ev: MouseEvent) => {
	const isLink = (el: HTMLElement) => {
		if (el.tagName === "A") return true;
		if (el.parentElement) {
			return isLink(el.parentElement);
		}
	};
	if (isLink(ev.target)) return;
	if (
		["INPUT", "TEXTAREA", "IMG", "VIDEO", "CANVAS"].includes(
			ev.target.tagName,
		) ||
		ev.target.attributes.contenteditable
	)
		return;
	if (window.getSelection()?.toString() !== "") return;
	const path = mainRouter.getCurrentPath();
	os.contextMenu(
		[
			{
				type: "label",
				text: path,
			},
			{
				icon: `${icon("ph-browser")}`,
				text: i18n.ts.openInWindow,
				action: () => {
					os.pageWindow(path);
				},
			},
		],
		ev,
	);
};

const attachSticky = (el: any) => {
	let lastScrollTop = 0;
	addEventListener(
		"scroll",
		() => {
			requestAnimationFrame(() => {
				widgetsEl.value.scrollTop += window.scrollY - lastScrollTop;
				lastScrollTop = window.scrollY;
			});
		},
		{ passive: true },
	);
	widgetsEl.value.classList.add("hide-scrollbar");
	widgetsEl.value.onmouseenter = () => {
		if (document.documentElement.scrollHeight <= window.innerHeight) {
			widgetsEl.value.classList.remove("hide-scrollbar");
		} else {
			widgetsEl.value.classList.add("hide-scrollbar");
		}
	};
};

function top() {
	window.scroll({ top: 0, behavior: "smooth" });
}

const wallpaper = localStorage.getItem("wallpaper") != null;
console.log(mainRouter.currentRoute.value.name);
</script>

<style lang="scss" scoped>
.widgetsDrawer-enter-active,
.widgetsDrawer-leave-active {
	opacity: 1;
	transform: translateX(0);
	transition:
		transform 300ms cubic-bezier(0.23, 1, 0.32, 1),
		opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.widgetsDrawer-enter-from,
.widgetsDrawer-leave-active {
	opacity: 0;
	transform: translateX(240px);
}

.widgetsDrawer-back-enter-active,
.widgetsDrawer-back-leave-active {
	opacity: 1;
	transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.widgetsDrawer-back-enter-from,
.widgetsDrawer-back-leave-active {
	opacity: 0;
}

.menuDrawer-enter-active,
.menuDrawer-leave-active {
	opacity: 1;
	transform: translateX(0);
	transition:
		transform 300ms cubic-bezier(0.23, 1, 0.32, 1),
		opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.menuDrawer-enter-from,
.menuDrawer-leave-active {
	opacity: 0;
	transform: translateX(-240px);
}

.menuDrawer-back-enter-active,
.menuDrawer-back-leave-active {
	opacity: 1;
	transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.menuDrawer-back-enter-from,
.menuDrawer-back-leave-active {
	opacity: 0;
}

.dkgtipfy {
	$ui-font-size: 1em; // TODO: どこかに集約したい
	$widgets-hide-threshold: 1090px;

	// ほんとは単に 100vh と書きたいところだが... https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
	min-height: calc(var(--vh, 1vh) * 100);
	box-sizing: border-box;
	display: flex;

	--stickyBottom: 1em;
	&.isMobile {
		--stickyBottom: 6rem;
	}
	&:not(.isMobile) {
		> .contents {
			border-right: 0.5px solid var(--divider);
		}
	}
	&.wallpaper {
		background: var(--wallpaperOverlay);

		:deep(.sidebar .middle) {
			position: relative;
			&::before {
				content: "";
				position: absolute;
				inset: -10px 10px;
				background: var(--bg);
				border-radius: calc((2.85rem / 2) + 5px);
				opacity: 1;
				z-index: -3;
			}
			> ._button:last-child {
				margin-bottom: 0 !important;
			}
		}
	}

	&.centered {
		justify-content: center;
		&:not(.isMobile) {
			--navBg: transparent;
			> .contents {
				border-inline: 0.5px solid var(--divider);
				margin-inline: -1px;
			}
		}

		> :deep(.sidebar:not(.iconOnly)) {
			margin-left: -200px;
			padding-left: 200px;
			box-sizing: content-box;
			.banner {
				pointer-events: none;
				top: -20% !important;
				mask: radial-gradient(
					farthest-side at top,
					hsl(0, 0%, 0%) 0%,
					hsla(0, 0%, 0%, 0.987) 0.3%,
					hsla(0, 0%, 0%, 0.951) 1.4%,
					hsla(0, 0%, 0%, 0.896) 3.2%,
					hsla(0, 0%, 0%, 0.825) 5.8%,
					hsla(0, 0%, 0%, 0.741) 9.3%,
					hsla(0, 0%, 0%, 0.648) 13.6%,
					hsla(0, 0%, 0%, 0.55) 18.9%,
					hsla(0, 0%, 0%, 0.45) 25.1%,
					hsla(0, 0%, 0%, 0.352) 32.4%,
					hsla(0, 0%, 0%, 0.259) 40.7%,
					hsla(0, 0%, 0%, 0.175) 50.2%,
					hsla(0, 0%, 0%, 0.104) 60.8%,
					hsla(0, 0%, 0%, 0.049) 72.6%,
					hsla(0, 0%, 0%, 0.013) 85.7%,
					hsla(0, 0%, 0%, 0) 100%
				) !important;
				-webkit-mask: radial-gradient(
					farthest-side at top,
					hsl(0, 0%, 0%) 0%,
					hsla(0, 0%, 0%, 0.987) 0.3%,
					hsla(0, 0%, 0%, 0.951) 1.4%,
					hsla(0, 0%, 0%, 0.896) 3.2%,
					hsla(0, 0%, 0%, 0.825) 5.8%,
					hsla(0, 0%, 0%, 0.741) 9.3%,
					hsla(0, 0%, 0%, 0.648) 13.6%,
					hsla(0, 0%, 0%, 0.55) 18.9%,
					hsla(0, 0%, 0%, 0.45) 25.1%,
					hsla(0, 0%, 0%, 0.352) 32.4%,
					hsla(0, 0%, 0%, 0.259) 40.7%,
					hsla(0, 0%, 0%, 0.175) 50.2%,
					hsla(0, 0%, 0%, 0.104) 60.8%,
					hsla(0, 0%, 0%, 0.049) 72.6%,
					hsla(0, 0%, 0%, 0.013) 85.7%,
					hsla(0, 0%, 0%, 0) 100%
				) !important;
				width: 125% !important;
				left: -12.5% !important;
				height: 145% !important;
			}
		}

		> .contents {
			min-width: 0;
			width: 750px;
			background: var(--panel);
			border-radius: 0;
			overflow: clip;
			--margin: 12px;
			background: var(--bg);
		}

		&.wallpaper {
			.contents {
				background: var(--acrylicBg) !important;
				backdrop-filter: var(--blur, blur(12px));
			}
			:deep(.tl),
			:deep(.notes) {
				background: none;
			}
		}
	}

	> .contents {
		width: 100%;
		min-width: 0;
		$widgets-hide-threshold: 1090px;
		overflow-x: clip;
		@media (max-width: $widgets-hide-threshold) {
			padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 96px);
		}
	}

	> .widgets-container {
		position: sticky;
		top: 0;
		max-height: 100vh;
		overflow-y: auto;
		padding: 0 var(--margin);
		width: 300px;
		min-width: max-content;
		box-sizing: content-box;

		@media (max-width: $widgets-hide-threshold) {
			display: none;
		}
	}

	> .widgetsDrawer-back {
		z-index: 1001;
	}

	> .widgetsDrawer {
		position: fixed;
		top: 0;
		right: 0;
		z-index: 1001;
		// ほんとは単に 100vh と書きたいところだが... https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
		height: calc(var(--vh, 1vh) * 100);
		padding: var(--margin);
		box-sizing: border-box;
		overflow: auto;
		overscroll-behavior: none;
		background: var(--bg);
	}

	> .postButton,
	.widgetButton {
		bottom: var(--stickyBottom);
		right: 1.5rem;
		height: 4rem;
		width: 4rem;
		background-position: center;
		background: var(--panelHighlight);
		color: var(--fg);
		position: fixed !important;
		z-index: 1000;
		font-size: 16px;
		border-radius: 10px;
		box-shadow: var(--shadow) 0px 0px 25px;
		transition: background 0.6s;
		transition: transform 0.3s;

		> .isHidden {
			transform: scale(0);
		}

		> .isVisible {
			transform: scale(1);
		}

		&:active {
			background-color: var(--accentedBg);
			background-size: 100%;
			transition: background 0.1s;
		}
	}

	> .buttons {
		position: fixed;
		z-index: 1000;
		bottom: 0;
		left: 0;
		padding: 12px 12px calc(env(safe-area-inset-bottom, 0px) + 12px) 12px;
		display: flex;
		width: 100%;
		box-sizing: border-box;
		background-color: var(--bg);

		> .button {
			position: relative;
			flex: 1;
			padding: 0;
			margin: auto;
			height: 3.5rem;
			border-radius: 8px;
			background-position: center;
			transition: background 0.6s;
			color: var(--fg);

			&:active {
				background-color: var(--accentedBg);
				background-size: 100%;
				transition: background 0.1s;
			}

			> .button-wrapper {
				display: inline-flex;
				justify-content: center;

				&.on {
					background-color: var(--accentedBg);
					width: 100%;
					border-radius: 999px;
					transform: translateY(-0.5em);
					transition: all 0.2s ease-in-out;
				}

				> .indicator {
					position: absolute;
					top: 0;
					left: 0;
					color: var(--indicator);
					font-size: 16px;
				}

				> .animateIndicator {
					animation: blink 1s infinite;
				}
			}

			&:not(:last-child) {
				margin-right: 12px;
			}

			@media (max-width: 400px) {
				height: 60px;

				&:not(:last-child) {
					margin-right: 8px;
				}
			}
			> .indicator {
				position: absolute;
				top: 0;
				left: 0;
				color: var(--indicator);
				font-size: 16px;
			}

			> .animateIndicator {
				animation: blink 1s infinite;
			}

			&:first-child {
				margin-left: 0;
			}

			&:last-child {
				margin-right: 0;
			}

			> * {
				font-size: 16px;
			}

			&:disabled {
				cursor: default;

				> * {
					opacity: 0.5;
				}
			}
		}
	}

	> .menuDrawer-back {
		z-index: 1001;
	}

	> .menuDrawer {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 1001;
		// ほんとは単に 100vh と書きたいところだが... https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
		height: calc(var(--vh, 1vh) * 100);
		width: 240px;
		box-sizing: border-box;
		contain: strict;
		overflow: auto;
		overscroll-behavior: contain;
		background: var(--navBg);
	}
}
</style>

<style lang="scss" module>
.statusbars {
	position: sticky;
	top: 0;
	left: 0;
}
</style>
