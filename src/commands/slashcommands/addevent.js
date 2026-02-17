import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getGroupRSN_ToCSV, parseDataFromCSV } from '../../data/data-cleaning/getdata.js';
import { createSignupActionRow } from '../../helpers/EventButtons.js';
import { db } from '../../database.js';


// ----------------- ADD EVENT --------------------- //
export default {
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
        ),

    async execute(interaction) {
        const attachment = interaction.options.getAttachment('image'); 
        const title = interaction.options.getString('eventname');
        const description = interaction.options.getString('description');
        const teamsizes = interaction.options.getInteger('teamsizes');

        const embedWithStuff = new EmbedBuilder()
            .setImage(attachment.url) 
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
        const parsedData = await parseDataFromCSV(groupCSV, `parsedcsv${eventId}`, 'outputs');

        await interaction.reply({ 
            embeds: [embedWithStuff],
            components: [createSignupActionRow(eventId)] }
        );

        return parsedData;
    }
}