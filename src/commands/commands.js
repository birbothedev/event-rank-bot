import { EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { createSignupActionRow } from '../helpers/EventButtons.js';
import { db } from '../database.js';
import { getGroupRSN_ToCSV, parseDataFromCSV } from '../data/data-cleaning/getdata.js';
import { getPlayerListFromDB } from '../helpers/helperfunctions.js';
import { rankAllPlayers } from '../data/main.js';

const events = db.prepare(`SELECT * FROM events`).all();

export const commands = [
		// ----------------- ADD EVENT --------------------- //
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

			const groupCSV = await getGroupRSN_ToCSV(9403);
			const parsedData = await parseDataFromCSV(groupCSV, 'parsedcsv', 'outputs');

			await interaction.reply({ 
				embeds: [embedWithStuff],
				components: [createSignupActionRow(eventId)] }
			);

			return parsedData;
		}
	},

	// ----------------- RANK ALL PLAYERS --------------------- //
	{
		data: new SlashCommandBuilder()
			.setName('rankallplayers')
			.setDescription('Runs the rank script on all players. Only run once sign ups have closed.')
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
			.addStringOption(option =>
				option
					.setName('events')
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
			await interaction.deferReply({ 
				flags: MessageFlags.Ephemeral
			});

			const selectedEventId = interaction.options.getString('events');
			const event = db.prepare(`
				SELECT name FROM events
				WHERE id = ?
				`).get(selectedEventId);

			await interaction.editReply({ 
				content: `🟢 Ranking all players from ${event.name}...`
			});

			// TODO bot returns json text file of all ranked players
			const playerList = await getPlayerListFromDB(selectedEventId);
			const rankedPlayers = await rankAllPlayers(playerList, selectedEventId);
			// await interaction.channel.send({ files: [rankedPlayers] });
		}
	},

	// ----------------- CLOSE SIGN UPS --------------------- //
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
	},

	// ----------------- RE OPEN EXISTING EVENT --------------------- //
	{
		data: new SlashCommandBuilder()
			.setName('openevent')
			.setDescription('Re-opens an existing event for signups. Does not remove old signups.')
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
			.addAttachmentOption(option =>
				option
					.setName('image')
					.setDescription('The image file to upload')
					.setRequired(true) 
			)
			.addStringOption(option =>
				option
					.setName('events')
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
			const selectedEventId = interaction.options.getString('events');
			const attachment = interaction.options.getAttachment('image');

			const event = db.prepare(`
				SELECT name, description, team_size, 
				created_at, is_open
				FROM events WHERE id = ?
				`).get(selectedEventId);

			const playerCount = db.prepare(`
				SELECT COUNT(rsn) AS count
				FROM event_signups
				WHERE event_id = ?
				`).get(selectedEventId);

			const embed = new EmbedBuilder()
				.setImage(attachment.url) 
				.setTitle(`${event.name}`)
				.setColor(0x0099ff)
				.setDescription(`${event.description}`)
				.addFields(
					{ name: '👥 Team Size', value: `${event.team_size} players`, inline: true },
					{ name: '📝 Sign-ups', value: `${playerCount.count}`, inline: true }
				)
				.setTimestamp()
				.setFooter({ text: 'OSRS Event Bot', iconURL: 'https://twemoji.maxcdn.com/v/latest/72x72/1f525.png' }); 

			await interaction.reply({ 
				embeds: [embed],
				components: [createSignupActionRow(selectedEventId)] }
			);
		}
	}
];
