import { markRaw, ref } from "vue";
import { isSignedIn } from "./me";
import { Storage } from "./pizzax";

export const postFormActions = [];
export const userActions = [];
export const noteActions = [];
export const noteViewInterruptors = [];
export const notePostInterruptors = [];

const menuOptions = [
	"notifications",
	"followRequests",
	"messaging",
	"explore",
	"favorites",
	"channels",
	"search",
];

export const defaultReactions = [
	"⭐",
	"❤️",
	"😆",
	"🤔",
	"😮",
	"🎉",
	"💢",
	"😥",
	"😇",
	"🥴",
	"🔥",
	"🐟",
];

// TODO: それぞれいちいちwhereとかdefaultというキーを付けなきゃいけないの冗長なのでなんとかする(ただ型定義が面倒になりそう)
//       あと、現行の定義の仕方なら「whereが何であるかに関わらずキー名の重複不可」という制約を付けられるメリットもあるからそのメリットを引き継ぐ方法も考えないといけない
export const defaultStore = markRaw(
	new Storage("base", {
		tutorial: {
			where: "account",
			default: 0,
		},
		tlHomeHintClosed: {
			where: "account",
			default: false,
		},
		tlLocalHintClosed: {
			where: "account",
			default: false,
		},
		tlRecommendedHintClosed: {
			where: "account",
			default: false,
		},
		tlSocialHintClosed: {
			where: "account",
			default: false,
		},
		tlGlobalHintClosed: {
			where: "account",
			default: false,
		},
		keepCw: {
			where: "account",
			default: true,
		},
		showFullAcct: {
			where: "account",
			default: false,
		},
		rememberNoteVisibility: {
			where: "account",
			default: false,
		},
		defaultNoteVisibility: {
			where: "account",
			default: "public",
		},
		defaultNoteLocalOnly: {
			where: "account",
			default: false,
		},
		uploadFolder: {
			where: "account",
			default: null as string | null,
		},
		pastedFileName: {
			where: "account",
			default: "yyyy-MM-dd HH-mm-ss [{{number}}]",
		},
		keepOriginalUploading: {
			where: "account",
			default: false,
		},
		memo: {
			where: "account",
			default: null,
		},
		reactions: {
			where: "account",
			default: defaultReactions,
		},
		mutedWords: {
			where: "account",
			default: [],
		},
		mutedLangs: {
			where: "account",
			default: [],
		},
		mutedAds: {
			where: "account",
			default: [] as string[],
		},
		showAds: {
			where: "account",
			default: true,
		},
		menu: {
			where: "deviceAccount",
			default: menuOptions,
		},
		visibility: {
			where: "deviceAccount",
			default: "public" as
				| "public"
				| "home"
				| "followers"
				| "specified"
				| "private",
		},
		localOnly: {
			where: "deviceAccount",
			default: false,
		},
		statusbars: {
			where: "deviceAccount",
			default: [] as {
				name: string;
				id: string;
				type: string;
				size: "verySmall" | "small" | "medium" | "large" | "veryLarge";
				black: boolean;
				props: Record<string, any>;
			}[],
		},
		widgets: {
			where: "deviceAccount",
			default: [] as {
				name: string;
				id: string;
				place: string | null;
				data: Record<string, any>;
			}[],
		},
		tl: {
			where: "deviceAccount",
			default: {
				src: (isSignedIn ? "home" : "local") as
					| "home"
					| "local"
					| "social"
					| "global"
					| "recommended",
				arg: null,
			},
		},

		overridedDeviceKind: {
			where: "device",
			default: null as null | "smartphone" | "tablet" | "desktop",
		},
		serverDisconnectedBehavior: {
			where: "device",
			default: "nothing" as "nothing" | "quiet" | "reload" | "dialog",
		},
		seperateRenoteQuote: {
			where: "device",
			default: true,
		},
		expandOnNoteClick: {
			where: "device",
			default: true,
		},
		nsfw: {
			where: "deviceAccount",
			default: "respect" as "respect" | "force" | "ignore",
		},
		animation: {
			where: "device",
			default: true,
		},
		advancedMfm: {
			where: "device",
			default: true,
		},
		animatedMfm: {
			where: "device",
			default: true,
		},
		animatedMfmWarnShown: {
			where: "device",
			default: false,
		},
		loadRawImages: {
			where: "device",
			default: false,
		},
		imageNewTab: {
			where: "device",
			default: false,
		},
		disableShowingAnimatedImages: {
			where: "device",
			default: false,
		},
		disablePagesScript: {
			where: "device",
			default: false,
		},
		useOsNativeEmojis: {
			where: "device",
			default: false,
		},
		disableDrawer: {
			where: "device",
			default: false,
		},
		useBlurEffectForModal: {
			where: "device",
			default: true,
		},
		useBlurEffect: {
			where: "device",
			default: true,
		},
		showFixedPostForm: {
			where: "device",
			default: false,
		},
		enableInfiniteScroll: {
			where: "device",
			default: true,
		},
		useReactionPickerForContextMenu: {
			where: "device",
			default: false,
		},
		showGapBetweenNotesInTimeline: {
			where: "device",
			default: false,
		},
		darkMode: {
			where: "device",
			default: false,
		},
		instanceTicker: {
			where: "device",
			default: "always" as "none" | "remote" | "always",
		},
		reactionPickerSkinTone: {
			where: "account",
			default: 1,
		},
		reactionPickerSize: {
			where: "device",
			default: 3,
		},
		reactionPickerWidth: {
			where: "device",
			default: 3,
		},
		reactionPickerHeight: {
			where: "device",
			default: 3,
		},
		reactionPickerUseDrawerForMobile: {
			where: "device",
			default: true,
		},
		recentlyUsedEmojis: {
			where: "device",
			default: [] as string[],
		},
		recentlyUsedUsers: {
			where: "device",
			default: [] as string[],
		},
		defaultSideView: {
			where: "device",
			default: false,
		},
		menuDisplay: {
			where: "device",
			default: "sideFull" as "sideFull" | "sideIcon" | "top",
		},
		reportError: {
			where: "device",
			default: false,
		},
		squareAvatars: {
			where: "device",
			default: true,
		},
		squareCatAvatars: {
			where: "device",
			default: false,
		},
		postFormWithHashtags: {
			where: "device",
			default: false,
		},
		postFormHashtags: {
			where: "device",
			default: "",
		},
		themeInitial: {
			where: "device",
			default: true,
		},
		numberOfPageCache: {
			where: "device",
			default: 5,
		},
		enterSendsMessage: {
			where: "device",
			default: true,
		},
		showUpdates: {
			where: "device",
			default: true,
		},
		swipeOnDesktop: {
			where: "device",
			default: false,
		},
		swipeOnMobile: {
			where: "device",
			default: true,
		},
		showAdminUpdates: {
			where: "account",
			default: true,
		},
		woozyMode: {
			where: "device",
			default: false,
		},
		enableCustomKaTeXMacro: {
			where: "device",
			default: false,
		},
		enableEmojiReactions: {
			where: "account",
			default: true,
		},
		showEmojisInReactionNotifications: {
			where: "account",
			default: true,
		},
		showTimelineReplies: {
			where: "deviceAccount",
			default: false,
		},
		addRe: {
			where: "account",
			default: true,
		},
		detectPostLanguage: {
			where: "deviceAccount",
			default: true,
		},
		openServerInfo: {
			where: "device",
			default: true,
		},
		iconSet: {
			where: "device",
			default: "ph-bold" as
				| "ph-bold"
				| "ph-duotone"
				| "ph-light"
				| "ph" // this is ph-regular
				| "ph-fill",
		},
		recentlyUsedPostLanguages: {
			where: "account",
			default: [] as string[],
		},
		useEmojiCdn: {
			where: "device",
			default: true,
		},
		showPreviewByDefault: {
			where: "deviceAccount",
			default: false,
		},
		hideFollowButtons: {
			where: "device",
			default: true,
		},
		replaceChatButtonWithAccountButton: {
			where: "device",
			default: true,
		},
		replaceWidgetsButtonWithReloadButton: {
			where: "device",
			default: false,
		},
		searchURL: {
			where: "device",
			default: "https://duckduckgo.com/?q=",
		},
		showBigPostButton: {
			where: "device",
			default: false,
		},
		enableTimelineStreaming: {
			where: "deviceAccount",
			default: true,
		},
		enablePullToRefresh: {
			where: "deviceAccount",
			default: true,
		},
		pullToRefreshThreshold: {
			where: "device",
			default: 150,
		},
		showNoAltTextWarning: {
			where: "account",
			default: true,
		},
	}),
);

// TODO: 他のタブと永続化されたstateを同期

const PREFIX = "miux:";

interface Plugin {
	id: string;
	name: string;
	active: boolean;
	configData: Record<string, any>;
	token: string;
	ast: any[];
}

import darkTheme from "@/themes/d-rosepine.json5";
/**
 * Storage for configuration information that does not need to be constantly loaded into memory (non-reactive)
 */
import lightTheme from "@/themes/l-rosepinedawn.json5";

export class ColdDeviceStorage {
	public static default = {
		lightTheme,
		darkTheme,
		syncDeviceDarkMode: true,
		plugins: [] as Plugin[],
		mediaVolume: 0.5,
		vibrate: false,
		sound_masterVolume: 0.3,
		sound_note: { type: "none", volume: 0 },
		sound_noteMy: { type: "syuilo/up", volume: 1 },
		sound_notification: { type: "syuilo/pope2", volume: 1 },
		sound_chat: { type: "syuilo/pope1", volume: 1 },
		sound_chatBg: { type: "syuilo/waon", volume: 1 },
		sound_antenna: { type: "syuilo/triple", volume: 1 },
		sound_channel: { type: "syuilo/square-pico", volume: 1 },
	};

	public static watchers = [];

	public static get<T extends keyof typeof ColdDeviceStorage.default>(
		key: T,
	): (typeof ColdDeviceStorage.default)[T] {
		// TODO: indexedDBにする
		//       ただしその際はnullチェックではなくキー存在チェックにしないとダメ
		//       (indexedDBはnullを保存できるため、ユーザーが意図してnullを格納した可能性がある)
		const value = localStorage.getItem(PREFIX + key);
		if (value == null) {
			return ColdDeviceStorage.default[key];
		} else {
			return JSON.parse(value);
		}
	}

	public static set<T extends keyof typeof ColdDeviceStorage.default>(
		key: T,
		value: (typeof ColdDeviceStorage.default)[T],
	): void {
		// 呼び出し側のバグ等で undefined が来ることがある
		// undefined を文字列として localStorage に入れると参照する際の JSON.parse でコケて不具合の元になるため無視
		if (value === undefined) {
			console.error(`attempt to store undefined value for key '${key}'`);
			return;
		}

		localStorage.setItem(PREFIX + key, JSON.stringify(value));

		for (const watcher of this.watchers) {
			if (watcher.key === key) watcher.callback(value);
		}
	}

	public static watch(key, callback) {
		this.watchers.push({ key, callback });
	}

	// TODO: VueのcustomRef使うと良い感じになるかも
	public static ref<T extends keyof typeof ColdDeviceStorage.default>(key: T) {
		const v = ColdDeviceStorage.get(key);
		const r = ref(v);
		// TODO: このままではwatcherがリークするので開放する方法を考える
		this.watch(key, (v) => {
			r.value = v;
		});
		return r;
	}

	/**
	 * 特定のキーの、簡易的なgetter/setterを作ります
	 * 主にvue場で設定コントロールのmodelとして使う用
	 */
	public static makeGetterSetter<
		K extends keyof typeof ColdDeviceStorage.default,
	>(key: K) {
		// TODO: VueのcustomRef使うと良い感じになるかも
		const valueRef = ColdDeviceStorage.ref(key);
		return {
			get: () => {
				return valueRef.value;
			},
			set: (value: unknown) => {
				const val = value;
				ColdDeviceStorage.set(key, val);
			},
		};
	}
}
