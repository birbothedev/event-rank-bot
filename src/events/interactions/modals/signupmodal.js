import { db } from "../../../database.js";
import { getExistingRSN, getUpdatedSignUpCount, validateRSN } from "../../../helpers/helperfunctions.js";
import { MessageFlags, EmbedBuilder } from "discord.js";
import { readFromFile } from "../../../data/data-cleaning/output.js";

export default {
    customId: 'signupmodal:', 
    type: 'modal',
    async execute(interaction) {
        const eventId = interaction.customId.split(':')[1];
        const userId = interaction.user.id;
        const rsnInput = interaction.fields.getTextInputValue('rsninput');

        const normalizedRSN = rsnInput.toLowerCase();

        // hold reply until it knows if its a dupe submission or not
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            // TODO only emerald+ ranks can sign up
            // TODO bot auto assigns event participant role after accepting sign up
            
            // get clan member list from file
            const parsedCSVData = await readFromFile('outputs', `parsedcsv${eventId}`);
            const validatedRSN = await validateRSN(normalizedRSN, parsedCSVData);

            if (validatedRSN) {
                // add values to db
                db.prepare(`
                    INSERT INTO event_signups
                    (event_id, user_id, username, rsn, created_at)
                    VALUES (?, ?, ?, ?, ?)
                    `).run(
                    eventId,
                    userId,
                    interaction.user.username,
                    normalizedRSN,
                    Date.now()
                );

                // update sign ups count from database
                const signupCount = await getUpdatedSignUpCount(eventId);
                const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
                updatedEmbed.data.fields[1].value = `${signupCount}`;

                await interaction.message.edit({
                    embeds: [updatedEmbed]
                });

                // edit the reply for good submission
                return interaction.editReply({
                    content: `✅ Successfully signed up with: ${rsnInput}`
                })
            } else {
                return interaction.editReply({
                    content: `❌ Could not find rsn: ${rsnInput}. Please try again.`
                })
            }

            
        } catch (error) {
            console.error("Modal submit error: ", error);

            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                // check if user already signed up for this event
                const existingSignUp = await getExistingRSN(userId, eventId);

                // edit the reply for dupe submission
                return interaction.editReply({
                    content: `⚠️ You are already signed up for this event under: ${existingSignUp.rsn}`
                });
            }

            // send error message to user
            return interaction.editReply({
                content: "❌ Something went wrong while saving your signup. Please try again."
            });
        }
    }
};