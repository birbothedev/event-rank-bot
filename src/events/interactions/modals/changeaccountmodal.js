import { updateExistingRSN, validateRSN } from "../../../helpers/helperfunctions.js";
import { MessageFlags } from "discord.js";
import { readFromFile } from "../../../data/data-cleaning/output.js";

export default {
    customId: 'changeaccountmodal:', 
    type: 'modal',
    async execute(interaction) {
        const eventId = interaction.customId.split(':')[1];
        const userId = interaction.user.id;
        const changersnInput = interaction.fields.getTextInputValue('changersninput');

        const normalizedRSN = changersnInput.toLowerCase();
        const timezone = interaction.fields.getStringSelectValues('changetimezoneinput');

        // get clan member list from file
        const parsedCSVData = await readFromFile('outputs', `parsedcsv${eventId}`);
        const validatedRSN = await validateRSN(normalizedRSN, parsedCSVData);

        // hold reply
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            if (validatedRSN) {
                const changes = await updateExistingRSN(userId, eventId, normalizedRSN, timezone);

                if (changes === 0) {
                    return await interaction.editReply({
                        content: `⚠️ Please sign up for the event before attempting to change your account.`,
                        flags: MessageFlags.Ephemeral
                    });
                } 

                return interaction.editReply({
                    content: `✅ Successfully changed sign up to: ${changersnInput}`,
                    flags: MessageFlags.Ephemeral
                });
            }

            return interaction.editReply({
                content: `❌ Could not find rsn: ${changersnInput}`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error("Modal submit error: ", error);
            return interaction.editReply({
                content: "❌ Something went wrong while editing your signup. Please try again."
            });
        }
    }
}