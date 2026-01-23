import {
	Client,
	GatewayIntentBits,
	Events,
	REST,
	Routes,
	EmbedBuilder,
	ChannelType,
	MessageFlags,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	LabelBuilder
} from 'discord.js';
import 'dotenv/config';
import { commands } from './commands/commands.js';
import { signupModal } from './helpers/EventModals.js';
import { db } from './database.js';

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
        .setTitle('Bot Online!')
        .setDescription('Hello everyone! I have just successfully connected to the Discord API.')
        .setTimestamp()
        .setFooter({ text: 'Bot Load Message' });

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
		if (interaction.customId.startsWith('signupbutton:')) {
			// grab the event id from the end of the string
			const eventId = interaction.customId.split(':')[1];

			// create sign up modal
			const signupModal = new ModalBuilder()
				.setCustomId(`signupmodal:${eventId}`)
				.setTitle('Event Sign Up');
			
			const rsnInput = new TextInputBuilder()
				.setCustomId('rsninput')
				.setStyle(TextInputStyle.Short)
				.setPlaceholder('RSN of the account you will participate on.')
				.setMaxLength(20)
				.setMinLength(1)
				.setRequired(true);
			const signupLabel = new LabelBuilder()
				.setLabel("Sign Up to Participate")
				.setDescription('Limit 1 account per player.')
				.setTextInputComponent(rsnInput);

			signupModal.addLabelComponents(signupLabel);

			return interaction.showModal(signupModal);
		}
		const [action, eventId] = interaction.customId.split(':');

		if (action === 'signupbutton') {
			try {
				// link submission to correct event id
				await interaction.showModal(signupModal(eventId));
			} catch (err) {
				console.error('Modal error:', err);
			}
		}
		return;
	}

	// modal submissions
	if (interaction.isModalSubmit()) {
		if (interaction.customId.startsWith('signupmodal:')) {

			const eventId = interaction.customId.split(':')[1];

			// hold reply until it knows if its a dupe submission or not
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			try {
				const rsnInput = interaction.fields.getTextInputValue('rsninput');
				const userId = interaction.user.id;

				// check if user already signed up for this event
				const exists = db.prepare(`
					SELECT 1 FROM event_signups 
					WHERE user_id = ?  AND rsn = ? AND event_id = ?
				`).get(userId, rsnInput, eventId);

				if (exists) {
					// edit the reply for dupe submission
					return interaction.editReply({
						content: `⚠️ You are already signed up for this event under: ${rsnInput}`
					})
				}

				// add values to db
				db.prepare(`
					INSERT INTO event_signups
					(event_id, user_id, username, rsn, created_at)
					VALUES (?, ?, ?, ?, ?)
					`).run(
					eventId,
					interaction.user.id,
					interaction.user.username,
					rsnInput,
					Date.now()
				);

				// TODO if name not found on WOM, send error to user
				// TODO send error if user already submitted a name

				// edit the reply for good submission
				return interaction.editReply({
					content: `✅ Successfully signed up with: ${rsnInput}`
				})
			} catch (error) {
				console.error("Modal submit error: ", error);

				// send error message to user
				return interaction.editReply({
					content: "❌ Something went wrong while saving your signup. Please try again."
				});
			}
		}
	}
});

client.once(Events.ClientReady, c => {
	console.log(`Logged in as ${c.user.tag}`);
});

client.login(token);
