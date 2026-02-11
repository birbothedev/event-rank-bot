import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { db } from '../../database.js';
import { getUpdatedEventsList } from '../../helpers/helperfunctions.js';
import { createSignupActionRow } from '../../helpers/EventButtons.js';

const events = await getUpdatedEventsList();

// ----------------- RE OPEN EXISTING EVENT --------------------- //
export default {
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