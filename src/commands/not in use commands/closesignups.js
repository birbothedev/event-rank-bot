import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { db } from '../../database.js';

// ----------------- CLOSE SIGN UPS --------------------- //
export default {
    data: new SlashCommandBuilder()
        .setName('closesignups')
        .setDescription('Closes sign ups and prevents new submissions.'),

    async execute(interaction) {
        await interaction.reply(
            'test reply'
        );
    }
}