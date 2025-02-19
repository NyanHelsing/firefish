<template>
	<div
		v-if="!muted.muted"
		v-show="!isDeleted"
		:id="appearNote.id"
		ref="el"
		v-hotkey="keymap"
		v-size="{ max: [500, 350] }"
		v-vibrate="5"
		:aria-label="accessibleLabel"
		class="tkcbzcuz note-container"
		:tabindex="!isDeleted ? '-1' : null"
		:class="{ renote: isRenote }"
	>
		<MkNoteSub
			v-if="appearNote.reply && !detailedView && !collapsedReply"
			:note="appearNote.reply"
			class="reply-to"
		/>
		<div
			v-if="!detailedView"
			class="note-context"
			:class="{
				collapsedReply: collapsedReply && appearNote.reply,
			}"
			@click="noteClick"
		>
			<div v-if="!collapsedReply" class="line"></div>
			<div v-if="appearNote._prId_" class="info">
				<i :class="icon('ph-megaphone-simple-bold')"></i>
				{{ i18n.ts.promotion
				}}<button class="_textButton hide" @click.stop="readPromo()">
					{{ i18n.ts.hideThisNote }}
					<i :class="icon('ph-x')"></i>
				</button>
			</div>
			<div v-if="appearNote._featuredId_" class="info">
				<i :class="icon('ph-lightning')"></i>
				{{ i18n.ts.featured }}
			</div>
			<div v-if="pinned" class="info">
				<i :class="icon('ph-push-pin')"></i>{{ i18n.ts.pinnedNote }}
			</div>
			<div v-if="isRenote" class="renote">
				<i :class="icon('ph-rocket-launch')"></i>
				<I18n :src="i18n.ts.renotedBy" tag="span">
					<template #user>
						<MkA
							v-user-preview="note.userId"
							class="name"
							:to="userPage(note.user)"
							@click.stop
						>
							<MkUserName :user="note.user" />
						</MkA>
					</template>
				</I18n>
				<div class="info">
					<button
						ref="renoteTime"
						class="_button time"
						@click.stop="showRenoteMenu()"
					>
						<i
							v-if="isMyRenote"
							:class="icon('ph-dots-three-outline dropdownIcon')"
						></i>
						<MkTime :time="note.createdAt" />
					</button>
					<MkVisibility :note="note" />
				</div>
			</div>
			<div v-if="collapsedReply && appearNote.reply" class="info">
				<MkAvatar class="avatar" :user="appearNote.reply.user" />
				<MkUserName
					class="username"
					:user="appearNote.reply.user"
				></MkUserName>
				<Mfm
					class="summary"
					:text="getNoteSummary(appearNote.reply)"
					:plain="true"
					:nowrap="true"
					:lang="appearNote.reply.lang"
					:custom-emojis="note.emojis"
				/>
			</div>
		</div>
		<article
			class="article"
			:style="{
				cursor: expandOnNoteClick && !detailedView ? 'pointer' : '',
			}"
			@contextmenu.stop="onContextmenu"
			@click="noteClick"
		>
			<div class="main">
				<div class="header-container">
					<MkAvatar class="avatar" :user="appearNote.user" />
					<XNoteHeader
						class="header"
						:note="appearNote"
						:can-open-server-info="true"
					/>
				</div>
				<div class="body">
					<MkSubNoteContent
						class="text"
						:note="appearNote"
						:detailed="true"
						:detailed-view="detailedView"
						:parent-id="appearNote.parentId"
						@push="(e) => router.push(notePage(e))"
						@focusfooter="footerEl.focus()"
						@expanded="(e) => setPostExpanded(e)"
					></MkSubNoteContent>
					<div v-if="translating || translation" class="translation">
						<MkLoading v-if="translating" mini />
						<div v-else-if="translation != null" class="translated">
							<b
								>{{
									i18n.t("translatedFrom", {
										x: translation.sourceLang,
									})
								}}:
							</b>
							<Mfm
								:text="translation.text"
								:author="appearNote.user"
								:i="me"
								:lang="targetLang"
								:custom-emojis="appearNote.emojis"
							/>
						</div>
					</div>
				</div>
				<div
					v-if="detailedView || (appearNote.channel && !inChannel)"
					class="info"
				>
					<MkA
						v-if="detailedView"
						class="created-at"
						:to="notePage(appearNote)"
					>
						<MkTime :time="appearNote.createdAt" mode="absolute" />
					</MkA>
					<MkA
						v-if="appearNote.channel && !inChannel"
						class="channel"
						:to="`/channels/${appearNote.channel.id}`"
						@click.stop
						><i :class="icon('ph-television', false)"></i>
						{{ appearNote.channel.name }}</MkA
					>
				</div>
				<footer ref="footerEl" class="footer" tabindex="-1">
					<XReactionsViewer
						v-if="enableEmojiReactions"
						ref="reactionsViewer"
						:note="appearNote"
					/>
					<button
						v-tooltip.noDelay.bottom="i18n.ts.reply"
						class="button _button"
						@click.stop="reply()"
					>
						<i :class="icon('ph-arrow-u-up-left')"></i>
						<template
							v-if="appearNote.repliesCount > 0 && !detailedView"
						>
							<p class="count">{{ appearNote.repliesCount }}</p>
						</template>
					</button>
					<XRenoteButton
						ref="renoteButton"
						class="button"
						:note="appearNote"
						:count="appearNote.renoteCount"
						:detailed-view="detailedView"
					/>
					<XStarButtonNoEmoji
						v-if="!enableEmojiReactions"
						class="button"
						:note="appearNote"
						:count="
							Object.values(appearNote.reactions).reduce(
								(partialSum, val) => partialSum + val,
								0,
							)
						"
						:reacted="appearNote.myReaction != null"
					/>
					<XStarButton
						v-if="
							enableEmojiReactions &&
							appearNote.myReaction == null
						"
						ref="starButton"
						class="button"
						:note="appearNote"
					/>
					<button
						v-if="
							enableEmojiReactions &&
							appearNote.myReaction == null
						"
						ref="reactButton"
						v-tooltip.noDelay.bottom="i18n.ts.reaction"
						class="button _button"
						@click.stop="react()"
					>
						<i :class="icon('ph-smiley')"></i>
					</button>
					<button
						v-if="
							enableEmojiReactions &&
							appearNote.myReaction != null
						"
						ref="reactButton"
						v-tooltip.noDelay.bottom="i18n.ts.removeReaction"
						class="button _button reacted"
						@click.stop="undoReact(appearNote)"
					>
						<i :class="icon('ph-minus')"></i>
					</button>
					<XQuoteButton class="button" :note="appearNote" />
					<button
						v-if="
							isSignedIn &&
							isForeignLanguage &&
							translation == null
						"
						v-tooltip.noDelay.bottom="i18n.ts.translate"
						class="button _button"
						@click.stop="translate"
					>
						<i :class="icon('ph-translate')"></i>
					</button>
					<button
						ref="menuButton"
						v-tooltip.noDelay.bottom="i18n.ts.more"
						class="button _button"
						@click.stop="menu()"
					>
						<i :class="icon('ph-dots-three-outline')"></i>
					</button>
				</footer>
			</div>
		</article>
	</div>
	<button
		v-else
		class="muted _button"
		@click="muted.muted = false"
		@contextmenu.stop.prevent
	>
		<I18n :src="softMuteReasonI18nSrc(muted.what)" tag="small">
			<template #name>
				<MkA
					v-user-preview="note.userId"
					class="name"
					:to="userPage(note.user)"
				>
					<MkUserName :user="note.user" />
				</MkA>
			</template>
			<template #reason>
				<b class="_blur_text">{{ muted.matched.join(", ") }}</b>
			</template>
		</I18n>
	</button>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, ref } from "vue";
import type { Ref } from "vue";
import type { entities } from "firefish-js";
import MkSubNoteContent from "./MkSubNoteContent.vue";
import MkNoteSub from "@/components/MkNoteSub.vue";
import XNoteHeader from "@/components/MkNoteHeader.vue";
import XRenoteButton from "@/components/MkRenoteButton.vue";
import XReactionsViewer from "@/components/MkReactionsViewer.vue";
import XStarButton from "@/components/MkStarButton.vue";
import XStarButtonNoEmoji from "@/components/MkStarButtonNoEmoji.vue";
import XQuoteButton from "@/components/MkQuoteButton.vue";
import MkVisibility from "@/components/MkVisibility.vue";
import copyToClipboard from "@/scripts/copy-to-clipboard";
import detectLanguage from "@/scripts/detect-language";
import { url } from "@/config";
import { pleaseLogin } from "@/scripts/please-login";
import { focusNext, focusPrev } from "@/scripts/focus";
import { getWordSoftMute } from "@/scripts/check-word-mute";
import { useRouter } from "@/router";
import { userPage } from "@/filters/user";
import * as os from "@/os";
import { defaultStore, noteViewInterruptors } from "@/store";
import { reactionPicker } from "@/scripts/reaction-picker";
import { isSignedIn, me } from "@/me";
import { i18n } from "@/i18n";
import { getNoteMenu } from "@/scripts/get-note-menu";
import { useNoteCapture } from "@/scripts/use-note-capture";
import { notePage } from "@/filters/note";
import { deepClone } from "@/scripts/clone";
import { getNoteSummary } from "@/scripts/get-note-summary";
import icon from "@/scripts/icon";

const router = useRouter();

const props = defineProps<{
	note: entities.Note;
	pinned?: boolean;
	detailedView?: boolean;
	collapsedReply?: boolean;
}>();

const inChannel = inject("inChannel", null);

const note = ref(deepClone(props.note));

const softMuteReasonI18nSrc = (what?: string) => {
	if (what === "note") return i18n.ts.userSaysSomethingReason;
	if (what === "reply") return i18n.ts.userSaysSomethingReasonReply;
	if (what === "renote") return i18n.ts.userSaysSomethingReasonRenote;
	if (what === "quote") return i18n.ts.userSaysSomethingReasonQuote;

	// I don't think here is reachable, but just in case
	return i18n.ts.userSaysSomething;
};

// plugin
if (noteViewInterruptors.length > 0) {
	onMounted(async () => {
		let result = deepClone(note.value);
		for (const interruptor of noteViewInterruptors) {
			result = await interruptor.handler(result);
		}
		note.value = result;
	});
}

const isRenote =
	note.value.renote != null &&
	note.value.text == null &&
	note.value.fileIds.length === 0 &&
	note.value.poll == null;

const el = ref<HTMLElement>();
const footerEl = ref<HTMLElement>();
const menuButton = ref<HTMLElement>();
const starButton = ref<InstanceType<typeof XStarButton>>();
const renoteButton = ref<InstanceType<typeof XRenoteButton>>();
const renoteTime = ref<HTMLElement>();
const reactButton = ref<HTMLElement>();
const appearNote = computed(() =>
	isRenote ? (note.value.renote as entities.Note) : note.value,
);
const isMyRenote = isSignedIn && me.id === note.value.userId;
const showContent = ref(false);
const isDeleted = ref(false);
const muted = ref(
	getWordSoftMute(
		note.value,
		me?.id,
		defaultStore.state.mutedWords,
		defaultStore.state.mutedLangs,
	),
);
const translation = ref(null);
const translating = ref(false);
const enableEmojiReactions = defaultStore.state.enableEmojiReactions;
const expandOnNoteClick = defaultStore.state.expandOnNoteClick;
const lang = localStorage.getItem("lang");
const translateLang = localStorage.getItem("translateLang");
const targetLang = (translateLang || lang || navigator.language)?.slice(0, 2);

const isForeignLanguage: boolean =
	defaultStore.state.detectPostLanguage &&
	appearNote.value.text != null &&
	(() => {
		const postLang = detectLanguage(appearNote.value.text);
		return postLang !== "" && postLang !== targetLang;
	})();

async function translate_(noteId, targetLang: string) {
	return await os.api("notes/translate", {
		noteId,
		targetLang,
	});
}

async function translate() {
	if (translation.value != null) return;
	translating.value = true;
	translation.value = await translate_(
		appearNote.value.id,
		translateLang || lang || navigator.language,
	);

	// use UI language as the second translation language
	if (
		translateLang != null &&
		lang != null &&
		translateLang !== lang &&
		(!translation.value ||
			translation.value.sourceLang.toLowerCase() ===
				translateLang.slice(0, 2))
	)
		translation.value = await translate_(appearNote.value.id, lang);
	translating.value = false;
}

const keymap = {
	r: () => reply(true),
	"e|a|plus": () => react(true),
	q: () => renoteButton.value.renote(true),
	"up|k": focusBefore,
	"down|j": focusAfter,
	esc: blur,
	"m|o": () => menu(true),
	s: () => showContent.value !== showContent.value,
};

useNoteCapture({
	rootEl: el,
	note: appearNote,
	isDeletedRef: isDeleted,
});

function reply(viaKeyboard = false): void {
	pleaseLogin();
	os.post(
		{
			reply: appearNote.value,
			animation: !viaKeyboard,
		},
		() => {
			focus();
		},
	);
}

function react(viaKeyboard = false): void {
	pleaseLogin();
	blur();
	reactionPicker.show(
		reactButton.value,
		(reaction) => {
			os.api("notes/reactions/create", {
				noteId: appearNote.value.id,
				reaction,
			});
		},
		() => {
			focus();
		},
	);
}

function undoReact(note): void {
	const oldReaction = note.myReaction;
	if (!oldReaction) return;
	os.api("notes/reactions/delete", {
		noteId: note.id,
	});
}

const currentClipPage = inject<Ref<entities.Clip> | null>(
	"currentClipPage",
	null,
);

function onContextmenu(ev: MouseEvent): void {
	const isLink = (el: HTMLElement) => {
		if (el.tagName === "A") return true;
		// The Audio element's context menu is the browser default, such as for selecting playback speed.
		if (el.tagName === "AUDIO") return true;
		if (el.parentElement) {
			return isLink(el.parentElement);
		}
	};
	if (isLink(ev.target)) return;
	if (window.getSelection().toString() !== "") return;

	if (defaultStore.state.useReactionPickerForContextMenu) {
		ev.preventDefault();
		react();
	} else {
		os.contextMenu(
			[
				{
					type: "label",
					text: notePage(appearNote.value),
				},
				{
					icon: `${icon("ph-browser")}`,
					text: i18n.ts.openInWindow,
					action: () => {
						os.pageWindow(notePage(appearNote.value));
					},
				},
				notePage(appearNote.value) != location.pathname
					? {
							icon: `${icon("ph-arrows-out-simple")}`,
							text: i18n.ts.showInPage,
							action: () => {
								router.push(
									notePage(appearNote.value),
									"forcePage",
								);
							},
						}
					: undefined,
				null,
				{
					type: "a",
					icon: `${icon("ph-arrow-square-out")}`,
					text: i18n.ts.openInNewTab,
					href: notePage(appearNote.value),
					target: "_blank",
				},
				{
					icon: `${icon("ph-link-simple")}`,
					text: i18n.ts.copyLink,
					action: () => {
						copyToClipboard(`${url}${notePage(appearNote.value)}`);
					},
				},
				appearNote.value.user.host != null
					? {
							type: "a",
							icon: `${icon("ph-arrow-square-up-right")}`,
							text: i18n.ts.showOnRemote,
							href:
								appearNote.value.url ??
								appearNote.value.uri ??
								"",
							target: "_blank",
						}
					: undefined,
			],
			ev,
		);
	}
}

function menu(viaKeyboard = false): void {
	os.popupMenu(
		getNoteMenu({
			note: note.value,
			translating,
			translation,
			menuButton,
			isDeleted,
			currentClipPage,
		}),
		menuButton.value,
		{
			viaKeyboard,
		},
	).then(focus);
}

function showRenoteMenu(viaKeyboard = false): void {
	if (!isMyRenote) return;
	os.popupMenu(
		[
			{
				text: i18n.ts.unrenote,
				icon: `${icon("ph-trash")}`,
				danger: true,
				action: () => {
					os.api("notes/delete", {
						noteId: note.value.id,
					});
					isDeleted.value = true;
				},
			},
		],
		renoteTime.value,
		{
			viaKeyboard,
		},
	);
}

function focus() {
	el.value.focus();
}

function blur() {
	el.value.blur();
}

function focusBefore() {
	focusPrev(el.value);
}

function focusAfter() {
	focusNext(el.value);
}

function scrollIntoView() {
	el.value.scrollIntoView();
}

function noteClick(e) {
	if (
		document.getSelection().type === "Range" ||
		props.detailedView ||
		!expandOnNoteClick
	) {
		e.stopPropagation();
	} else {
		router.push(notePage(appearNote.value));
	}
}

function readPromo() {
	os.api("promo/read", {
		noteId: appearNote.value.id,
	});
	isDeleted.value = true;
}

const postIsExpanded = ref(false);

function setPostExpanded(val: boolean) {
	postIsExpanded.value = val;
}

const accessibleLabel = computed(() => {
	let label = `${appearNote.value.user.username}; `;
	if (appearNote.value.renote) {
		label += `${i18n.t("renoted")} ${appearNote.value.renote.user.username}; `;
		if (appearNote.value.renote.cw) {
			label += `${i18n.t("cw")}: ${appearNote.value.renote.cw}; `;
			if (postIsExpanded.value) {
				label += `${appearNote.value.renote.text}; `;
			}
		} else {
			label += `${appearNote.value.renote.text}; `;
		}
	} else {
		if (appearNote.value.cw) {
			label += `${i18n.t("cw")}: ${appearNote.value.cw}; `;
			if (postIsExpanded.value) {
				label += `${appearNote.value.text}; `;
			}
		} else {
			label += `${appearNote.value.text}; `;
		}
	}
	const date = new Date(appearNote.value.createdAt);
	label += `${date.toLocaleTimeString()}`;
	return label;
});

defineExpose({
	focus,
	blur,
	scrollIntoView,
});
</script>

<style lang="scss" scoped>
.tkcbzcuz {
	position: relative;
	transition: box-shadow 0.1s ease;
	font-size: 1.05em;
	overflow: clip;
	contain: content;
	-webkit-tap-highlight-color: transparent;

	// これらの指定はパフォーマンス向上には有効だが、ノートの高さは一定でないため、
	// 下の方までスクロールすると上のノートの高さがここで決め打ちされたものに変化し、表示しているノートの位置が変わってしまう
	// ノートがマウントされたときに自身の高さを取得し contain-intrinsic-size を設定しなおせばほぼ解決できそうだが、
	// 今度はその処理自体がパフォーマンス低下の原因にならないか懸念される。また、被リアクションでも高さは変化するため、やはり多少のズレは生じる
	// 一度レンダリングされた要素はブラウザがよしなにサイズを覚えておいてくれるような実装になるまで待った方が良さそう(なるのか？)
	//content-visibility: auto;
	//contain-intrinsic-size: 0 128px;

	&:focus-visible {
		outline: none;

		&:after {
			content: "";
			pointer-events: none;
			display: block;
			position: absolute;
			z-index: 10;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			margin: auto;
			width: calc(100% - 8px);
			height: calc(100% - 8px);
			border: solid 1px var(--focus);
			border-radius: var(--radius);
			box-sizing: border-box;
		}
	}

	& > .article > .main {
		&:hover,
		&:focus-within {
			:deep(.footer .button) {
				opacity: 1;
			}
		}
	}

	> .reply-to {
		& + .note-context {
			.line::before {
				content: "";
				display: block;
				margin-bottom: -4px;
				margin-top: 16px;
				border-left: 2px solid currentColor;
				margin-left: calc((var(--avatarSize) / 2) - 1px);
				opacity: 0.25;
			}
		}
	}

	.note-context {
		position: relative;
		padding: 0 32px 0 32px;
		display: flex;
		z-index: 1;
		&:first-child {
			margin-top: 20px;
		}
		> :not(.line) {
			width: 0;
			flex-grow: 1;
			position: relative;
			line-height: 28px;
		}
		> .line {
			position: relative;
			z-index: 2;
			width: 0;
			display: flex;
			margin-right: 0;
			margin-top: 0;
			flex-grow: 0;
			pointer-events: none;
		}

		> div > i {
			margin-left: -0.5px;
		}
		> .info {
			display: flex;
			align-items: center;
			font-size: 90%;
			white-space: pre;
			color: #f6c177;

			> i {
				margin-right: 4px;
			}

			> .hide {
				margin-left: auto;
				color: inherit;
			}
		}

		> .renote {
			display: flex;
			align-items: center;
			white-space: pre;
			color: var(--renote);
			cursor: pointer;

			> i {
				margin-right: 4px;
			}

			> span {
				overflow: hidden;
				flex-shrink: 1;
				text-overflow: ellipsis;
				white-space: nowrap;

				> .name {
					font-weight: bold;
				}
			}

			> .info {
				margin-left: auto;
				font-size: 0.9em;
				display: flex;

				> .time {
					flex-shrink: 0;
					color: inherit;
					display: inline-flex;
					align-items: center;
					> .dropdownIcon {
						margin-right: 4px;
					}
				}
			}
		}

		&.collapsedReply {
			.line {
				opacity: 0.25;
				&::after {
					content: "";
					position: absolute;
					border-left: 2px solid currentColor;
					border-top: 2px solid currentColor;
					margin-left: calc(var(--avatarSize) / 2 - 1px);
					width: calc(var(--avatarSize) / 2 + 14px);
					border-top-left-radius: calc(var(--avatarSize) / 4);
					top: calc(50% - 1px);
					height: calc(50% + 5px);
				}
			}
			.info {
				color: var(--fgTransparentWeak);
				transition: color 0.2s;
			}
			.avatar {
				width: 1.2em;
				height: 1.2em;
				border-radius: 2em;
				overflow: hidden;
				margin-right: 0.4em;
				background: var(--panelHighlight);
			}
			.username {
				font-weight: 700;
				flex-shrink: 0;
				max-width: 30%;
				&::after {
					content: ": ";
				}
			}
			&:hover,
			&:focus-within {
				.info {
					color: var(--fg);
				}
			}
		}
	}

	> .article {
		position: relative;
		overflow: clip;
		padding: 20px 32px 10px;
		margin-top: -16px;

		&:first-child,
		&:nth-child(2) {
			margin-top: -100px;
			padding-top: 104px;
		}

		@media (pointer: coarse) {
			cursor: default;
		}

		.header-container {
			display: flex;
			position: relative;
			z-index: 2;
			> .avatar {
				flex-shrink: 0;
				display: block;
				margin: 0 14px 0 0;
				width: var(--avatarSize);
				height: var(--avatarSize);
				position: relative;
				top: 0;
				left: 0;
			}
			> .header {
				width: 0;
				flex-grow: 1;
			}
		}
		> .main {
			flex: 1;
			min-width: 0;

			> .body {
				margin-top: 0.7em;
				> .translation {
					border: solid 0.5px var(--divider);
					border-radius: var(--radius);
					padding: 12px;
					margin-top: 8px;
				}
				> .renote {
					padding-top: 8px;
					> * {
						padding: 16px;
						border: solid 1px var(--renote);
						border-radius: 8px;
						transition: background 0.2s;
						&:hover,
						&:focus-within {
							background-color: var(--panelHighlight);
						}
					}
				}
			}
			> .info {
				display: flex;
				justify-content: space-between;
				flex-wrap: wrap;
				gap: 0.7em;
				margin-top: 16px;
				opacity: 0.7;
				font-size: 0.9em;
			}
			> .footer {
				position: relative;
				z-index: 2;
				display: flex;
				flex-wrap: wrap;
				margin-top: 0.4em;
				> :deep(.button) {
					position: relative;
					margin: 0;
					padding: 8px;
					opacity: 0.7;
					&:disabled {
						opacity: 0.3 !important;
					}
					flex-grow: 1;
					max-width: 3.5em;
					width: max-content;
					min-width: max-content;
					height: auto;
					transition: opacity 0.2s;
					&::before {
						content: "";
						position: absolute;
						inset: 0;
						bottom: 2px;
						background: var(--panel);
						z-index: -1;
						transition: background 0.2s;
					}
					&:first-of-type {
						margin-left: -0.5em;
						&::before {
							border-radius: 100px 0 0 100px;
						}
					}
					&:last-of-type {
						&::before {
							border-radius: 0 100px 100px 0;
						}
					}
					&:hover {
						color: var(--fgHighlighted);
					}

					> i {
						display: inline !important;
					}

					> .count {
						display: inline;
						margin: 0 0 0 8px;
						opacity: 0.7;
					}

					&.reacted {
						color: var(--accent);
					}
				}
			}
		}
	}

	> .reply {
		border-top: solid 0.5px var(--divider);
	}

	&.max-width_500px {
		font-size: 0.975em;
		--avatarSize: 46px;
		padding-top: 6px;
		> .note-context {
			padding-inline: 16px;
			margin-top: 8px;
			> :not(.line) {
				margin-top: 0px;
			}
			> .line {
				margin-right: 0;
				&::before {
					margin-top: 8px;
				}
			}
		}
		> .article {
			padding: 18px 16px 8px;
			&:first-child,
			&:nth-child(2) {
				padding-top: 104px;
			}
			> .main > .header-container > .avatar {
				margin-right: 10px;
				// top: calc(14px + var(--stickyTop, 0px));
			}
		}
	}

	&.max-width_300px {
		--avatarSize: 40px;
	}
}

.muted {
	padding: 8px;
	text-align: center;
	opacity: 0.7;
	width: 100%;

	._blur_text {
		pointer-events: auto;
	}
	&:active ._blur_text {
		filter: blur(0px);
	}
}
</style>
