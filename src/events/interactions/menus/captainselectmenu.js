import { MessageFlags, AttachmentBuilder, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { db } from "../../../database.js";

export default {
    customId: 'eventselect:captains', 
    type: 'selectMenu',
    async execute(interaction) {
        const eventId = interaction.values[0];

        try {
            await interaction.deferUpdate();
            const event = db.prepare(`
                SELECT name FROM events
                WHERE id = ?
                `).get(eventId);

            const players = db.prepare(`
                SELECT rsn FROM event_signups
                WHERE event_id = ?
                `).all(eventId);
            
            const selectOptions = players.map(player => 
                new StringSelectMenuOptionBuilder()
                    .setLabel(player.name)
                    .setValue(player.id.toString())
                );

            const playerSelectMenu = new StringSelectMenuBuilder()
                .setCustomId('captainplayerselect')
                .setPlaceholder('Select players')
                .addOptions(selectOptions);

            const playersRow = new ActionRowBuilder().addComponents(playerSelectMenu);

            await interaction.editReply({ 
                content: `🟢 Please choose team captains for ${event.name}...`,
                components: [playersRow]
            });

        } catch (error) {
            console.error('Error Ranking Players:', error);

            await interaction.followUp({
                content: '❌ Something went wrong while attempting to choose team captains',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};