import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { buildEventSelectMenu } from '../../helpers/EventSelectDropdown.js';

export default {
    data: new SlashCommandBuilder()
        .setName('addcaptains')
        .setDescription('Choose Team Captains for the draft.'),

    async execute(interaction) {
        await interaction.deferReply({ 
            flags: MessageFlags.Ephemeral
        });

        const eventRow = await buildEventSelectMenu('captains');

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