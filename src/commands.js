import { SlashCommandBuilder } from 'discord.js';
import { eventEmbed } from './helpers/EventMessageEmbed.js';
import { actionRow } from './helpers/EventButtons.js';

export const commands = [
	{
		data: new SlashCommandBuilder()
			.setName('rank')
			.setDescription('Shows your event rank'),

		async execute(interaction) {
			const user = interaction.user.username;
			await interaction.reply(`${user}, your current rank is 🏅`);
		}
	},

	{
		data: new SlashCommandBuilder()
			.setName('help')
			.setDescription('Lists available commands'),

		async execute(interaction) {
			await interaction.reply(
				'Available commands: /ping, /rank, /help'
			);
		}
	},

	{
		data: new SlashCommandBuilder()
			.setName('addevent')
			.setDescription('Creates a new event')
			.addStringOption(option => 
				option
					.setName('eventname')
					.setDescription('The title of the event')
					.setRequired(true)
			)
			.addAttachmentOption(option =>
				option
					.setName('image')
					.setDescription('The image file to upload')
					.setRequired(true) 
			)
			// .addStringOption(option => 
			// 	option
			// 		.setName('description')
			// 		.setDescription('A brief description of the event')
			// 		.setRequired(false)
			// )
			,

		async execute(interaction) {
			const attachment = interaction.options.getAttachment('image'); // get image from slash command
			const title = interaction.options.getString('eventname');
			// const description = interaction.option.getString('description');

			const embedWithStuff = eventEmbed
				.setImage(attachment.url) // set the image on the embed
				.setTitle(title);
				// .setDescription(description); 

			await interaction.reply({ 
				embeds: [embedWithStuff],
				components: [actionRow] }
			);
		}
	}
];