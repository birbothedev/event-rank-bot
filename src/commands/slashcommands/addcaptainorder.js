import { SlashCommandBuilder, MessageFlags, ChannelType } from 'discord.js';
import { getUpdatedEventsList } from '../../helpers/helperfunctions.js';
import 'dotenv/config';

export default {
    data: new SlashCommandBuilder()
        .setName('addcaptainorder')
        .setDescription('Adds the captain order to be used in the draft to the db.')
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
        await interaction.deferReply({ 
            flags: MessageFlags.Ephemeral 
        });
        const eventId = interaction.options.getString('eventid');
        const channel = interaction.channel;

        try {
            await interaction.editReply({
                content: '🟢 Displaying players for draft...',
                flags: MessageFlags.Ephemeral
            });

        } catch (error){
            console.error('Error:', error);
            await interaction.editReply({
                content: '❌ Something went wrong while attempting to display players for the draft.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}