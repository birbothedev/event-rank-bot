import {
	Client,
	GatewayIntentBits,
	Events,
	REST,
	Routes,
	EmbedBuilder,
	ChannelType,
	MessageFlags,
} from 'discord.js';
import 'dotenv/config';
import { commands } from './commands/commands.js';
import { createSignUpModal, createChangeAccountModal } from './helpers/EventModals.js';
import { db } from './database.js';
import { getExistingRSN, getUpdatedSignUpCount, 
	updateExistingRSN, validateRSN } from './helpers/helperfunctions.js';
import { readFromFile } from './data/data-cleaning/output.js';

const token = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({
	intents: [GatewayIntentBits.Guilds]
});

/* -----------------------------
Register slash commands
----------------------------- */
const rest = new REST({ version: '10' }).setToken(token);

await rest.put(
	Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
	{ body: commands.map(cmd => cmd.data.toJSON()) }
);

/* -----------------------------
Register Embed on Load
----------------------------- */
client.on('clientReady', async () => {

	const welcomeEmbed = new EmbedBuilder()
		.setColor(0x00FF00) // Green color
        .setTitle('OSRS Event Bot Online!')
        .setDescription('Hello everyone! I have just successfully connected to the Discord API.')
		.addFields(
			{ name: 'Admin Only Event Commands', value: 'Use these commands to add or update event information:\n**/addevent**\nUse this command to add an event.\n**/updateevent**\nUse this command to update or change an event.\n**/deleteevent**\nUse this command to remove an event from the database.\n**/closesignups**\nUse this command to close the signups for an event.\n**/openevent**\nUse this command to re-open an existing event for signups.' },
			{ name: 'Admin Only Player Commands', value: 'Use these commands to add or update player information:\n**/deleteplayer**\nUse this command to delete a player from the database.\n**/changeplayerrsn**\nUse this command to change the rsn that the player is signed up under.\n' },
		)
        .setTimestamp()
        .setFooter({ text: 'OSRS Event Bot', iconURL: 'https://twemoji.maxcdn.com/v/latest/72x72/1f525.png' });

	try {
		const channel = await client.channels.fetch(CHANNEL_ID);

		if (channel && channel.type === ChannelType.GuildText) {
			// delete old embed
			const messages = await channel.messages.fetch({ limit: 50 });
            const botMessages = messages.filter(
                m => m.author.id === client.user.id && m.embeds.length > 0
            );

            for (const [id, msg] of botMessages) {
                await msg.delete().catch(console.error);
            }

			// send new embed
			await channel.send({ embeds: [welcomeEmbed] });
			console.log('Bot startup message sent successfully');
		} else {
			console.error('Channel not found or is not a text channel');
		}
	} catch (error) {
		console.error('Failed to send startup message: ', error);
	}
});

/* -----------------------------
Handle interactions
----------------------------- */
client.on(Events.InteractionCreate, async interaction => {
	// slash commands
	if (interaction.isChatInputCommand()) {
		const command = commands.find(
			cmd => cmd.data.name === interaction.commandName
		);

		if (!command) return;

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);

			if (!interaction.replied && !interaction.deferred) {
				await interaction.reply({
					content: 'There was an error executing this command.',
					ephemeral: true
				});
			}
		}
		return;
	}

	// buttons
	if (interaction.isButton()) {
		// grab the event id from the end of the string
		const eventId = interaction.customId.split(':')[1];
		const userId = interaction.user.id;

		// sign up
		if (interaction.customId.startsWith('signupbutton:')) {
			try {
				// link submission to correct event id
				await interaction.showModal(createSignUpModal(eventId));
			} catch (err) {
				console.error('Modal error:', err);
				await interaction.reply({
					content: '❌ Something went wrong. Please wait a moment and try again',
					flags: MessageFlags.Ephemeral
				});
			}
		} 

		// change account
		else if (interaction.customId.startsWith('changeAccountButton:')) {
			try {
				const existingSignUp = await getExistingRSN(userId, eventId);
				if (!existingSignUp) {
					return await interaction.reply({
							content: `⚠️ You are not currently signed up for this event.`,
							flags: MessageFlags.Ephemeral
					});
				}
				await interaction.showModal(createChangeAccountModal(eventId));
			} catch (err) {
				console.error('Modal error:', err);
				await interaction.reply({
					content: '❌ Something went wrong changing your account.',
					flags: MessageFlags.Ephemeral
				});
			}
		} 
		
		// check account
		else if (interaction.customId.startsWith('checkAccountButton:')) {
			try {
				const existingSignUp = await getExistingRSN(userId, eventId);
				if (!existingSignUp) {
					return await interaction.reply({
						content: `⚠️ You are not currently signed up for this event.`,
						flags: MessageFlags.Ephemeral
					});
				}
				return await interaction.reply({
					content: `✅ You are signed up for this event under: ${existingSignUp.rsn}`,
					flags: MessageFlags.Ephemeral
				});
			} catch (err) {
				console.error('Modal error:', err);

				await interaction.reply({
					content: '❌ Something went wrong checking your signup.',
					flags: MessageFlags.Ephemeral
				});
			}
		}
		return;
	}

	// modal submissions
	if (interaction.isModalSubmit()) {
		if (interaction.customId.startsWith('signupmodal:')) {

			const eventId = interaction.customId.split(':')[1];
			const userId = interaction.user.id;
			const rsnInput = interaction.fields.getTextInputValue('rsninput');

			// hold reply until it knows if its a dupe submission or not
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			try {
				// TODO only emerald+ ranks can sign up
				// TODO validate RSN against list of IF players
				// TODO bot auto assigns event participant role after accepting sign up

				// get clan member list from file
				const parsedCSVData = await readFromFile('outputs', 'parsedcsv');
				const validatedRSN = await validateRSN(rsnInput, parsedCSVData);

				if (validatedRSN) {
					// add values to db
					db.prepare(`
						INSERT INTO event_signups
						(event_id, user_id, username, rsn, created_at)
						VALUES (?, ?, ?, ?, ?)
						`).run(
						eventId,
						userId,
						interaction.user.username,
						rsnInput,
						Date.now()
					);

					// update sign ups count from database
					const signupCount = await getUpdatedSignUpCount(eventId);
					const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
					updatedEmbed.data.fields[1].value = `${signupCount}`;

					await interaction.message.edit({
						embeds: [updatedEmbed]
					});

					// edit the reply for good submission
					return interaction.editReply({
						content: `✅ Successfully signed up with: ${rsnInput}`
					})
				} else {
					return interaction.editReply({
						content: `❌ Could not find rsn: ${rsnInput}. Please try again.`
					})
				}

				
			} catch (error) {
				console.error("Modal submit error: ", error);

				if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
					// check if user already signed up for this event
					const existingSignUp = await getExistingRSN(userId, eventId);

					// edit the reply for dupe submission
					return interaction.editReply({
						content: `⚠️ You are already signed up for this event under: ${existingSignUp.rsn}`
					});
				}

				// send error message to user
				return interaction.editReply({
					content: "❌ Something went wrong while saving your signup. Please try again."
				});
			}
		} else if (interaction.customId.startsWith('changeaccountmodal:')) {
			const eventId = interaction.customId.split(':')[1];
			const userId = interaction.user.id;
			const changersnInput = interaction.fields.getTextInputValue('changersninput');

			// hold reply
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			try {
				const changes = await updateExistingRSN(userId, eventId, changersnInput);

				if (changes === 0) {
					return await interaction.editReply({
						content: `⚠️ You are not currently signed up for this event.`,
						flags: MessageFlags.Ephemeral
					});
				} 

				return interaction.editReply({
					content: `✅ Successfully changed sign up to: ${changersnInput}`,
					flags: MessageFlags.Ephemeral
				});
			} catch (error) {
				console.error("Modal submit error: ", error);
				return interaction.editReply({
					content: "❌ Something went wrong while editing your signup. Please try again."
				});
			}	
		}
	}
});

client.once(Events.ClientReady, c => {
	console.log(`Logged in as ${c.user.tag}`);
});

client.login(token);
