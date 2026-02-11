import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { buildEventSelectMenu } from '../../helpers/EventSelectDropdown.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rankallplayers')
        .setDescription('Runs the rank script on all players. Please only run after sign ups have closed.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ 
            flags: MessageFlags.Ephemeral
        });

        const eventRow = await buildEventSelectMenu();

        try {
            await interaction.editReply({
                content: 'Please choose an event.',
                components: [eventRow],
                flags: MessageFlags.Ephemeral
            });
            
        } catch (error){
            console.error('Error updating events:', error);
            await interaction.editReply({
                content: '❌ Something went wrong while attempting to update the events list.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}