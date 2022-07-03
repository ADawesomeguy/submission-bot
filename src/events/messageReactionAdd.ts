import {GuildChannel, MessageReaction, TextChannel, User} from 'discord.js';
import stageSubmission from '../models/stage-submission';
import log from '../helpers/log';
import { Model } from 'mongoose';

export const name = 'messageReactionAdd';

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
		await stageSubmission.findOneAndUpdate({ _id: reaction.message.id }, { difficulty: 'Mega Easy' }, { upsert: true, new: true });
		break;
	case 'Easy':
		await stageSubmission.findOneAndUpdate({ _id: reaction.message.id }, { difficulty: 'Easy' }, { upsert: true, new: true });
		break;
	case 'Medium':
		await stageSubmission.findOneAndUpdate({ _id: reaction.message.id }, { difficulty: 'Medium' }, { upsert: true, new: true });
		break;
	case 'Hard':
		await stageSubmission.findOneAndUpdate({ _id: reaction.message.id }, { difficulty: 'Hard' }, { upsert: true, new: true });
		break;
	case 'Extreme':
		await stageSubmission.findOneAndUpdate({ _id: reaction.message.id }, { difficulty: 'Extreme' }, { upsert: true, new: true });
		break;

	/**
	 * Upload
	 */
	case 'Upload': {
		stageSubmission.findById(reaction.message.id, async (err, submission) => {
			if (err) {
				log({
					logger: 'submission',
					content: `Failed to fetch submission with ID ${reaction.message.id}: ${err}`,
					level: 'error',
				});
				return;
			}
			else if (![submission.difficulty, submission.payment].includes(undefined)) {
				const acceptedStagesChannel = await reaction.message.guild?.channels.fetch('993245197645402234', );
				await (acceptedStagesChannel as TextChannel).send({ content: `${submission.difficulty}\n${submission.payment}%` });
			}
			else {
				user.dmChannel?.send('Missing one of payment percentage or difficulty!')
					.catch(err => {
						log({ logger: 'reaction', content: `Something went wrong DMing the reaction sender: ${err}`, level: 'error' });
					});
			}
		});
		break;
	}

	/**
	 * Other (generally payment numbers)
	 */
	default:
		// if it's a number, set the percentage
		if (!Number.isNaN(Number(reaction.emoji.name))) {
			await stageSubmission.findOneAndUpdate({ _id: reaction.message.id }, { payment: Number(reaction.emoji.name) }, { upsert: true, new: true });
		}
	}
}
