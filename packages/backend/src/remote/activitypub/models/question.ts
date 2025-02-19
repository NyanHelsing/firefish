import Resolver from "../resolver.js";
import type { IObject, IQuestion } from "../type.js";
import { getApId, isQuestion } from "../type.js";
import { apLogger } from "../logger.js";
import { Notes, Polls } from "@/models/index.js";
import type { IPoll } from "@/models/entities/poll.js";
import { isSameOrigin } from "@/misc/convert-host.js";

export async function extractPollFromQuestion(
	source: string | IObject,
	resolver?: Resolver,
): Promise<IPoll> {
	if (resolver == null) resolver = new Resolver();

	const question = await resolver.resolve(source);

	if (!isQuestion(question)) {
		throw new Error("invalid type");
	}

	const multiple = !question.oneOf;
	const expiresAt = question.endTime
		? new Date(question.endTime)
		: question.closed
		  ? new Date(question.closed)
		  : null;

	if (multiple && !question.anyOf) {
		throw new Error("invalid question");
	}

	const choices = question[multiple ? "anyOf" : "oneOf"]!.map(
		(x, i) => x.name!,
	);

	const votes = question[multiple ? "anyOf" : "oneOf"]!.map(
		(x, i) => x.replies?.totalItems || x._misskey_votes || 0,
	);

	return {
		choices,
		votes,
		multiple,
		expiresAt,
	};
}

/**
 * Update votes of Question
 * @param value URI of AP Question object or object itself
 * @returns true if updated
 */
export async function updateQuestion(
	value: string | IQuestion,
	resolver?: Resolver,
): Promise<boolean> {
	const uri = typeof value === "string" ? value : getApId(value);

	// Skip if URI points to this server
	if (isSameOrigin(uri)) throw new Error("uri points local");

	//#region Already registered with this server?
	const note = await Notes.findOneBy({ uri });
	if (note == null) throw new Error("Question is not registed");

	const poll = await Polls.findOneBy({ noteId: note.id });
	if (poll == null) throw new Error("Question is not registed");
	//#endregion

	// resolve new Question object
	const _resolver = resolver ?? new Resolver();
	const question = (await _resolver.resolve(value)) as IQuestion;
	apLogger.debug(`fetched question: ${JSON.stringify(question, null, 2)}`);

	if (question.type !== "Question") throw new Error("object is not a Question");

	const apChoices = question.oneOf || question.anyOf;
	if (!apChoices) return false;

	let changed = false;

	for (const choice of poll.choices) {
		const oldCount = poll.votes[poll.choices.indexOf(choice)];
		const newCount = apChoices.filter((ap) => ap.name === choice)[0].replies
			?.totalItems;

		if (newCount !== undefined && oldCount !== newCount) {
			changed = true;
			poll.votes[poll.choices.indexOf(choice)] = newCount;
		}
	}

	await Polls.update(
		{ noteId: note.id },
		{
			votes: poll.votes,
		},
	);

	return changed;
}
