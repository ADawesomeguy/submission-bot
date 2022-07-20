// Imported to build the slash command exported from here
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, TextChannel } from 'discord.js';
import log from '../helpers/log';
import constants from '../helpers/constants';

import stageSubmission from '../models/stage-submission';

// Exported data will be used when deploying and responding to commands
export const data = new SlashCommandBuilder()
	.setName('submit')
	.setDescription('Submit a stage')
	.addAttachmentOption(option =>
		option.setName('file')
			.setDescription('The file to be reviewed')
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName('info')
			.setDescription('Any extra info regarding the submission')
			.setRequired(true)
	);

// Execute function is what will be run when the interaction is received
export async function execute(interaction : CommandInteraction) {
	if (interaction.channel?.id != constants['submissionsChannel']) return interaction.reply({ content: 'Invalid channel!', ephemeral: true });

	await (interaction.channel as TextChannel).threads.create({
		name: `${interaction.user.username}`,
		autoArchiveDuration: 'MAX',
		reason: `${interaction.user.username} submitted a new stage`,
	})
		.then(async t => {
			await t.edit({ name: t.name + ' - ' + t.id });
			await t.members.add(interaction.user.id);
			constants['validUsers'].forEach((u : string) => {
				interaction.guild?.members.fetch(u)
					.then(user => t.members.add(user))
					.catch(err => {
						log({
							logger: 'submit',
							content: `Failed to add admin ${u} to thread: ${err}`,
							level: 'error',
						});
					});
			});
			const file = interaction.options.getAttachment('file');
			if (!file) {
				return;
			}
			await stageSubmission.findOneAndUpdate(
				{ _id: t.id },
				{
					_id: t.id,
					authorId: interaction.user.id,
				},
				{ upsert: true, new: true }
			);
			const info = interaction.options.getString('info');
			await t.send({ content: info, files: [file] });
			return await interaction.reply({ content: `Successfully created <#${t.id}>`, ephemeral: true });
		})
		.catch(err => {
			if (!err) return;
			console.log(err);
			return interaction.reply({ content: 'Failed to create thread, please contact one of the mods.' });
		});
}
