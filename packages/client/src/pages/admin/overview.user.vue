<template>
	<MkA :class="[$style.root]" :to="`/user-info/${user.id}`">
		<MkAvatar
			class="avatar"
			:user="user"
			:disable-link="true"
			:show-indicator="true"
		/>
		<div class="body">
			<span class="name"><MkUserName class="name" :user="user" /></span>
			<span class="sub"
				><span class="acct _monospace"
					>@{{ acct.toString(user) }}</span
				></span
			>
		</div>
	</MkA>
</template>

<script lang="ts" setup>
import { acct, type entities } from "firefish-js";
defineProps<{
	user: entities.User;
}>();
</script>

<style lang="scss" module>
.root {
	$bodyTitleHieght: 18px;
	$bodyInfoHieght: 16px;

	display: flex;
	align-items: center;

	> :global(.avatar) {
		display: block;
		width: ($bodyTitleHieght + $bodyInfoHieght);
		height: ($bodyTitleHieght + $bodyInfoHieght);
		margin-right: 12px;
	}

	> :global(.body) {
		flex: 1;
		overflow: hidden;
		font-size: 0.9em;
		color: var(--fg);
		padding-right: 8px;

		> :global(.name) {
			display: block;
			width: 100%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			line-height: $bodyTitleHieght;
		}

		> :global(.sub) {
			display: block;
			width: 100%;
			font-size: 95%;
			opacity: 0.7;
			line-height: $bodyInfoHieght;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}

	> :global(.chart) {
		height: 30px;
	}
}
</style>
