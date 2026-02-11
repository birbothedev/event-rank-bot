import { MessageFlags, AttachmentBuilder } from "discord.js";
import { getPlayerListFromDB } from "../../../helpers/helperfunctions.js";
import { rankAllPlayers } from "../../../data/main.js";
import { parseCSVWithDBList } from "../../../data/data-cleaning/getdata.js";
import { db } from "../../../database.js";
import { filePath } from "../../../data/data-cleaning/output.js";

export default {
    customId: 'selectevent', 
    type: 'button',
    async execute(interaction) {
        const eventId = interaction.values[0];

        await interaction.deferReply({ 
            flags: MessageFlags.Ephemeral
        });

        try {
            const event = db.prepare(`
                SELECT name FROM events
                WHERE id = ?
                `).get(eventId);

            await interaction.editReply({ 
                content: `🟢 Ranking all players from ${event.name}...`
            });

            const playerList = await getPlayerListFromDB(eventId);
            const parsedPlayerList = await parseCSVWithDBList(playerList, eventId)
            await rankAllPlayers(parsedPlayerList, eventId);

            const rankedFilePath = await filePath('outputs', `ranked-data${eventId}`);
            const fileToReturn = new AttachmentBuilder(rankedFilePath);
            await interaction.channel.send({ 
                content: '✅ Successfully ranked players.',
                files: [fileToReturn] });
        } catch (error) {
            console.error('Error Ranking Players:', error);

            await interaction.editReply({
                content: '❌ Something went wrong while attempting to rank players.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};