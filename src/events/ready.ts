// Used on ready

import * as db from '../helpers/db';
import { mongoUri } from '../helpers/env';
import log from '../helpers/log';

// Name is used for which event to fire on
export const name = 'ready';

// "On" vs "Once"
export const once = true;

export async function execute(client) {
	await db.connect(mongoUri);
	log({ logger: 'status', content: `Logged in as ${client.user.tag}!`, level: 'info' });
	client.user.setActivity(
		'for /help',
		{ type: 'WATCHING' },
	);
}
