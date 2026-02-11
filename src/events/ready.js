import { Events, EmbedBuilder, ChannelType } from "discord.js";
import 'dotenv/config';

const CHANNEL_ID = process.env.CHANNEL_ID;

const welcomeEmbed = new EmbedBuilder()
    .setColor(0x00FF00) // Green color
    .setTitle('OSRS Event Bot Online!')
    .setDescription('Hello everyone! I have just successfully connected to the Discord API.')
    .addFields(
        { name: 'Admin Only Event Commands', value: 'Use these commands to add or update event information:\n**/addevent**\nUse this command to add an event\n**/closeevent**\nUse this command to close the signups for an event.\n**/openevent**\nUse this command to re-open an existing event for signups.' },
        { name: 'Admin Only Player Commands', value: 'Use these commands to add or update player information:\n**/deleteplayer**\nUse this command to delete a player from the database.' },
    )
    .setTimestamp()
    .setFooter({ text: 'OSRS Event Bot', iconURL: 'https://twemoji.maxcdn.com/v/latest/72x72/1f525.png' });

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client){
        console.log(`Logged in as ${client.user.tag}`)

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
    }
}