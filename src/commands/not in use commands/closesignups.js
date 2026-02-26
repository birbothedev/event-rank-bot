import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import 'dotenv/config';

const CHANNEL_ID = process.env.CHANNEL_ID;

// ----------------- CLOSE SIGN UPS --------------------- //
export default {
    data: new SlashCommandBuilder()
        .setName('closesignups')
        .setDescription('Closes sign ups and prevents new submissions.'),

    async execute(interaction) {
        const message = CHANNEL_ID.messages.fetch({ limit: 10, cache: false });

        // Get the components from the original message
        const originalComponents = message.components;

        // Create new ActionRows with disabled buttons
        const disabledComponents = originalComponents.map(row => {
            const disabledButtons = row.components.map(button =>
                ButtonBuilder.from(button).setDisabled(true) // Convert to mutable ButtonBuilder and disable
            );
            return new ActionRowBuilder().setComponents(disabledButtons);
        });

        await interaction.message.edit({
            components: disabledComponents
        }).catch(console.error);
    }
}