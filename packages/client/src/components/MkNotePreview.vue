<template>
	<div v-size="{ min: [350, 500] }" class="fefdfafb">
		<MkAvatar class="avatar" :user="me" disable-link />
		<div class="main">
			<div class="header">
				<MkUserName :user="me" />
			</div>
			<div class="body">
				<div class="content">
					<Mfm
						:text="preprocess(text).trim()"
						:lang="lang"
						:author="me"
						:i="me"
						advanced-mfm
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import preprocess from "@/scripts/preprocess";
import { me } from "@/me";

defineProps<{
	text: string;
	lang?: string;
}>();
</script>

<style lang="scss" scoped>
.fefdfafb {
	display: flex;
	margin: 0;
	padding: 0;
	overflow: clip;
	font-size: 0.95em;

	&.min-width_350px {
		> .avatar {
			margin: 0 10px 0 0;
			width: 44px;
			height: 44px;
		}
	}

	&.min-width_500px {
		> .avatar {
			margin: 0 12px 0 0;
			width: 48px;
			height: 48px;
		}
	}

	> .avatar {
		flex-shrink: 0;
		display: block;
		margin: 0 10px 0 0;
		width: 40px;
		height: 40px;
		border-radius: 8px;
		pointer-events: none;
	}

	> .main {
		flex: 1;
		min-width: 0;

		> .header {
			margin-bottom: 2px;
			font-weight: bold;
		}

		> .body {
			> .cw {
				cursor: default;
				display: block;
				margin: 0;
				padding: 0;
				overflow-wrap: break-word;

				> .text {
					margin-right: 8px;
				}
			}

			> .content {
				> .text {
					cursor: default;
					margin: 0;
					padding: 0;
				}
			}
		}
	}
}
</style>
