<template>
	<p v-if="note.cw != null" class="cw">
		<MkA
			v-if="conversation && note.renoteId == parentId"
			:to="
				detailedView ? `#${parentId}` : `${notePage(note)}#${parentId}`
			"
			behavior="browser"
			class="reply-icon"
			@click.stop
		>
			<i :class="icon('ph-quotes')"></i>
		</MkA>
		<MkA
			v-else-if="!detailed && note.replyId"
			v-tooltip="i18n.ts.jumpToPrevious"
			:to="
				detailedView
					? `#${note.replyId}`
					: `${notePage(note)}#${note.replyId}`
			"
			behavior="browser"
			class="reply-icon"
			@click.stop
		>
			<i :class="icon('ph-arrow-bend-left-up')"></i>
		</MkA>
		<Mfm
			v-if="note.cw != ''"
			class="text"
			:text="note.cw"
			:author="note.user"
			:lang="note.lang"
			:i="me"
			:custom-emojis="note.emojis"
		/>
	</p>
	<div class="wrmlmaau">
		<div
			class="content"
			:class="{
				collapsed,
				isLong,
				manyImages: note.files.length > 4,
				showContent: note.cw && !showContent,
				animatedMfm: !disableMfm,
			}"
		>
			<XShowMoreButton
				v-if="isLong && collapsed"
				ref="showMoreButton"
				v-model="collapsed"
				@keydown="focusFooter"
			></XShowMoreButton>
			<XCwButton
				v-if="note.cw && !showContent"
				ref="cwButton"
				v-model="showContent"
				:note="note"
				@keydown="focusFooter"
				@update:model-value="(val) => emit('expanded', val)"
			/>
			<div
				class="body"
				v-bind="{
					'aria-hidden': note.cw && !showContent ? 'true' : null,
					tabindex: !showContent ? '-1' : null,
				}"
			>
				<span v-if="note.deletedAt" style="opacity: 0.5"
					>({{ i18n.ts.deleted }})</span
				>
				<template v-if="!note.cw">
					<MkA
						v-if="conversation && note.renoteId == parentId"
						:to="
							detailedView
								? `#${parentId}`
								: `${notePage(note)}#${parentId}`
						"
						behavior="browser"
						class="reply-icon"
						@click.stop
					>
						<i :class="icon('ph-quotes')"></i>
					</MkA>
					<MkA
						v-else-if="!detailed && note.replyId"
						v-tooltip="i18n.ts.jumpToPrevious"
						:to="
							detailedView
								? `#${note.replyId}`
								: `${notePage(note)}#${note.replyId}`
						"
						behavior="browser"
						class="reply-icon"
						@click.stop
					>
						<i :class="icon('ph-arrow-bend-left-up')"></i>
					</MkA>
				</template>
				<Mfm
					v-if="note.text"
					:text="note.text"
					:author="note.user"
					:i="me"
					:lang="note.lang"
					:custom-emojis="note.emojis"
				/>
				<MkA
					v-if="!detailed && note.renoteId"
					class="rp"
					:to="`/notes/${note.renoteId}`"
					>{{ i18n.ts.quoteAttached }}: ...</MkA
				>
				<XMediaList
					v-if="note.files.length > 0"
					:media-list="note.files"
				/>
				<XPoll v-if="note.poll" :note="note" class="poll" />
				<template v-if="detailed">
					<MkUrlPreview
						v-for="url in urls"
						:key="url"
						:url="url"
						:compact="true"
						:detail="false"
						class="url-preview"
					/>
					<div
						v-if="note.renote"
						class="renote"
						@click.stop="emit('push', note.renote)"
					>
						<XNoteSimple :note="note.renote" />
					</div>
				</template>
				<div
					v-if="
						(note.cw && !showContent) ||
						(showMoreButton && collapsed)
					"
					tabindex="0"
					@focus="
						cwButton?.focus();
						showMoreButton?.focus();
					"
				></div>
			</div>
			<XShowMoreButton
				v-if="isLong && !collapsed"
				v-model="collapsed"
			></XShowMoreButton>
			<XCwButton
				v-if="note.cw && showContent"
				v-model="showContent"
				:note="note"
			/>
		</div>
		<MkButton
			v-if="hasMfm && defaultStore.state.animatedMfm"
			mini
			rounded
			@click.stop="toggleMfm"
		>
			<template v-if="disableMfm">
				<i :class="icon('ph-play', false)"></i>
				{{ i18n.ts._mfm.play }}
			</template>
			<template v-else>
				<i :class="icon('ph-stop', false)"></i>
				{{ i18n.ts._mfm.stop }}
			</template>
		</MkButton>
		<!-- <div
			v-if="(isLong && !collapsed) || (props.note.cw && showContent)"
			class="fade"
		></div> -->
	</div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { entities } from "firefish-js";
import * as mfm from "mfm-js";
import * as os from "@/os";
import XNoteSimple from "@/components/MkNoteSimple.vue";
import XMediaList from "@/components/MkMediaList.vue";
import XPoll from "@/components/MkPoll.vue";
import MkUrlPreview from "@/components/MkUrlPreview.vue";
import XShowMoreButton from "@/components/MkShowMoreButton.vue";
import XCwButton from "@/components/MkCwButton.vue";
import MkButton from "@/components/MkButton.vue";
import { notePage } from "@/filters/note";
import { extractUrlFromMfm } from "@/scripts/extract-url-from-mfm";
import { extractMfmWithAnimation } from "@/scripts/extract-mfm";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import icon from "@/scripts/icon";

const props = defineProps<{
	note: entities.Note;
	parentId?;
	conversation?;
	detailed?: boolean;
	detailedView?: boolean;
}>();

const emit = defineEmits<{
	(ev: "push", v): void;
	(ev: "focusfooter"): void;
	(ev: "expanded", v): void;
}>();

const cwButton = ref<HTMLElement>();
const showMoreButton = ref<HTMLElement>();

const isLong =
	!props.detailedView &&
	props.note.cw == null &&
	((props.note.text != null &&
		(props.note.text.split("\n").length > 10 ||
			props.note.text.length > 800)) ||
		props.note.files.length > 4);
const collapsed = ref(props.note.cw == null && isLong);
const urls = props.note.text
	? extractUrlFromMfm(mfm.parse(props.note.text)).slice(0, 5)
	: null;

const showContent = ref(false);

const mfms = props.note.text
	? extractMfmWithAnimation(mfm.parse(props.note.text))
	: null;

const hasMfm = ref(mfms && mfms.length > 0);

const disableMfm = ref(defaultStore.state.animatedMfm);

async function toggleMfm() {
	if (disableMfm.value) {
		if (!defaultStore.state.animatedMfmWarnShown) {
			const { canceled } = await os.confirm({
				type: "warning",
				text: i18n.ts._mfm.warn,
			});
			if (canceled) return;

			defaultStore.set("animatedMfmWarnShown", true);
		}

		disableMfm.value = false;
	} else {
		disableMfm.value = true;
	}
}

function focusFooter(ev) {
	if (ev.key == "Tab" && !ev.getModifierState("Shift")) {
		emit("focusfooter");
	}
}
</script>

<style lang="scss" scoped>
:deep(a),
:deep(button) {
	position: relative;
	z-index: 2;
}
.reply-icon {
	display: inline-block;
	border-radius: 6px;
	padding: 0.2em 0.2em;
	margin-right: 0.2em;
	color: var(--accent);
	transition: background 0.2s;
	&:hover,
	&:focus {
		background: var(--buttonHoverBg);
	}
}
.cw {
	cursor: default;
	display: block;
	margin: 0;
	padding: 0;
	margin-bottom: 10px;
	overflow-wrap: break-word;
	> .text {
		margin-right: 8px;
	}
}

.wrmlmaau {
	.content {
		overflow-wrap: break-word;
		> .body {
			transition: filter 0.1s;
			> .rp {
				margin-left: 4px;
				font-style: oblique;
				color: var(--renote);
			}
			.reply-icon {
				display: inline-block;
				border-radius: 6px;
				padding: 0.2em 0.2em;
				margin-right: 0.2em;
				color: var(--accent);
				transition: background 0.2s;
				&:hover,
				&:focus {
					background: var(--buttonHoverBg);
				}
			}
			> :deep(.files) {
				margin-top: 0.4em;
				margin-bottom: 0.4em;
			}
			> .url-preview {
				margin-top: 8px;
			}

			> .poll {
				font-size: 80%;
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

		&.collapsed,
		&.showContent {
			position: relative;
			max-height: calc(15em + 100px);
			> .body {
				max-height: inherit;
				mask: linear-gradient(black calc(100% - 64px), transparent);
				-webkit-mask: linear-gradient(
					black calc(100% - 64px),
					transparent
				);
				padding-inline: 100px;
				margin-inline: -100px;
				margin-top: -100px;
				padding-top: 100px;
				overflow: hidden;
				user-select: none;
				-webkit-user-select: none;
				-moz-user-select: none;
			}
		}
		&.collapsed {
			&.manyImages {
				max-height: calc(15em + 250px);
			}
			> .body {
				box-sizing: border-box;
			}
		}
		&.showContent {
			> .body {
				min-height: 2em;
				max-height: 5em;
				filter: blur(4px);
				:deep(span) {
					animation: none !important;
					transform: none !important;
				}
				:deep(img) {
					filter: blur(12px);
				}
			}
			:deep(.fade) {
				inset: 0;
				top: 90px;
			}
		}

		&:not(.animatedMfm) :deep(span) {
			animation: none !important;
		}
	}
	> :deep(button) {
		margin-top: 10px;
		margin-left: 0;
		margin-right: 0.4rem;
	}
	> .fade {
		position: absolute;
		inset: 0;
		bottom: -400px;
		display: flex;
		align-items: flex-end;
		z-index: 4;
		pointer-events: none;
		&::before {
			content: "";
			display: block;
			height: 100px;
			position: sticky;
			bottom: 0;
			width: 100%;
			background: var(--panel);
			mask: linear-gradient(to top, var(--gradient));
			-webkit-mask: linear-gradient(to top, var(--gradient));
			transition: background 0.2s;
		}
	}
}
</style>
