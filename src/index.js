import {
	Client,
	GatewayIntentBits,
	Events,
	REST,
	Routes,
	EmbedBuilder,
	ChannelType
} from 'discord.js';
import 'dotenv/config';
import { commands } from './commands.js';

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
	if (!interaction.isChatInputCommand()) return;

	const command = commands.find(
		cmd => cmd.data.name === interaction.commandName
	);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'There was an error executing this command.',
			ephemeral: true
		});
	}
});

client.once(Events.ClientReady, c => {
	console.log(`Logged in as ${c.user.tag}`);
});

client.login(token);
