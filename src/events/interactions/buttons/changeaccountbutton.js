import { createChangeAccountModal } from "../../../helpers/EventModals.js";
import { getExistingRSN } from "../../../helpers/helperfunctions.js";
import { MessageFlags } from "discord.js";

export default {
    customId: 'changeAccountButton:', 
    type: 'button',
    async execute(interaction) {
        const eventId = interaction.customId.split(':')[1];
        const userId = interaction.user.id;
        
        try {
            const existingSignUp = await getExistingRSN(userId, eventId);
            if (!existingSignUp) {
                return await interaction.reply({
                        content: `⚠️ You are not currently signed up for this event.`,
                        flags: MessageFlags.Ephemeral
                });
            }
            await interaction.showModal(createChangeAccountModal(eventId));
        } catch (err) {
            console.error('Modal error:', err);
            await interaction.reply({
                content: '❌ Something went wrong changing your account.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};