import { MessageEmbed, MessageReaction, TextChannel, User } from 'discord.js';
import stageSubmission from '../models/stage-submission';
import log from '../helpers/log';

export const name = 'messageReactionAdd';

export const once = false;

async function getNumRobux(currentId : string) : Promise<number> {
	const Subs = {
		'Mega Easy': await stageSubmission.find({ accepted: true, difficulty: 'Mega Easy' }),
		'Easy': await stageSubmission.find({ accepted: true, difficulty: 'Easy' }),
		'Medium': await stageSubmission.find({ accepted: true, difficulty: 'Medium' }),
		'Hard': await stageSubmission.find({ accepted: true, difficulty: 'Hard' }),
		'Extreme': await stageSubmission.find({ accepted: true, difficulty: 'Extreme' }),
	};

	let baseline = Subs['Mega Easy'].length + 1; // prevents it from being too low to begin with

	for (const key in Subs) {
		baseline = Math.min(baseline, Subs[key].length + 1);
	}

	const currentSub = await stageSubmission.findById(currentId);
	return 5000 * ((baseline / (Subs[currentSub?.difficulty as string].length + 1)) * (currentSub?.payment || 0) / 100);
}

export async function execute(reaction : MessageReaction, user : User) {
	if (!['820351512165351455', '761895875361505281'].includes(user.id)) return;
	if (reaction.message.channel.id != '993283147951243276') return;

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
				const numRobux = await getNumRobux(reaction.message.id);
				await stageSubmission.findByIdAndUpdate(submission._id, { accepted: true });
				const acceptedStagesChannel = await reaction.message.guild?.channels.fetch('993283147791867999');

				const acceptedSubmissionEmbed = new MessageEmbed()
					.setColor(submission.payment === 100 ? '#00ff77' : '#ffff00')
					.setDescription(`[Jump!](${reaction.message.url})`)
					.addField('Creator', `<@${reaction.message.author?.id}>`)
					.addField('Stage Difficulty', submission.difficulty)
					.addField('Info Provided', `\`\`\`${reaction.message.content}\`\`\``)
					.addField('Status', submission.payment === 100 ? 'Fully Accepted' : 'Accepted With Edits')
					.addField('Payment', `${numRobux}`);

				// await (acceptedStagesChannel as TextChannel).send({ content: `${submission.difficulty}\n${numRobux}` });
				await (acceptedStagesChannel as TextChannel).send({ content: `<@${reaction.message.author?.id}>`, embeds: [acceptedSubmissionEmbed] });
			}
			else {
				await reaction.remove();
				user.send('Missing one of payment percentage or difficulty!')
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
