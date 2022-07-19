#!/usr/bin/env node

import fs from 'node:fs';
import { Client, Collection, Intents } from 'discord.js';
import { token } from './helpers/env';
import log from './helpers/log';
import * as db from './helpers/db';

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
	],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client['commands'] = new Collection();

const commandFiles = fs
	.readdirSync(__dirname + '/commands')
	.filter(file => file.endsWith('.js'));
const eventFiles = fs
	.readdirSync(__dirname + '/events')
	.filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	import(`${__dirname}/commands/${file}`).then(command => {
		client['commands'].set(command.data.name, command);
		log({
			logger: 'command',
			content: `Registered command ${file}!`,
			level: 'info',
		});
	});
}

for (const file of eventFiles) {
	import(`${__dirname}/events/${file}`).then(event => {
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		}
		else {
			client.on(event.name, (...args) => event.execute(...args));
		}
		log({
			logger: 'event',
			content: `Registered event ${file}!`,
			level: 'info',
		});
	});
}

process.on('SIGINT', () => {
	db.disconnect().then(() => {
		process.exit(1);
	});
});

client.login(token);
