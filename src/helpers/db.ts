// Example helper functions for MongoDB

import mongoose from 'mongoose';

import log from '../helpers/log';

export async function connect(mongoUri) {
	mongoose
		.connect(mongoUri, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
		})
		.then(() => log({ logger: 'db', content: `Connected to the database at ${mongoUri}!`, level: 'info' }))
		.catch(err => log({ logger: 'db', content: `Failed to connect to the database at ${mongoUri}: ${err}`, level: 'fatal' }));
}

