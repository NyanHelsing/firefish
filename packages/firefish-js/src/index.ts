import * as acct from "./acct";
import type { Acct } from "./acct";
import { Endpoints } from "./api.types";
import * as consts from "./consts";
import Stream, { Connection } from "./streaming";
import * as StreamTypes from "./streaming.types";

export {
	Endpoints,
	Stream,
	Connection as ChannelConnection,
	StreamTypes,
	acct,
	type Acct,
};

export const permissions = consts.permissions;
export const notificationTypes = consts.notificationTypes;
export const noteVisibilities = consts.noteVisibilities;
export const mutedNoteReasons = consts.mutedNoteReasons;
export const languages = consts.languages;
export const ffVisibility = consts.ffVisibility;

// api extractor not supported yet
//export * as api from './api';
//export * as entities from './entities';
import * as api from "./api";
import * as entities from "./entities";
export { api, entities };
