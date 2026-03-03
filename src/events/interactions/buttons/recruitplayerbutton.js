import { MessageFlags } from "discord.js";
import 'dotenv/config';
import { rankOrder, advanceRankIndex, getPlayersByRank, getRankOrderIndex, updateDraftedStateForUser, displayDraftMessages, recruitPlayerToTeam, getCaptainTeamId } from "../../../helpers/drafthelpers.js";

export default {
    customId: 'recruitbutton:', 
    type: 'button',
    async execute(interaction) {
        const eventId = interaction.customId.split(':')[1];
        const playerId = interaction.customId.split(':')[2];
        const userId = interaction.user.id;
        const CAPTAIN_ROLE_ID = process.env.CAPTAIN_ROLE_ID;

        // ensure only team captains can click recruit buttons
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member.roles.cache.has(CAPTAIN_ROLE_ID)) {
            return interaction.reply({
                content: "❌ You do not have permission to use this button.",
                flags: MessageFlags.Ephemeral
            });
        }
        // ensure captains can only interact with buttons on their turn
        const draft = await getDraftState(eventId);
        const currentTurn = draft.captains[draft.turn_index || 0];
        if (userId !== currentTurn.userId){
            return interaction.reply({
                content: "❌ Nice try. Please wait your turn.",
                flags: MessageFlags.Ephemeral
            });
        }

        try {
            // delete the message and button once its clicked
            await interaction.message.delete().catch(err => {
                console.error("Failed to delete message:", err);
            });

            // update draft state for recruited player and assign team id
            await updateDraftedStateForUser(1, playerId, eventId);
            const teamId = await getCaptainTeamId(userId, eventId);
            console.log(teamId);
            await recruitPlayerToTeam(teamId.team_id, playerId, eventId);
            

            // update draft messages with button click listener
            let rankIndex = await getRankOrderIndex(eventId);
            let players = await getPlayersByRank(eventId, rankOrder[rankIndex.rank_index]);
            // check if all players have been drafted
            const allDrafted = players.every(p => p.is_drafted === 1);
            if (allDrafted) {
                await advanceRankIndex(eventId);
                rankIndex = await getRankOrderIndex(eventId);
                players = await getPlayersByRank(eventId, rankOrder[rankIndex.rank_index]);

                let attempts = 0;
                while (players.every(p => p.is_drafted === 1) && attempts < rankOrder.length) {
                    await advanceRankIndex(eventId);
                    rankIndex = await getRankOrderIndex(eventId);
                    players = await getPlayersByRank(eventId, rankOrder[rankIndex.rank_index]);
                    attempts++;
                }
                if (players.length === 0) {
                    console.log("No players left to draft");
                    await interaction.channel.send({
                        content: `🌟 Successfully completed the Draft! 🌟 `
                    })
                    return;
                }
                await displayDraftMessages(players, eventId, interaction.channel);
            }
        } catch (err) {
            console.error('Error:', err);
            await interaction.reply({
                content: '❌ Something went wrong while attempting to recruit this player.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};