import { SlashCommandBuilder, MessageFlags, ChannelType, AttachmentBuilder } from 'discord.js';
import { getAllCurrentSignups, getUpdatedEventsList } from '../../helpers/helperfunctions.js';
import 'dotenv/config';
import { filePath, writeToFile } from '../../data/data-cleaning/output.js';

// TODO add rank field to start draft command and run it for each individual rank rather than having to loop the command based on when the rank is finished
export default {
    data: new SlashCommandBuilder()
        .setName('exportsignups')
        .setDescription('Starts the Team Draft.')
        .addStringOption(option => 
            option
                .setName('eventid')
                .setDescription(`The event that the draft will take place for.`)
                .setRequired(true)
                .setAutocomplete(true)
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
        const eventId = interaction.options.getString('eventid');

        try {
            const allSignups = await getAllCurrentSignups(eventId);
            let signupsArray = allSignups.map(p => ({
                rsn: p.rsn,
                region: p.timezone,
                captain: p.captain === 1 ? "yes" : "no"
            }));

            await writeToFile(signupsArray, `exported-signups${eventId}`, 'outputs');

            const exportPath = await filePath('outputs', `exported-signups${eventId}`);
            const fileToReturn = new AttachmentBuilder(exportPath);

            await interaction.channel.send({ 
                content: '✅ Successfully exported all signups from the db.',
                files: [fileToReturn] 
            });

        } catch (error){
            console.error('Error:', error);
            await interaction.reply({
                content: '❌ Something went wrong while attempting to export players.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}