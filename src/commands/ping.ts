// Example command

// Imported to build the slash command exported from here
import { SlashCommandBuilder } from '@discordjs/builders';

// Other imports can go here:

// Exported data will be used when deploying and responding to commands
export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Simple ping command');

// Execute function is what will be run when the interaction is received
export async function execute(interaction) {
	interaction.reply({ content: 'Pong!' });
}
