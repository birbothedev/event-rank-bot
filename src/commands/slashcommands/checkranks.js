import { SlashCommandBuilder, MessageFlags, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { getAllCurrentSignups, getUpdatedEventsList } from '../../helpers/helperfunctions.js';
import 'dotenv/config';
import { filePath, writeToFile } from '../../data/data-cleaning/output.js';
import { getGroupRSN_ToCSV, parseCSVWithDBList, parseDataFromCSV } from '../../data/data-cleaning/getdata.js';

// TODO add rank field to start draft command and run it for each individual rank rather than having to loop the command based on when the rank is finished
export default {
    data: new SlashCommandBuilder()
        .setName('checkranks')
        .setDescription('Returns a list of any Achievers currently signed up for the event.')
        .addStringOption(option => 
            option
                .setName('eventid')
                .setDescription(`The event that the search will take place for.`)
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

        await interaction.deferReply({ 
            
        });

        try {
            const groupData = await getGroupRSN_ToCSV(9403);
            const allSignups = await getAllCurrentSignups(eventId);

            const signupData = await parseCSVWithDBList(allSignups, groupData);
            const players = signupData.filter(player => player.playerClanRank === "achiever")

            if (players.length === 0){
                await interaction.editReply({
                    content: '✅ No Achievers currently signed up for the event.'
                });
                return;
            }

            const achieverEmbed = new EmbedBuilder()
                .setTitle(`Players in **Achiever** rank:`)
                .setColor(0x0099ff)
                .addFields(
                    ...players.map(player => ({
                        name: player.playerName,
                        value: player.playerClanRank
                    }))
                )

            await interaction.editReply({
                embeds: [achieverEmbed]
            });

        } catch (error){
            console.error('Error:', error);
            await interaction.editReply({
                content: '❌ Something went wrong while attempting to export players.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}