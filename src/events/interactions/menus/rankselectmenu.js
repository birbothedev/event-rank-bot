import { MessageFlags, AttachmentBuilder } from "discord.js";
import { getPlayerListFromDB, updatePlayerRankAndPointsInDB } from "../../../helpers/helperfunctions.js";
import { rankAllPlayers } from "../../../data/main.js";
import { getGroupRSN_ToCSV, parseCSVWithDBList } from "../../../data/data-cleaning/getdata.js";
import { db } from "../../../database.js";
import { filePath, readFromFile } from "../../../data/data-cleaning/output.js";

export default {
    customId: 'eventselect:rank', 
    type: 'selectMenu',
    async execute(interaction) {
        const eventId = interaction.values[0];

        try {
            const event = db.prepare(`
                SELECT name FROM events
                WHERE id = ?
                `).get(eventId);

            await interaction.update({ 
                content: `🟢 Ranking all players from ${event.name}...`,
                components: []
            });

            // rank players
            const groupData = await getGroupRSN_ToCSV(9403);
            const playerList = await getPlayerListFromDB(eventId);
            if (playerList.length === 0){
                console.log("No player list found!");
            }
            const parsedPlayerList = await parseCSVWithDBList(playerList, groupData);
            await rankAllPlayers(parsedPlayerList, eventId);

            const rankedFilePath = await filePath('outputs', `ranked-data${eventId}`);
            const fileToReturn = new AttachmentBuilder(rankedFilePath);
            await interaction.channel.send({ 
                content: '✅ Successfully ranked players. Adding ranks to database...',
                files: [fileToReturn] });

            // add player ranks to db
            const rankedPlayers = await readFromFile('outputs', `ranked-data${eventId}`);
            let changes;
            for (const player of rankedPlayers) {
                const { playerName, rank, points } = player;
                const normalizedRSN = playerName.toLowerCase();
                changes = updatePlayerRankAndPointsInDB(eventId, normalizedRSN, rank, points);
            }

            if (!changes){
                await interaction.channel.send({ 
                    content: '❌ Something went wrong while attempting to add ranks to database.',
                });
            }

            await interaction.channel.send({ 
                content: '✅ Successfully added ranks to database.',
            });
        } catch (error) {
            console.error('Error Ranking Players:', error);

            await interaction.followUp({
                content: '❌ Something went wrong while attempting to rank players.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};