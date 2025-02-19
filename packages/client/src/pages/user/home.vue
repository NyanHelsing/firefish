<template>
	<MkSpacer :content-max="narrow ? 800 : 1100">
		<div
			ref="rootEl"
			v-size="{ max: [500] }"
			class="ftskorzw"
			:class="{ wide: !narrow }"
		>
			<div class="main">
				<div class="profile">
					<MkMoved
						v-if="user.movedToUri"
						:host="user.movedToUri.host"
						:acct="user.movedToUri.username"
					/>
					<MkRemoteCaution
						v-if="user.host != null"
						:href="user.url"
						class="warn"
					/>

					<div :key="user.id" class="_block main">
						<div class="banner-container">
							<div
								ref="bannerEl"
								class="banner"
								:style="{
									backgroundImage: `url('${user.bannerUrl}')`,
									'--backgroundImageStatic':
										defaultStore.state.useBlurEffect &&
										user.bannerUrl
											? `url('${getStaticImageUrl(
													user.bannerUrl,
												)}')`
											: null,
								}"
							></div>
							<div class="fade"></div>
							<div class="title">
								<div class="nameColumn">
									<MkUserName
										class="name"
										:user="user"
										:nowrap="true"
									/>
									<div v-if="isModerator">
										<span
											v-if="user.isSilenced"
											style="
												color: var(--warn);
												padding: 5px;
											"
										>
											<i :class="icon('ph-warning')"></i>
											{{ i18n.ts.silenced }}
										</span>
										<span
											v-if="user.isSuspended"
											style="
												color: var(--error);
												padding: 5px;
											"
										>
											<i :class="icon('ph-warning')"></i>
											{{ i18n.ts.suspended }}
										</span>
									</div>
									<span
										v-if="
											isSignedIn &&
											me.id !== user.id &&
											user.isFollowed
										"
										class="followed"
										>{{ i18n.ts.followsYou }}</span
									>
								</div>
								<div class="bottom">
									<span class="username"
										><MkAcct :user="user" :detail="true"
									/></span>
									<span
										v-if="user.isAdmin"
										v-tooltip.noDelay="i18n.ts.isAdmin"
										style="color: var(--badge)"
										><i :class="icon('ph-crown')"></i
									></span>
									<span
										v-if="!user.isAdmin && user.isModerator"
										v-tooltip.noDelay="i18n.ts.isModerator"
										style="color: var(--badge)"
										><i :class="icon('ph-gavel')"></i
									></span>
									<span
										v-if="user.isLocked"
										v-tooltip.noDelay="i18n.ts.isLocked"
										><i :class="icon('ph-lock')"></i
									></span>
									<span
										v-if="user.isBot"
										v-tooltip.noDelay="i18n.ts.isBot"
										><i :class="icon('ph-robot')"></i
									></span>
									<span
										v-if="
											patrons?.includes(
												`@${user.username}@${
													user.host || host
												}`,
											)
										"
										v-tooltip.noDelay="i18n.ts.isPatron"
										style="color: var(--badge)"
										><i :class="icon('ph-hand-coins')"></i
									></span>
								</div>
							</div>
						</div>
						<MkAvatar
							class="avatar"
							:show-light-box="true"
							:user="user"
							:disable-preview="true"
							:show-indicator="true"
						/>
						<div class="title">
							<div class="nameColumn">
								<MkUserName
									class="name"
									:user="user"
									:nowrap="true"
								/>
								<span
									v-if="
										isSignedIn &&
										me.id !== user.id &&
										user.isFollowed
									"
									class="followed"
									>{{ i18n.ts.followsYou }}</span
								>
								<div v-if="isModerator">
									<span
										v-if="user.isSilenced"
										style="color: var(--warn); padding: 5px"
									>
										<i :class="icon('ph-warning')"></i>
										{{ i18n.ts.silenced }}
									</span>
									<span
										v-if="user.isSuspended"
										style="
											color: var(--error);
											padding: 5px;
										"
									>
										<i :class="icon('ph-warning')"></i>
										{{ i18n.ts.suspended }}
									</span>
								</div>
							</div>
							<div class="bottom">
								<span class="username"
									><MkAcct :user="user" :detail="true"
								/></span>
								<span
									v-if="user.isAdmin"
									v-tooltip.noDelay="i18n.ts.isAdmin"
									style="color: var(--badge)"
									><i :class="icon('ph-crown')"></i
								></span>
								<span
									v-if="!user.isAdmin && user.isModerator"
									v-tooltip.noDelay="i18n.ts.isModerator"
									style="
										color: var(--badge);
										margin-left: 0.5rem;
									"
									><i :class="icon('ph-gavel')"></i
								></span>
								<span
									v-if="user.isLocked"
									v-tooltip.noDelay="i18n.ts.isLocked"
									><i :class="icon('ph-lock')"></i
								></span>
								<span
									v-if="user.isBot"
									v-tooltip.noDelay="i18n.ts.isBot"
									><i :class="icon('ph-robot')"></i
								></span>
								<span
									v-if="
										patrons?.includes(
											`@${user.username}@${
												user.host || host
											}`,
										)
									"
									v-tooltip.noDelay="i18n.ts.isPatron"
									style="color: var(--badge)"
									><i :class="icon('ph-hand-coins')"></i
								></span>
							</div>
						</div>
						<div class="follow-container">
							<div class="actions">
								<MkFollowButton
									:user="user"
									:inline="true"
									:transparent="false"
									:full="true"
									:hide-follow-button="hideFollowButton"
									class="koudoku"
									@refresh="emit('refresh')"
								/>
							</div>
						</div>
						<div class="description">
							<Mfm
								v-if="user.description"
								:text="user.description"
								:is-note="false"
								:author="user"
								:i="me"
								:custom-emojis="user.emojis"
							/>
							<p v-else class="empty">
								{{ i18n.ts.noAccountDescription }}
							</p>
						</div>
						<div class="fields system">
							<dl v-if="user.location" class="field">
								<dt class="name">
									<i :class="icon('ph-map-pin ph-fw')"></i>
									{{ i18n.ts.location }}
								</dt>
								<dd class="value">
									{{ user.location }}{{ timeForThem }}
								</dd>
							</dl>
							<dl v-if="user.birthday" class="field">
								<dt class="name">
									<i :class="icon('ph-cake ph-fw')"></i>
									{{ i18n.ts.birthday }}
								</dt>
								<dd class="value">
									{{
										user.birthday
											.replace("-", "/")
											.replace("-", "/")
									}}
									({{ i18n.t("yearsOld", { age }) }})
								</dd>
							</dl>
							<dl class="field">
								<dt class="name">
									<i
										:class="icon('ph-calendar-blank ph-fw')"
									></i>
									{{ i18n.ts.registeredDate }}
								</dt>
								<dd class="value">
									{{
										new Date(
											user.createdAt,
										).toLocaleString()
									}}
									(<MkTime :time="user.createdAt" />)
								</dd>
							</dl>
						</div>
						<div v-if="user.fields.length > 0" class="fields">
							<dl
								v-for="(field, i) in user.fields"
								:key="i"
								:class="field.verified ? 'verified' : ''"
								class="field"
							>
								<dt class="name">
									<i
										v-if="field.verified"
										v-tooltip="i18n.ts.verifiedLink"
										:class="icon('ph-seal-check ph-fw')"
										style="padding: 5px"
									></i>
									<Mfm
										:text="field.name"
										:plain="true"
										:custom-emojis="user.emojis"
										:colored="false"
									/>
								</dt>
								<dd class="value">
									<Mfm
										:text="field.value"
										:author="user"
										:i="me"
										:custom-emojis="user.emojis"
										:colored="false"
									/>
								</dd>
							</dl>
						</div>
						<div class="status">
							<MkA
								v-click-anime
								:to="userPage(user)"
								:class="{ active: page === 'index' }"
							>
								<b>{{ number(user.notesCount) }}</b>
								<span>{{ i18n.ts.notes }}</span>
							</MkA>
							<MkA
								v-if="user.followingCount != null"
								v-click-anime
								:to="userPage(user, 'following')"
								:class="{ active: page === 'following' }"
							>
								<b>{{ number(user.followingCount) }}</b>
								<span>{{ i18n.ts.following }}</span>
							</MkA>
							<MkA
								v-if="user.followersCount != null"
								v-click-anime
								:to="userPage(user, 'followers')"
								:class="{ active: page === 'followers' }"
							>
								<b>{{ number(user.followersCount) }}</b>
								<span>{{ i18n.ts.followers }}</span>
							</MkA>
						</div>
					</div>
				</div>

				<div class="contents _gap">
					<div v-if="user.pinnedNotes.length > 0" class="_gap">
						<XNote
							v-for="note in user.pinnedNotes"
							:key="note.id"
							class="note _block"
							:note="note"
							:pinned="true"
						/>
					</div>
					<MkInfo
						v-else-if="isSignedIn && me.id === user.id"
						style="margin: 12px 0"
						>{{ i18n.ts.userPagePinTip }}</MkInfo
					>
					<template v-if="narrow">
						<XPhotos :key="user.id" :user="user" />
					</template>
				</div>
				<div>
					<XUserTimeline :user="user" />
				</div>
			</div>
			<div v-if="!narrow" class="sub">
				<XPhotos :key="user.id" :user="user" />
			</div>
		</div>
	</MkSpacer>
</template>

<script lang="ts" setup>
import {
	computed,
	defineAsyncComponent,
	onMounted,
	onUnmounted,
	ref,
} from "vue";
import calcAge from "s-age";
import cityTimezones from "city-timezones";
import type { entities } from "firefish-js";
import XUserTimeline from "./index.timeline.vue";
import XNote from "@/components/MkNote.vue";
import MkFollowButton from "@/components/MkFollowButton.vue";
import MkRemoteCaution from "@/components/MkRemoteCaution.vue";
import MkInfo from "@/components/MkInfo.vue";
import MkMoved from "@/components/MkMoved.vue";
import { getScrollPosition } from "@/scripts/scroll";
import { getStaticImageUrl } from "@/scripts/get-static-image-url";
import number from "@/filters/number";
import { userPage } from "@/filters/user";
import { defaultStore } from "@/store";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { isModerator, isSignedIn, me } from "@/me";
import { host } from "@/config";
import icon from "@/scripts/icon";

const XPhotos = defineAsyncComponent(() => import("./index.photos.vue"));

const hideFollowButton = defaultStore.state.hideFollowButtons;

const emit = defineEmits(["refresh"]);
const props = withDefaults(
	defineProps<{
		user: entities.UserDetailed;
	}>(),
	{},
);

const parallaxAnimationId = ref<null | number>(null);
const narrow = ref<null | boolean>(null);
const rootEl = ref<null | HTMLElement>(null);
const bannerEl = ref<null | HTMLElement>(null);
const patrons = ref([]);

const age = computed(() => {
	return calcAge(props.user.birthday);
});

const timeForThem = computed(() => {
	const maybeCityNames = [
		props.user.location!,
		props.user
			.location!.replace(
				/[^A-Za-z0-9ÁĆÉǴÍḰĹḾŃÓṔŔŚÚÝŹáćéǵíḱĺḿńóṕŕśúýź\-\'\.\s].*/,
				"",
			)
			.trim(),
		props.user.location!.replace(
			/[^A-Za-zÁĆÉǴÍḰĹḾŃÓṔŔŚÚÝŹáćéǵíḱĺḿńóṕŕśúýź\-\'\.].*/,
			"",
		),
		props.user.location!.replace(
			/[^A-Za-zÁĆÉǴÍḰĹḾŃÓṔŔŚÚÝŹáćéǵíḱĺḿńóṕŕśúýź].*/,
			"",
		),
	];

	for (const city of maybeCityNames) {
		const tzInfo = cityTimezones.lookupViaCity(city);
		if (tzInfo.length !== 1) continue;

		const tz = tzInfo[0].timezone;
		if (!tz) continue;

		const theirTime = new Date().toLocaleString("en-US", {
			timeZone: tz,
			hour12: false,
		});
		return ` (${theirTime
			.split(",")[1]
			.trim()
			.split(":")[0]
			.replace("24", "0")}:${theirTime.split(" ")[1].slice(-5, -3)})`;
	}

	return "";
});

const patronsResp = await os.api("patrons");
patrons.value = patronsResp.patrons;

function parallaxLoop() {
	parallaxAnimationId.value = window.requestAnimationFrame(parallaxLoop);
	parallax();
}

function parallax() {
	const banner = bannerEl.value as any;
	if (banner == null) return;

	const top = getScrollPosition(rootEl.value);

	if (top < 0) return;

	const z = 1.75; // 奥行き(小さいほど奥)
	const pos = -(top / z);
	banner.style.backgroundPosition = `center calc(50% - ${pos}px)`;
}

onMounted(() => {
	window.requestAnimationFrame(parallaxLoop);
	narrow.value = rootEl.value!.clientWidth < 1000;
});

onUnmounted(() => {
	if (parallaxAnimationId.value) {
		window.cancelAnimationFrame(parallaxAnimationId.value);
	}
});
</script>

<style lang="scss" scoped>
.ftskorzw {
	> .main {
		> .profile {
			> .main {
				position: relative;
				overflow: hidden;

				> .banner-container {
					position: relative;
					height: 250px;
					overflow: hidden;
					background-size: cover;
					background-position: center;
					> .banner {
						height: 100%;
						background-color: #26233a;
						background-size: cover;
						background-position: center;
						box-shadow: 0 0 128px var(--shadow) inset;
						will-change: background-position;
						&::before {
							content: "";
							position: fixed;
							inset: 0;
							background: var(--backgroundImageStatic);
							background-size: cover;
							background-position: center;
							pointer-events: none;
							filter: blur(12px) opacity(0.1);
						}
					}

					> .fade {
						position: absolute;
						bottom: 0;
						left: 0;
						width: 100%;
						height: 78px;
						background: linear-gradient(
							transparent,
							rgba(#000, 0.7)
						);
					}

					> .followed {
						position: absolute;
						top: 10px;
						left: 120px;
						padding: 4px 8px;
						color: #fff;
						background: var(--accent);
						font-size: 1em;
						border-radius: 6px;
					}

					> .title {
						position: absolute;
						bottom: 0;
						left: 0;
						width: 100%;
						padding: 0 0 8px 154px;
						box-sizing: border-box;
						color: #fff;

						> .nameColumn {
							display: block;
							> .name {
								margin: 0;
								line-height: 32px;
								font-weight: bold;
								font-size: 1.8em;
								text-shadow: 0 0 8px var(--shadow);
							}

							> .followed {
								position: relative;
								top: -4px;
								left: 4px;
								padding: 4px 8px;
								color: #fff;
								background: var(--accent);
								font-size: 1em;
								border-radius: 24px;
							}
						}

						> .bottom {
							> * {
								display: inline-block;
								margin-right: 16px;
								line-height: 20px;
								opacity: 0.8;

								&.username {
									font-weight: bold;
								}
							}
						}
					}
				}

				> .follow-container {
					position: relative;
					height: 60px;
					overflow: hidden;
					background-size: cover;
					background-position: center;
					z-index: 100;

					> .fade {
						position: absolute;
						bottom: 0;
						left: 0;
						width: 100%;
						height: 78px;
						background: linear-gradient(
							transparent,
							rgba(#000, 0.7)
						);
					}

					> .actions {
						position: absolute;
						top: 6px;
						right: 12px;
						padding: 8px;
						border-radius: 24px;
						display: flex;
						justify-content: center;
						align-items: center;
					}

					> .title {
						position: absolute;
						bottom: 0;
						left: 0;
						width: 100%;
						padding: 0 0 8px 154px;
						box-sizing: border-box;
						color: #fff;

						> .name {
							display: block;
							margin: 0;
							line-height: 32px;
							font-weight: bold;
							font-size: 1.8em;
							text-shadow: 0 0 8px var(--shadow);
						}

						> .bottom {
							> * {
								display: inline-block;
								margin-right: 16px;
								line-height: 20px;
								opacity: 0.8;

								&.username {
									font-weight: bold;
								}
							}
						}
					}
				}

				> .title {
					display: none;
					text-align: center;
					padding: 50px 8px 16px 8px;
					font-weight: bold;
					border-bottom: solid 0.5px var(--divider);

					> .nameColumn {
						display: block;
						> .name {
							margin: 0;
							align-content: center;
							line-height: 32px;
							font-weight: bold;
							font-size: 1.8em;
							text-shadow: 0 0 8px var(--shadow);
						}

						> .followed {
							position: relative;
							top: -4px;
							left: 4px;
							padding: 4px 8px;
							color: #fff;
							background: var(--accent);
							font-size: 1em;
							border-radius: 24px;
						}
					}

					> .followedWindow {
						position: relative;
						top: -25px;
						left: 80px;
						padding: 4px 8px;
						color: #fff;
						background: rgba(0, 0, 0, 0.6);
						font-size: 0.7em;
						border-radius: 24px;
					}

					> .bottom {
						> * {
							display: inline-block;
							margin-right: 8px;
							opacity: 0.8;
						}
					}
				}

				> .avatar {
					display: block;
					position: absolute;
					top: 170px;
					left: 16px;
					z-index: 2;
					width: 120px;
					height: 120px;
					box-shadow: 1px 1px 3px rgba(#000, 0.2);
				}

				> .description {
					padding: 72px 12px 2px 24px;
					font-size: 0.95em;
					top: -65px;
					position: relative;

					> .empty {
						margin: 0;
						opacity: 0.5;
					}
				}

				> .fields {
					padding: 24px;
					font-size: 0.9em;
					border-top: solid 0.5px var(--divider);

					> .field {
						display: flex;
						padding: 0;
						margin: 0;
						align-items: center;

						&:not(:last-child) {
							margin-bottom: 8px;
						}

						&.verified {
							background-color: var(--hover);
							border-radius: 10px;
							color: var(--badge) !important;
						}

						> .name {
							width: 30%;
							overflow: hidden;
							white-space: nowrap;
							text-overflow: ellipsis;
							font-weight: bold;
							text-align: center;
						}

						> .value {
							width: 70%;
							overflow: hidden;
							white-space: nowrap;
							text-overflow: ellipsis;
							margin: 0;
						}
					}
				}

				> .status {
					display: flex;
					padding: 24px;
					border-top: solid 0.5px var(--divider);

					> a {
						flex: 1;
						text-align: center;

						&.active {
							color: var(--accent);
						}

						&:hover {
							text-decoration: none;
						}

						> b {
							display: block;
							line-height: 16px;
						}

						> span {
							font-size: 70%;
						}
					}
				}
			}
		}

		> .contents {
			> .content {
				margin-bottom: var(--margin);
			}
		}
	}

	&.max-width_500px {
		> .main {
			> .profile > .main {
				> .banner-container {
					height: 140px;

					> .fade {
						display: none;
					}

					> .title {
						display: none;
					}
				}

				> .title {
					display: block;
					border-bottom: 0;
					padding-bottom: 0;
					> .bottom {
						> .username {
							margin-right: 0;
						}
					}
				}

				> .avatar {
					top: 90px;
					left: 0;
					right: 0;
					width: 92px;
					height: 92px;
					margin: auto;
				}

				> .description {
					padding: 16px;
					text-align: center;
				}

				> .fields {
					padding: 16px;
				}

				> .status {
					padding: 16px;
				}

				> .description {
					top: 0;
					position: relative;
				}

				> .follow-container {
					overflow: visible !important;
					display: flex;
					justify-content: center;
					height: auto;
					border-bottom: 1px solid var(--divider);
					padding-bottom: 5px;
					> .actions {
						position: static;
					}
				}
			}

			> .contents {
				> .nav {
					font-size: 80%;
				}
			}
		}
	}

	&.wide {
		display: flex;
		width: 100%;

		> .main {
			width: 100%;
			min-width: 0;
		}

		> .sub {
			max-width: 350px;
			min-width: 350px;
			margin-left: var(--margin);
		}
	}
}
</style>
