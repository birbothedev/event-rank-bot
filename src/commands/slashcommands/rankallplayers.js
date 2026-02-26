import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { buildEventSelectMenu } from '../../helpers/EventSelectDropdown.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rankallplayers')
        .setDescription('Runs the rank script on all players. Please only run after sign ups have closed.'),

    async execute(interaction) {
        await interaction.deferReply({ 
            flags: MessageFlags.Ephemeral
        });

        const eventRow = await buildEventSelectMenu('rank');

        try {
            await interaction.editReply({
                content: 'Please choose an event.',
                components: [eventRow],
                flags: MessageFlags.Ephemeral
            });

        } catch (error){
            console.error('Error:', err);
            await interaction.editReply({
                content: '❌ Something went wrong while attempting to update the events list.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}