<template>
	<div class="mkw-button">
		<MkButton :primary="widgetProps.colored" full @click="run">
			{{ widgetProps.label }}
		</MkButton>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { Interpreter, Parser } from "@syuilo/aiscript";
import { useWidgetPropsManager } from "./widget";
import type {
	WidgetComponentEmits,
	WidgetComponentExpose,
	WidgetComponentProps,
} from "./widget";
import { createAiScriptEnv } from "@/scripts/aiscript/api";
import type { GetFormResultType } from "@/scripts/form";
import * as os from "@/os";
import { me } from "@/me";
import MkButton from "@/components/MkButton.vue";

const name = "button";

const widgetPropsDef = {
	label: {
		type: "string" as const,
		default: "BUTTON",
	},
	colored: {
		type: "boolean" as const,
		default: true,
	},
	script: {
		type: "string" as const,
		multiline: true,
		default: 'Mk:dialog("hello" "world")',
	},
};

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const props = defineProps<WidgetComponentProps<WidgetProps>>();
const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();

const { widgetProps, configure } = useWidgetPropsManager(
	name,
	widgetPropsDef,
	props,
	emit,
);

const parser = new Parser();

const run = async () => {
	const aiscript = new Interpreter(
		createAiScriptEnv({
			storageKey: "widget",
			token: me?.token,
		}),
		{
			in: (q) => {
				return new Promise((ok) => {
					os.inputText({
						title: q,
					}).then(({ canceled, result: a }) => {
						ok(a);
					});
				});
			},
			out: (value) => {
				// nop
			},
			log: (type, params) => {
				// nop
			},
		},
	);

	let ast;
	try {
		ast = parser.parse(widgetProps.script);
	} catch (err) {
		os.alert({
			type: "error",
			text: `Syntax error: ${err}`,
		});
		return;
	}
	try {
		await aiscript.exec(ast);
	} catch (err) {
		os.alert({
			type: "error",
			text: String(err),
		});
	}
};

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});
</script>
