import { MessageReaction, User } from 'discord.js';

import stageSubmission from '../models/stage-submission';

import log from '../helpers/log';
import constants from '../helpers/constants';

export const name = 'messageReactionRemove';

export const once = false;

export async function execute(reaction : MessageReaction, user : User) {
	if (!constants['validUsers'].includes(user.id)) return;
	if (reaction.message.channel.id != constants['submissionsChannel']) return;

	if (reaction.partial) {
		reaction.fetch()
			.catch(err => {
				log({ logger: 'reaction', content: `Something went wrong fetching the reaction: ${err}`, level: 'error' });
				return;
			});
	}

	switch (reaction.emoji.name) {
	/**
	 * Difficulties
	 */
	case 'MegaEasy':
	case 'Easy':
	case 'Medium':
	case 'Hard':
	case 'Extreme':
		await stageSubmission.findByIdAndUpdate(reaction.message.id, { $unset: { difficulty: '' } });
		break;

	case 'Verify':
		await stageSubmission.findByIdAndUpdate(reaction.message.id, { verified: false });
		break;

	/**
	 * Other (generally payment numbers)
	 */
	default:
		if (!Number.isNaN(Number(reaction.emoji.name))) {
			await stageSubmission.findOneAndUpdate({ _id: reaction.message.id }, { $unset: { paymentPercentage: Number(reaction.emoji.name) } });
		}
	}
}
