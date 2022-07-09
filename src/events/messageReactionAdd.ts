import { MessageEmbed, MessageReaction, TextChannel, User } from 'discord.js';

import stageSubmission from '../models/stage-submission';

import log from '../helpers/log';
import constants from '../helpers/constants';

export const name = 'messageReactionAdd';

export const once = false;

async function getSubs() : Promise<Record<string, any>> {
	return {
		'Mega Easy': await stageSubmission.find({ accepted: true, difficulty: 'Mega Easy' }),
		'Easy': await stageSubmission.find({ accepted: true, difficulty: 'Easy' }),
		'Medium': await stageSubmission.find({ accepted: true, difficulty: 'Medium' }),
		'Hard': await stageSubmission.find({ accepted: true, difficulty: 'Hard' }),
		'Extreme': await stageSubmission.find({ accepted: true, difficulty: 'Extreme' }),
	};
}

async function getNumRobux(currentId : string) : Promise<number> {
	const Subs = await getSubs();

	let baseline = Subs['Mega Easy'].length + 1; // prevents it from being too low to begin with

	for (const key in Subs) {
		baseline = Math.min(baseline, Subs[key].length + 1);
	}

	const currentSub = await stageSubmission.findById(currentId);
	return Math.round(Math.round(Math.max(5000 * (baseline / (Subs[currentSub?.difficulty as string].length + (currentSub?.accepted ? 0 : 1))), 1000)) * ((currentSub?.paymentPercentage || 0) / 100));
}

async function sendNextStagePayments(paymentInfoChannel : TextChannel) : Promise<void> {
	const Subs = await getSubs();

	let baseline = Subs['Mega Easy'].length + 1;

	for (const key in Subs) {
		baseline = Math.min(baseline, Subs[key].length + 1);
	}

	const paymentInfoEmbed = new MessageEmbed()
		.setColor('#ffffff')
		.setTimestamp()
		.setTitle('Payment Information Update');

	for (const key in Subs) {
		const maxAmount = Math.round(Math.max(5000 * (baseline / (Subs[key].length + 1)), 1000));
		paymentInfoEmbed.addField(key + ' Stages', `> Total: ${Subs[key].length}\n> Max Payment: ${maxAmount} Robux`);
	}

	paymentInfoEmbed.setFooter({ text: 'Note: maximum payment is based on demand' });

	await paymentInfoChannel.send({ embeds: [paymentInfoEmbed] });
}

export async function execute(reaction : MessageReaction, user : User) {
	if (!constants['validUsers'].includes(user.id)) return;

	if (reaction.partial) {
		reaction.fetch()
			.then(r => {
				if (r.message.partial) {
					r.message.fetch();
				}
			})
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
		if (reaction.message.channel.id != constants['submissionsChannel']) return;
		await stageSubmission.findOneAndUpdate({ _id: reaction.message.id }, { difficulty: 'Mega Easy', authorId: reaction.message.author?.id }, { upsert: true, new: true });
		break;
	case 'Easy':
		if (reaction.message.channel.id != constants['submissionsChannel']) return;
		await stageSubmission.findOneAndUpdate({ _id: reaction.message.id }, { difficulty: 'Easy', authorId: reaction.message.author?.id }, { upsert: true, new: true });
		break;
	case 'Medium':
		if (reaction.message.channel.id != constants['submissionsChannel']) return;
		await stageSubmission.findOneAndUpdate({ _id: reaction.message.id }, { difficulty: 'Medium', authorId: reaction.message.author?.id }, { upsert: true, new: true });
		break;
	case 'Hard':
		if (reaction.message.channel.id != constants['submissionsChannel']) return;
		await stageSubmission.findOneAndUpdate({ _id: reaction.message.id }, { difficulty: 'Hard', authorId: reaction.message.author?.id }, { upsert: true, new: true });
		break;
	case 'Extreme':
		if (reaction.message.channel.id != constants['submissionsChannel']) return;
		await stageSubmission.findOneAndUpdate({ _id: reaction.message.id }, { difficulty: 'Extreme', authorId: reaction.message.author?.id }, { upsert: true, new: true });
		break;

	/**
	 * Upload
	 */
	case 'Upload': {
		if (reaction.message.channel.id != constants['submissionsChannel']) return;
		await reaction.message.fetch();
		stageSubmission.findById(reaction.message.id, async (err, submission) => {
			if (err) {
				log({
					logger: 'submission',
					content: `Failed to fetch submission with ID ${reaction.message.id}: ${err}`,
					level: 'error',
				});
				return;
			}
			else if (![submission?.difficulty, submission?.paymentPercentage].includes(undefined)) {
				const numRobux = await getNumRobux(reaction.message.id);
				await stageSubmission.findByIdAndUpdate(submission._id, { accepted: true });
				const acceptedStagesChannel = await reaction.message.guild?.channels.fetch(constants['acceptedStagesChannel']);
				const paymentInfoChannel = await reaction.message.guild?.channels.fetch(constants['paymentInfoChannel']);

				const acceptedSubmissionEmbed = new MessageEmbed()
					.setColor(submission.paymentPercentage === 100 ? '#00ff77' : '#ffff00')
					.setTimestamp()
					.setAuthor({ name: reaction.message.author?.tag as string, iconURL: reaction.message.author?.displayAvatarURL() })
					.setDescription(`[Jump!](${reaction.message.url})`)
					.addField('Creator', `<@${reaction.message.author?.id}>`)
					.addField('Stage Difficulty', submission.difficulty, true)
					.addField('Stage ID', submission._id, true)
					.addField('Info Provided', `\`\`\`${reaction.message.content}\`\`\``)
					.addField('Status', submission.paymentPercentage === 100 ? 'Fully Accepted' : 'Accepted With Edits', true)
					.addField('Payment', `${numRobux} Robux`, true);

				const acceptanceMessage = await (acceptedStagesChannel as TextChannel).send({ content: `<@${reaction.message.author?.id}>`, embeds: [acceptedSubmissionEmbed] });
				await stageSubmission.findByIdAndUpdate(reaction.message.id, { acceptanceMessageId: acceptanceMessage.id, paymentRequired: numRobux });
				await sendNextStagePayments(paymentInfoChannel as TextChannel);
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
	 * Paid
	 */
	case 'Paid': {
		if (reaction.message.channel.id != constants['acceptedStagesChannel']) return;
		stageSubmission.findOneAndUpdate({ acceptanceMessageId: reaction.message.id }, { payedOut: true }, { new: true }, async (err, submission) => {
			if (err) {
				log({
					logger: 'submission',
					content: `Failed to fetch submission with ID ${reaction.message.id}: ${err}`,
					level: 'error',
				});
				return;
			}
			else {
				const paymentLogChannel = await reaction.message.guild?.channels.fetch(constants['paymentLogChannel']);
				const submissionsChannel = await reaction.message.guild?.channels.fetch(constants['submissionsChannel']);
				const paymentLogEmbed = new MessageEmbed()
					.setColor('#00ff77')
					.setDescription(`<@${submission?.authorId}> has been paid ${submission?.paymentRequired} Robux for their stage.\nStage ID: ${submission?._id}`);
				await (paymentLogChannel as TextChannel).send({ embeds: [paymentLogEmbed] });
				const originalSubmissionMessage = await (submissionsChannel as TextChannel).messages.fetch(submission?._id as string);
				await reaction.message.delete();
				if (submission?.verified) await originalSubmissionMessage.delete();
			}
		});
		break;
	}

	/**
	 * Verify
	 */
	case 'Verify': {
		if (reaction.message.channel.id != constants['submissionsChannel']) return;
		const acceptedStagesChannel = await reaction.message.guild?.channels.fetch(constants['acceptedStagesChannel']);
		const submission = await stageSubmission.findByIdAndUpdate(reaction.message.id, { verified: true }, { new: true, upsert: false });
		await (acceptedStagesChannel as TextChannel).messages.fetch(submission?.acceptanceMessageId as string)
			.then(m => {
				m.react('<:Verify:993658843349389387>');
			})
			.catch(e => {
				log({ logger: 'reaction', content: `Failed to reacted to accepted stage message: ${e}`, level: 'error' });
			});
		break;
	}

	/**
	 * Other (generally payment numbers)
	 */
	default:
		// if it's a number, set the percentage
		if (!Number.isNaN(Number(reaction.emoji.name))) {
			if (reaction.message.channel.id != constants['submissionsChannel']) return;
			await stageSubmission.findOneAndUpdate({ _id: reaction.message.id }, { paymentPercentage: Number(reaction.emoji.name), authorId: reaction.message.author?.id }, { upsert: true, new: true });
		}
	}
}
