<template>
	<div v-if="instance.disableRegistration" style="margin-bottom: 1rem">
		<p>{{ i18n.ts.signupsDisabled }}</p>
	</div>
	<form
		class="qlvuhzng _formRoot"
		autocomplete="new-password"
		@submit.prevent="onSubmit"
	>
		<MkInput
			v-if="instance.disableRegistration"
			v-model="invitationCode"
			class="_formBlock"
			type="text"
			:spellcheck="false"
			required
			data-cy-signup-invitation-code
			@update:modelValue="onChangeInvitationCode"
		>
			<template #label>{{ i18n.ts.invitationCode }}</template>
			<template #prefix><i :class="icon('ph-key')"></i></template>
		</MkInput>
		<div
			v-if="
				!instance.disableRegistration ||
				(instance.disableRegistration && invitationState === 'entered')
			"
		>
			<MkInput
				v-model="username"
				class="_formBlock"
				type="text"
				pattern="^[a-zA-Z0-9_]{1,20}$"
				:spellcheck="false"
				required
				data-cy-signup-username
				@update:modelValue="onChangeUsername"
			>
				<template #label
					>{{ i18n.ts.username }}
					<div
						v-tooltip:dialog="i18n.ts.usernameInfo"
						class="_button _help"
					>
						<i :class="icon('ph-question', false)"></i></div
				></template>
				<template #prefix>@</template>
				<template #suffix>@{{ host }}</template>
				<template #caption>
					<span v-if="usernameState === 'wait'" style="color: #6e6a86"
						><i :class="icon('ph-circle-notch fa-pulse ph-fw')"></i>
						{{ i18n.ts.checking }}</span
					>
					<span
						v-else-if="usernameState === 'ok'"
						style="color: var(--success)"
						><i :class="icon('ph-check ph-fw')"></i>
						{{ i18n.ts.available }}</span
					>
					<span
						v-else-if="usernameState === 'unavailable'"
						style="color: var(--error)"
						><i :class="icon('ph-warning ph-fw')"></i>
						{{ i18n.ts.unavailable }}</span
					>
					<span
						v-else-if="usernameState === 'error'"
						style="color: var(--error)"
						><i :class="icon('ph-warning ph-fw')"></i>
						{{ i18n.ts.error }}</span
					>
					<span
						v-else-if="usernameState === 'invalid-format'"
						style="color: var(--error)"
						><i :class="icon('ph-warning ph-fw')"></i>
						{{ i18n.ts.usernameInvalidFormat }}</span
					>
					<span
						v-else-if="usernameState === 'min-range'"
						style="color: var(--error)"
						><i :class="icon('ph-warning ph-fw')"></i>
						{{ i18n.ts.tooShort }}</span
					>
					<span
						v-else-if="usernameState === 'max-range'"
						style="color: var(--error)"
						><i :class="icon('ph-warning ph-fw')"></i>
						{{ i18n.ts.tooLong }}</span
					>
				</template>
			</MkInput>
			<MkInput
				v-if="instance.emailRequiredForSignup"
				v-model="email"
				class="_formBlock"
				:debounce="true"
				type="email"
				:spellcheck="false"
				required
				data-cy-signup-email
				@update:modelValue="onChangeEmail"
			>
				<template #label
					>{{ i18n.ts.emailAddress }}
					<div
						v-tooltip:dialog="i18n.ts._signup.emailAddressInfo"
						class="_button _help"
					>
						<i :class="icon('ph-question', false)"></i></div
				></template>
				<template #prefix
					><i :class="icon('ph-envelope-simple-open')"></i
				></template>
				<template #caption>
					<span v-if="emailState === 'wait'" style="color: #6e6a86"
						><i :class="icon('ph-circle-notch fa-pulse ph-fw')"></i>
						{{ i18n.ts.checking }}</span
					>
					<span
						v-else-if="emailState === 'ok'"
						style="color: var(--success)"
						><i :class="icon('ph-check ph-fw')"></i>
						{{ i18n.ts.available }}</span
					>
					<span
						v-else-if="emailState === 'unavailable:used'"
						style="color: var(--error)"
						><i :class="icon('ph-warning ph-fw')"></i>
						{{ i18n.ts._emailUnavailable.used }}</span
					>
					<span
						v-else-if="emailState === 'unavailable:format'"
						style="color: var(--error)"
						><i :class="icon('ph-warning ph-fw')"></i>
						{{ i18n.ts._emailUnavailable.format }}</span
					>
					<span
						v-else-if="emailState === 'unavailable:disposable'"
						style="color: var(--error)"
						><i :class="icon('ph-warning ph-fw')"></i>
						{{ i18n.ts._emailUnavailable.disposable }}</span
					>
					<span
						v-else-if="emailState === 'unavailable:mx'"
						style="color: var(--error)"
						><i :class="icon('ph-warning ph-fw')"></i>
						{{ i18n.ts._emailUnavailable.mx }}</span
					>
					<span
						v-else-if="emailState === 'unavailable:smtp'"
						style="color: var(--error)"
						><i :class="icon('ph-warning ph-fw')"></i>
						{{ i18n.ts._emailUnavailable.smtp }}</span
					>
					<span
						v-else-if="emailState === 'unavailable'"
						style="color: var(--error)"
						><i :class="icon('ph-warning ph-fw')"></i>
						{{ i18n.ts.unavailable }}</span
					>
					<span
						v-else-if="emailState === 'error'"
						style="color: var(--error)"
						><i :class="icon('ph-warning ph-fw')"></i>
						{{ i18n.ts.error }}</span
					>
				</template>
			</MkInput>
			<MkInput
				v-model="password"
				class="_formBlock"
				type="password"
				autocomplete="new-password"
				required
				data-cy-signup-password
				@update:modelValue="onChangePassword"
			>
				<template #label>{{ i18n.ts.password }}</template>
				<template #prefix><i :class="icon('ph-lock')"></i></template>
				<template #caption>
					<span
						v-if="passwordStrength == 'low'"
						style="color: var(--error)"
						><i :class="icon('ph-warning ph-fw')"></i>
						{{ i18n.ts.weakPassword }}</span
					>
					<span
						v-if="passwordStrength == 'medium'"
						style="color: var(--warn)"
						><i :class="icon('ph-check ph-fw')"></i>
						{{ i18n.ts.normalPassword }}</span
					>
					<span
						v-if="passwordStrength == 'high'"
						style="color: var(--success)"
						><i :class="icon('ph-check ph-fw')"></i>
						{{ i18n.ts.strongPassword }}</span
					>
				</template>
			</MkInput>
			<MkInput
				v-model="retypedPassword"
				class="_formBlock"
				type="password"
				autocomplete="new-password"
				required
				data-cy-signup-password-retype
				@update:modelValue="onChangePasswordRetype"
			>
				<template #label
					>{{ i18n.ts.password }} ({{ i18n.ts.retype }})</template
				>
				<template #prefix><i :class="icon('ph-lock')"></i></template>
				<template #caption>
					<span
						v-if="passwordRetypeState == 'match'"
						style="color: var(--success)"
						><i :class="icon('ph-check ph-fw')"></i>
						{{ i18n.ts.passwordMatched }}</span
					>
					<span
						v-if="passwordRetypeState == 'not-match'"
						style="color: var(--error)"
						><i :class="icon('ph-warning ph-fw')"></i>
						{{ i18n.ts.passwordNotMatched }}</span
					>
				</template>
			</MkInput>
			<MkSwitch
				v-if="instance.tosUrl"
				v-model="ToSAgreement"
				class="_formBlock tou"
			>
				<I18n :src="i18n.ts.agreeTo">
					<template #0>
						<a
							:href="instance.tosUrl"
							class="_link"
							target="_blank"
							>{{ i18n.ts.tos }}</a
						>
					</template>
				</I18n>
			</MkSwitch>
			<MkCaptcha
				v-if="instance.enableHcaptcha"
				ref="hcaptcha"
				v-model="hCaptchaResponse"
				class="_formBlock captcha"
				provider="hcaptcha"
				:sitekey="instance.hcaptchaSiteKey"
			/>
			<MkCaptcha
				v-if="instance.enableRecaptcha"
				ref="recaptcha"
				v-model="reCaptchaResponse"
				class="_formBlock captcha"
				provider="recaptcha"
				:sitekey="instance.recaptchaSiteKey"
			/>
			<MkButton
				class="_formBlock"
				type="submit"
				:disabled="shouldDisableSubmitting"
				gradate
				data-cy-signup-submit
				>{{ i18n.ts.start }}</MkButton
			>
		</div>
	</form>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

import getPasswordStrength from "syuilo-password-strength";
import { toUnicode } from "punycode/";
import MkButton from "./MkButton.vue";
import MkInput from "./form/input.vue";
import MkSwitch from "./form/switch.vue";
import MkCaptcha from "@/components/MkCaptcha.vue";
import * as config from "@/config";
import * as os from "@/os";
import { signIn } from "@/account";
import { instance } from "@/instance";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

const props = withDefaults(
	defineProps<{
		autoSet?: boolean;
	}>(),
	{
		autoSet: false,
	},
);

const emit = defineEmits<{
	(ev: "signup", user: Record<string, any>): void;
	(ev: "signupEmailPending"): void;
}>();

const host = toUnicode(config.host);

const hcaptcha = ref();
const recaptcha = ref();

const username: string = ref("");
const password: string = ref("");
const retypedPassword: string = ref("");
const invitationCode: string = ref("");
const email = ref("");
const usernameState:
	| null
	| "wait"
	| "ok"
	| "unavailable"
	| "error"
	| "invalid-format"
	| "min-range"
	| "max-range" = ref(null);
const invitationState: null | "entered" = ref(null);
const emailState:
	| null
	| "wait"
	| "ok"
	| "unavailable:used"
	| "unavailable:format"
	| "unavailable:disposable"
	| "unavailable:mx"
	| "unavailable:smtp"
	| "unavailable"
	| "error" = ref(null);
const passwordStrength: "" | "low" | "medium" | "high" = ref("");
const passwordRetypeState: null | "match" | "not-match" = ref(null);
const submitting: boolean = ref(false);
const ToSAgreement: boolean = ref(false);
const hCaptchaResponse = ref(null);
const reCaptchaResponse = ref(null);

const shouldDisableSubmitting = computed((): boolean => {
	return (
		submitting.value ||
		(instance.tosUrl && !ToSAgreement.value) ||
		(instance.enableHcaptcha && !hCaptchaResponse.value) ||
		(instance.enableRecaptcha && !reCaptchaResponse.value) ||
		passwordRetypeState.value === "not-match"
	);
});

function onChangeInvitationCode(): void {
	if (invitationCode.value === "") {
		invitationState.value = null;
		return;
	}
	invitationState.value = "entered";
}

function onChangeUsername(): void {
	if (username.value === "") {
		usernameState.value = null;
		return;
	}

	{
		const err = !username.value.match(/^[a-zA-Z0-9_]+$/)
			? "invalid-format"
			: username.value.length < 1
				? "min-range"
				: username.value.length > 20
					? "max-range"
					: null;

		if (err) {
			usernameState.value = err;
			return;
		}
	}

	usernameState.value = "wait";

	os.api("username/available", {
		username: username.value,
	})
		.then((result) => {
			usernameState.value = result.available ? "ok" : "unavailable";
		})
		.catch(() => {
			usernameState.value = "error";
		});
}

function onChangeEmail(): void {
	if (email.value === "") {
		emailState.value = null;
		return;
	}

	emailState.value = "wait";

	os.api("email-address/available", {
		emailAddress: email.value,
	})
		.then((result) => {
			emailState.value = result.available
				? "ok"
				: result.reason === "used"
					? "unavailable:used"
					: result.reason === "format"
						? "unavailable:format"
						: result.reason === "disposable"
							? "unavailable:disposable"
							: result.reason === "mx"
								? "unavailable:mx"
								: result.reason === "smtp"
									? "unavailable:smtp"
									: "unavailable";
		})
		.catch(() => {
			emailState.value = "error";
		});
}

function onChangePassword(): void {
	if (password.value === "") {
		passwordStrength.value = "";
		return;
	}

	const strength = getPasswordStrength(password.value);
	passwordStrength.value =
		strength > 0.7 ? "high" : strength > 0.3 ? "medium" : "low";
}

function onChangePasswordRetype(): void {
	if (retypedPassword.value === "") {
		passwordRetypeState.value = null;
		return;
	}

	passwordRetypeState.value =
		password.value === retypedPassword.value ? "match" : "not-match";
}

function onSubmit(): void {
	if (submitting.value) return;
	submitting.value = true;

	os.api("signup", {
		username: username.value,
		password: password.value,
		emailAddress: email.value,
		invitationCode: invitationCode.value,
		"hcaptcha-response": hCaptchaResponse.value,
		"g-recaptcha-response": reCaptchaResponse.value,
	})
		.then(() => {
			if (instance.emailRequiredForSignup) {
				os.alert({
					type: "success",
					title: i18n.ts._signup.almostThere,
					text: i18n.t("_signup.emailSent", { email: email.value }),
				});
				emit("signupEmailPending");
			} else {
				os.api("signin", {
					username: username.value,
					password: password.value,
				}).then((res) => {
					emit("signup", res);

					if (props.autoSet) {
						signIn(res.i);
					}
				});
			}
		})
		.catch(() => {
			submitting.value = false;
			hcaptcha.value?.reset?.();
			recaptcha.value?.reset?.();

			// Todo: API should return reason let frontend display
			os.alert({
				type: "error",
				text: i18n.ts.somethingHappened,
			});
		});
}
</script>

<style lang="scss" scoped>
.qlvuhzng {
	.captcha {
		margin: 16px 0;
	}
}
</style>
