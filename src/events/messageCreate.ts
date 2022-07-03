import { testingGuild } from '../helpers/env';

export const name = 'messageCreate';

export const once = false;

export async function execute(message) {
	if (message.author.bot || message.guild.id != testingGuild) return;

	if (message.content.startsWith('!p')) {
		message.reply('This can only be seen in the testing guild!');
	}
}
