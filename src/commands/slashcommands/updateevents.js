import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getUpdatedEventsList } from '../../helpers/helperfunctions.js';

export default {
    data: new SlashCommandBuilder()
        .setName('updateevents')
        .setDescription('Refresh the list of events from the DB')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ 
            flags: MessageFlags.Ephemeral
        });

        try {
            events = await getUpdatedEventsList();
            await interaction.editReply({
                content: '✅ Successfully updated events list.',
                flags: MessageFlags.Ephemeral
            });
            console.log(events);
        } catch (error){
            console.error('Error updating events:', error);
            await interaction.editReply({
                content: '❌ Something went wrong while attempting to update the events list.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}