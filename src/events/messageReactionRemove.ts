import { MessageReaction, User } from 'discord.js';
import stageSubmission from '../models/stage-submission';
import log from '../helpers/log';

export const name = 'messageReactionRemove';

export const once = false;

export async function execute(reaction : MessageReaction, user : User) {
	if (user.id != '745063586422063214') return;
	if (reaction.message.channel.id != '993215664623980554') return;

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

	/**
	 * Other (generally payment numbers)
	 */
	default:
		if (!Number.isNaN(Number(reaction.emoji.name))) {
			await stageSubmission.findOneAndUpdate({ _id: reaction.message.id }, { $unset: { payment: Number(reaction.emoji.name) } });
		}
	}
}
