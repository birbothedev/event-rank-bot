import { createSignUpModal } from "../../../helpers/EventModals.js";
import { getExistingRSN } from "../../../helpers/helperfunctions.js";
import { MessageFlags } from "discord.js";

export default {
    customId: 'signupbutton:', 
    type: 'button',
    async execute(interaction) {
        const eventId = interaction.customId.split(':')[1];
        const userId = interaction.user.id;

        // sign up
        try {
            const existingSignUp = await getExistingRSN(userId, eventId);

            if (existingSignUp){
                return interaction.reply({
                    content: `⚠️ You are already signed up for this event under: ${existingSignUp.rsn}`,
                    flags: MessageFlags.Ephemeral
                });
            }
            // link submission to correct event id
            await interaction.showModal(createSignUpModal(eventId));
        } catch (err) {
            console.error('Modal error:', err);
            await interaction.reply({
                content: '❌ Something went wrong. Please wait a moment and try again',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};