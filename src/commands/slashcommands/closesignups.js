import { SlashCommandBuilder, ChannelType, EmbedBuilder } from 'discord.js';
import 'dotenv/config';
import { getUpdatedEventsList } from '../../helpers/helperfunctions.js';
import { db } from '../../database.js';

// ----------------- CLOSE SIGN UPS --------------------- //
export default {
    data: new SlashCommandBuilder()
        .setName('closesignups')
        .setDescription('Closes sign ups and prevents new submissions.')
        .addStringOption(option =>
            option
                .setName('events')
                .setDescription('Choose an event')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addAttachmentOption(option =>
            option
                .setName('image')
                .setDescription('The image file to upload')
                .setRequired(true) 
        ),

    async autocomplete(interaction){
        const eventname = interaction.options.getFocused(true);
        const eventList = await getUpdatedEventsList();

        const choices = eventList.map(e => ({name: e.name, id: e.id}));
        const filtered = choices.filter(choice => choice.name.startsWith(eventname.value));

        await interaction.respond(
            filtered.slice(0, 25).map(choice => ({name: choice.name, value: choice.id.toString()}))
        );
    },

    async execute(interaction) {
        const selectedEventId = interaction.options.getString('events');
        const attachment = interaction.options.getAttachment('image');

        // delete old embed
        const channel = interaction.channel;
        const messages = await channel.messages.fetch({ limit: 50 });
        const botMessages = messages.filter(
            m => m.author.id === interaction.client.user.id && m.embeds.length > 0 );
        if (channel && channel.type === ChannelType.GuildText) {
            for (const [id, msg] of botMessages) {
                await msg.delete().catch(console.error);
            }
        }

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
            embeds: [embed] }
        );
    }
}