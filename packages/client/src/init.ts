/**
 * Client entry point
 */

// https://vitejs.dev/config/build-options.html#build-modulepreload
import "vite/modulepreload-polyfill";

import "@/style.scss";

import "@phosphor-icons/web/bold";
import "@phosphor-icons/web/duotone";
import "@phosphor-icons/web/fill";
import "@phosphor-icons/web/light";
import "@phosphor-icons/web/regular";

// #region account indexedDB migration

const accounts = localStorage.getItem("accounts");
if (accounts) {
	set("accounts", JSON.parse(accounts));
	localStorage.removeItem("accounts");
}
// #endregion

import {
	computed,
	createApp,
	defineAsyncComponent,
	markRaw,
	version as vueVersion,
	watch,
} from "vue";
import { set } from "@/scripts/idb-proxy";

import { refreshAccount, signIn, signOut, updateAccount } from "@/account";
import components from "@/components";
import { lang, ui, version } from "@/config";
import directives from "@/directives";
import { i18n } from "@/i18n";
import { fetchInstance, instance } from "@/instance";
import { isSignedIn, me } from "@/me";
import { alert, api, confirm, popup, post, toast } from "@/os";
import { deviceKind } from "@/scripts/device-kind";
import { getAccountFromId } from "@/scripts/get-account-from-id";
import { makeHotkey } from "@/scripts/hotkey";
import { initializeSw } from "@/scripts/initialize-sw";
import { isDeviceDarkmode } from "@/scripts/is-device-darkmode";
import { getUrlWithoutLoginId } from "@/scripts/login-id";
import { reactionPicker } from "@/scripts/reaction-picker";
import { search } from "@/scripts/search";
import * as sound from "@/scripts/sound";
import { applyTheme } from "@/scripts/theme";
import { reloadChannel } from "@/scripts/unison-reload";
import { ColdDeviceStorage, defaultStore } from "@/store";
import { isReloading, useStream } from "@/stream";
import widgets from "@/widgets";

function checkForSplash() {
	const splash = document.getElementById("splash");
	// 念のためnullチェック(HTMLが古い場合があるため(そのうち消す))
	if (splash) {
		splash.style.opacity = "0";
		splash.style.pointerEvents = "none";
		splash.addEventListener("transitionend", () => {
			splash.remove();
		});
	}
}

(async () => {
	console.info(`Firefish v${version}`);

	if (_DEV_) {
		console.warn("Development mode!!!");

		console.info(`vue ${vueVersion}`);

		window.addEventListener("error", (event) => {
			console.error(event);
			/*
			alert({
				type: 'error',
				title: 'DEV: Unhandled error',
				text: event.message
			});
			*/
		});

		window.addEventListener("unhandledrejection", (event) => {
			console.error(event);
			/*
			alert({
				type: 'error',
				title: 'DEV: Unhandled promise rejection',
				text: event.reason
			});
			*/
		});
	}

	// タッチデバイスでCSSの:hoverを機能させる
	document.addEventListener("touchend", () => {}, { passive: true });

	// 一斉リロード
	reloadChannel.addEventListener("message", (path) => {
		if (path !== null) location.href = path;
		else location.reload();
	});

	// #region SEE: https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
	// TODO: いつの日にか消したい
	const vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty("--vh", `${vh}px`);
	window.addEventListener("resize", () => {
		const vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty("--vh", `${vh}px`);
	});
	// #endregion

	// #region Set lang attr
	const html = document.documentElement;
	html.setAttribute("lang", lang || "en-US");
	// #endregion

	// #region loginId
	const params = new URLSearchParams(location.search);
	const loginId = params.get("loginId");

	if (loginId) {
		const target = getUrlWithoutLoginId(location.href);

		if (!me || me.id !== loginId) {
			const account = await getAccountFromId(loginId);
			if (account) {
				await signIn(account.token, target);
			}
		}

		history.replaceState({ misskey: "loginId" }, "", target);
	}

	// #endregion

	// #region Fetch user
	if (me?.token) {
		if (_DEV_) {
			console.log("account cache found. refreshing...");
		}

		refreshAccount();
	} else {
		if (_DEV_) {
			console.log("no account cache found.");
		}

		// 連携ログインの場合用にCookieを参照する
		const i = (document.cookie.match(/igi=(\w+)/) || [null, null])[1];

		if (i != null && i !== "null") {
			if (_DEV_) {
				console.log("signing...");
			}

			try {
				document.body.innerHTML = "<div>Please wait...</div>";
				await signIn(i);
			} catch (err) {
				// Render the error screen
				// TODO: ちゃんとしたコンポーネントをレンダリングする(v10とかのトラブルシューティングゲーム付きのやつみたいな)
				document.body.innerHTML = '<div id="err">Oops!</div>';
			}
		} else {
			if (_DEV_) {
				console.log("not signed in");
			}
		}
	}
	// #endregion

	const fetchInstanceMetaPromise = fetchInstance();

	fetchInstanceMetaPromise.then(() => {
		localStorage.setItem("v", instance.version);

		// Init service worker
		initializeSw();
	});

	const app = createApp(
		window.location.search === "?zen"
			? defineAsyncComponent(() => import("@/ui/zen.vue"))
			: !me
			  ? defineAsyncComponent(() => import("@/ui/visitor.vue"))
			  : ui === "deck"
				  ? defineAsyncComponent(() => import("@/ui/deck.vue"))
				  : defineAsyncComponent(() => import("@/ui/universal.vue")),
	);

	if (_DEV_) {
		app.config.performance = true;
	}

	widgets(app);
	directives(app);
	components(app);

	checkForSplash();

	// https://github.com/misskey-dev/misskey/pull/8575#issuecomment-1114239210
	// なぜかinit.tsの内容が2回実行されることがあるため、mountするdivを1つに制限する
	const rootEl = (() => {
		const MISSKEY_MOUNT_DIV_ID = "firefish_app";

		const currentEl = document.getElementById(MISSKEY_MOUNT_DIV_ID);

		if (currentEl) {
			console.warn("multiple import detected");
			return currentEl;
		}

		const rootEl = document.createElement("div");
		rootEl.id = MISSKEY_MOUNT_DIV_ID;
		document.body.appendChild(rootEl);
		return rootEl;
	})();

	app.mount(rootEl);

	// boot.jsのやつを解除
	window.onerror = null;
	window.onunhandledrejection = null;

	reactionPicker.init();

	checkForSplash();

	// クライアントが更新されたか？
	const lastVersion = localStorage.getItem("lastVersion");

	if (lastVersion !== version) {
		localStorage.setItem("lastVersion", version);

		// テーマリビルドするため
		localStorage.removeItem("theme");

		try {
			// 変なバージョン文字列来るとcompareVersionsでエラーになるため
			if (lastVersion < version && defaultStore.state.showUpdates) {
				// ログインしてる場合だけ
				if (me) {
					popup(
						defineAsyncComponent(() => import("@/components/MkUpdated.vue")),
						{},
						{},
						"closed",
					);
				}
			}
		} catch (err) {
			console.error(err);
		}
	}

	if (
		isSignedIn &&
		defaultStore.state.tutorial === -1 &&
		!["/announcements", "/announcements/"].includes(window.location.pathname)
	) {
		api("announcements", { withUnreads: true, limit: 10 })
			.then((announcements) => {
				const unreadAnnouncements = announcements.filter((item) => {
					return !item.isRead;
				});
				if (unreadAnnouncements.length > 3) {
					popup(
						defineAsyncComponent(
							() => import("@/components/MkManyAnnouncements.vue"),
						),
						{},
						{},
						"closed",
					);
				} else {
					unreadAnnouncements.forEach((item) => {
						if (item.showPopup)
							popup(
								defineAsyncComponent(
									() => import("@/components/MkAnnouncement.vue"),
								),
								{ announcement: item },
								{},
								"closed",
							);
					});
				}
			})
			.catch((err) => console.log(err));
	}

	// NOTE: この処理は必ず↑のクライアント更新時処理より後に来ること(テーマ再構築のため)
	watch(
		defaultStore.reactiveState.darkMode,
		(darkMode) => {
			applyTheme(
				darkMode
					? ColdDeviceStorage.get("darkTheme")
					: ColdDeviceStorage.get("lightTheme"),
			);
		},
		{ immediate: localStorage.theme == null },
	);

	const darkTheme = computed(ColdDeviceStorage.makeGetterSetter("darkTheme"));
	const lightTheme = computed(ColdDeviceStorage.makeGetterSetter("lightTheme"));

	watch(darkTheme, (theme) => {
		if (defaultStore.state.darkMode) {
			applyTheme(theme);
		}
	});

	watch(lightTheme, (theme) => {
		if (!defaultStore.state.darkMode) {
			applyTheme(theme);
		}
	});

	// #region Sync dark mode
	if (ColdDeviceStorage.get("syncDeviceDarkMode")) {
		defaultStore.set("darkMode", isDeviceDarkmode());
	}
	window.matchMedia("(prefers-color-scheme: dark)").onchange = (mql) => {
		if (ColdDeviceStorage.get("syncDeviceDarkMode")) {
			defaultStore.set("darkMode", mql.matches);
		}
	};
	// #endregion

	fetchInstanceMetaPromise.then(() => {
		if (defaultStore.state.themeInitial) {
			if (instance.defaultLightTheme != null)
				ColdDeviceStorage.set(
					"lightTheme",
					JSON.parse(instance.defaultLightTheme),
				);
			if (instance.defaultDarkTheme != null)
				ColdDeviceStorage.set(
					"darkTheme",
					JSON.parse(instance.defaultDarkTheme),
				);
			defaultStore.set("themeInitial", false);
		}
	});

	watch(
		defaultStore.reactiveState.useBlurEffectForModal,
		(v) => {
			document.documentElement.style.setProperty(
				"--modalBgFilter",
				v ? "blur(4px)" : "none",
			);
		},
		{ immediate: true },
	);

	watch(
		defaultStore.reactiveState.useBlurEffect,
		(v) => {
			if (v && deviceKind !== "smartphone") {
				document.documentElement.style.removeProperty("--blur");
			} else {
				document.documentElement.style.setProperty("--blur", "none");
			}
		},
		{ immediate: true },
	);

	let reloadDialogShowing = false;
	const stream = useStream();

	stream.on("_disconnected_", async () => {
		if (isReloading) return;
		if (defaultStore.state.serverDisconnectedBehavior === "reload") {
			location.reload();
		} else if (defaultStore.state.serverDisconnectedBehavior === "dialog") {
			if (reloadDialogShowing) return;
			reloadDialogShowing = true;
			const { canceled } = await confirm({
				type: "warning",
				title: i18n.ts.disconnectedFromServer,
				text: i18n.ts.reloadConfirm,
			});
			reloadDialogShowing = false;
			if (!canceled) {
				location.reload();
			}
		}
	});

	stream.on("emojiAdded", (emojiData) => {
		// TODO
		// store.commit('instance/set', );
	});

	for (const plugin of ColdDeviceStorage.get("plugins").filter(
		(p) => p.active,
	)) {
		import("./plugin").then(({ install }) => {
			install(plugin);
		});
	}

	const hotkeys = {
		d: (): void => {
			defaultStore.set("darkMode", !defaultStore.state.darkMode);
		},
		s: search,
	};

	if (isSignedIn) {
		// only add post shortcuts if logged in
		hotkeys["p|n"] = post;

		if (me.isDeleted) {
			alert({
				type: "warning",
				text: i18n.ts.accountDeletionInProgress,
			});
		}

		const lastUsed = localStorage.getItem("lastUsed");
		if (lastUsed) {
			const lastUsedDate = Number.parseInt(lastUsed, 10);
			// 二時間以上前なら
			if (Date.now() - lastUsedDate > 1000 * 60 * 60 * 2) {
				toast(
					i18n.t("welcomeBackWithName", {
						name: me.name || me.username,
					}),
				);
			}
		}
		localStorage.setItem("lastUsed", Date.now().toString());

		const latestDonationInfoShownAt = localStorage.getItem(
			"latestDonationInfoShownAt",
		);
		const neverShowDonationInfo = localStorage.getItem("neverShowDonationInfo");
		if (
			neverShowDonationInfo !== "true" &&
			new Date(me.createdAt).getTime() < Date.now() - 1000 * 60 * 60 * 24 * 3 &&
			!location.pathname.startsWith("/miauth")
		) {
			if (
				latestDonationInfoShownAt == null ||
				new Date(latestDonationInfoShownAt).getTime() <
					Date.now() - 1000 * 60 * 60 * 24 * 30
			) {
				popup(
					defineAsyncComponent(() => import("@/components/MkDonation.vue")),
					{},
					{},
					"closed",
				);
			}
		}

		if ("Notification" in window) {
			// 許可を得ていなかったらリクエスト
			if (Notification.permission === "default") {
				Notification.requestPermission();
			}
		}

		const main = markRaw(stream.useChannel("main", null, "System"));

		// 自分の情報が更新されたとき
		main.on("meUpdated", (i) => {
			updateAccount(i);
		});

		main.on("readAllNotifications", () => {
			updateAccount({ hasUnreadNotification: false });
		});

		main.on("unreadNotification", () => {
			updateAccount({ hasUnreadNotification: true });
		});

		main.on("unreadMention", () => {
			updateAccount({ hasUnreadMentions: true });
		});

		main.on("readAllUnreadMentions", () => {
			updateAccount({ hasUnreadMentions: false });
		});

		main.on("unreadSpecifiedNote", () => {
			updateAccount({ hasUnreadSpecifiedNotes: true });
		});

		main.on("readAllUnreadSpecifiedNotes", () => {
			updateAccount({ hasUnreadSpecifiedNotes: false });
		});

		main.on("readAllMessagingMessages", () => {
			updateAccount({ hasUnreadMessagingMessage: false });
		});

		main.on("unreadMessagingMessage", () => {
			updateAccount({ hasUnreadMessagingMessage: true });
			sound.play("chatBg");
		});

		main.on("readAllAntennas", () => {
			updateAccount({ hasUnreadAntenna: false });
		});

		main.on("unreadAntenna", () => {
			updateAccount({ hasUnreadAntenna: true });
			sound.play("antenna");
		});

		main.on("readAllAnnouncements", () => {
			updateAccount({ hasUnreadAnnouncement: false });
		});

		main.on("readAllChannels", () => {
			updateAccount({ hasUnreadChannel: false });
		});

		main.on("unreadChannel", () => {
			updateAccount({ hasUnreadChannel: true });
			sound.play("channel");
		});

		// トークンが再生成されたとき
		// このままではMisskeyが利用できないので強制的にサインアウトさせる
		main.on("myTokenRegenerated", () => {
			signOut();
		});
	}

	// shortcut
	document.addEventListener("keydown", makeHotkey(hotkeys));
})();
