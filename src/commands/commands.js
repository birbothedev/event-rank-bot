import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { createSignupActionRow } from '../helpers/EventButtons.js';
import { db } from '../database.js';

const events = db.prepare(`SELECT * FROM events`).all();

export const commands = [
	{
		data: new SlashCommandBuilder()
			.setName('help')
			.setDescription('Lists available commands'),

		async execute(interaction) {
			await interaction.reply(
				'Available commands: /rankallplayers, /help'
			);
		}
	},

	{
		data: new SlashCommandBuilder()
			.setName('addevent')
			.setDescription('Creates a new event')
			.addAttachmentOption(option =>
				option
					.setName('image')
					.setDescription('The image file to upload')
					.setRequired(true) 
			)
			.addStringOption(option => 
				option
					.setName('eventname')
					.setDescription('The title of the event')
					.setRequired(true)
			)
			.addIntegerOption(option =>
				option
					.setName('teamsizes')
					.setDescription('The number of players per team. Enter 1 if single player.')
					.setRequired(true) 
			)
			.addStringOption(option => 
				option
					.setName('description')
					.setDescription('A brief description of the event')
					.setRequired(false)
			)
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

		async execute(interaction) {
			const attachment = interaction.options.getAttachment('image'); // get image from slash command
			const title = interaction.options.getString('eventname');
			const description = interaction.options.getString('description');
			const teamsizes = interaction.options.getInteger('teamsizes');

			const embedWithStuff = new EmbedBuilder()
				.setImage(attachment.url) // set the image on the embed
				.setTitle(title)
				.setColor(0x0099ff)
				.setDescription(description)
				.addFields(
					{ name: '👥 Team Size', value: `${teamsizes} players`, inline: true },
					{ name: '📝 Sign-ups', value: '0', inline: true }
				)
				.setTimestamp()
				.setFooter({ text: 'OSRS Event Bot', iconURL: 'https://twemoji.maxcdn.com/v/latest/72x72/1f525.png' }); 

			const result = db.prepare(`
				INSERT INTO events (name, description, image_url, team_size, created_at)
				VALUES (?, ?, ?, ?, ?)
			`).run(title, description, attachment.url, teamsizes, Date.now());

			const eventId = result.lastInsertRowid;

			await interaction.reply({ 
				embeds: [embedWithStuff],
				components: [createSignupActionRow(eventId)] }
			);
		}
	},

	{
		data: new SlashCommandBuilder()
			.setName('rankallplayers')
			.setDescription('Runs the rank script on all players. Only run once sign ups have closed.')
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
			.addStringOption(option =>
				option
					.setName('event')
					.setDescription('Choose an event')
					.setRequired(true)
					.addChoices(
					...events.map(event => ({
						name: event.name,    
						value: event.id.toString() 
					}))
				)
			),

		async execute(interaction) {
			// TODO get event id from selection and use it to pull the list of players from that event
			await interaction.reply(
				'yipee'
			);
		}
	},
	{
		data: new SlashCommandBuilder()
			.setName('closesignups')
			.setDescription('Closes sign ups and prevents new submissions.')
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

		async execute(interaction) {
			await interaction.reply(
				'test reply'
			);
		}
	}
];
