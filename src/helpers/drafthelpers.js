import { db } from "../database.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getPlayerListFromDB } from "./helperfunctions.js";

export const rankOrder = ["Rank 6", "Rank 5", "Rank 4", "Rank 3", "Rank 2", "Rank 1"];

export function ensureAlwaysArray(array){
    if (!Array.isArray(array)) {
        array = [array];
    }
    return array;
}

// Fisher-Yates shuffle method 
function shuffle(array){
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0){
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
    return array;
}

export async function decideCaptainOrder(eventId){
    const captainsArray = [];
    const captains = db.prepare(`
            SELECT user_id, rsn FROM event_signups
            WHERE event_id = ? and captain = 1
        `).all(eventId);

    for (const [index, captain] of captains.entries()){
        captainsArray.push({
            userId: captain.user_id,
            rsn: captain.rsn,
            teamId: index + 1,
        });
    }

    const shuffledCaptains = shuffle(captainsArray);
    return shuffledCaptains;
}

export async function addCaptainsToDB(eventId, shuffled, captainsArray){
    const shuffledCaptains = db.prepare(`
            INSERT INTO draft_state
            (captains, shuffled, event_id)
            VALUES (?, ?, ?)
        `).run(
            JSON.stringify(captainsArray), 
            shuffled, 
            eventId
        );
    
    return shuffledCaptains.changes;
}

export async function areCaptainsAlreadyShuffled(eventId){
    const shuffleBool = db.prepare(`
            SELECT shuffled FROM draft_state
            WHERE event_id = ?
        `).get(eventId);

    return shuffleBool;
}

export async function getCaptainsFromDB(eventId){
    const captains = db.prepare(`
        SELECT captains FROM draft_state
        WHERE event_id = ?
    `).get(eventId);

    return captains;
}

export async function getDraftState(eventId){
    const draftState = db.prepare(`
        SELECT turn_index, captains FROM draft_state
        WHERE event_id = ?
        `).get(eventId);

    return draftState || 0;
}

export async function advanceDraftTurn(eventId, captainsArray){
    const currentTurn = db.prepare(`
        SELECT turn_index FROM draft_state
        WHERE event_id = ?
        `).get(eventId);

    let nextTurn;
    if (currentTurn < captainsArray.length() - 1){
        nextTurn = currentTurn + 1;
    } else {
        nextTurn = 0;
    }

    const row = db.prepare(`
            UPDATE draft_state
            SET turn_index = ?
            WHERE event_id = ?
        `).run(nextTurn, eventId);

    return row.changes;
}

export async function displayDraftMessages(players, eventId, channel) {
    ensureAlwaysArray(players);
    
    for (const player of players) {
        const message = `**RSN:** ${player.rsn}\n**Rank:** ${player.rank}\n**Region:** ${player.timezone.toUpperCase()}`;
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`recruitbutton:${eventId}:${player.id}`)
                .setLabel(`🎯 Recruit ${player.rsn}`)
                .setStyle(ButtonStyle.Primary)
        );

        await channel.send({
            content: message,
            components: [row]
        });
    }
}

export async function getPlayersByRank(eventId, rankIndex){
    const playerList = await getPlayerListFromDB(eventId);
    const playerListWithoutCaptains = playerList.filter(player => player.captain === 0);
    const getNonDraftedPlayers = playerListWithoutCaptains.filter(player => player.is_drafted === 0);

    let playersInRank = getNonDraftedPlayers.filter(player => player.rank === rankIndex);
    ensureAlwaysArray(playersInRank);

    return playersInRank;
}

export async function getRankOrderIndex(eventId){
    const rankIndex = db.prepare(`
        SELECT rank_index FROM draft_state
        WHERE event_id = ?
        `).get(eventId);
    return rankIndex;
}

export async function advanceRankIndex(eventId){
    const rankIndex = await getRankOrderIndex(eventId);

    const nextIndex = rankIndex.rank_index + 1;
    const updated = db.prepare(`
        UPDATE draft_state
        SET rank_index = ?
        WHERE event_id = ?
    `).run(nextIndex, eventId);

    return updated.changes;
}

export async function updateDraftedStateForUser(isDrafted, playerId, eventId) {
    const row = db.prepare(`
            UPDATE event_signups
            SET is_drafted = ?
            WHERE id = ? and event_id = ?
        `).run(isDrafted, playerId, eventId)

    return row.changes;
}

export async function updateRankIndex(rankIndex, eventId) {
    const row = db.prepare(`
            UPDATE draft_state
            SET rank_index = ?
            WHERE event_id = ?
        `).run(rankIndex, eventId)

    return row.changes;
}

export async function recruitPlayerToTeam(teamId, playerId, eventId){
    await updateDraftedStateForUser(1, playerId, eventId);
    const player = db.prepare(`
        UPDATE event_signups 
        SET team_id = ?
        WHERE id = ? and event_id = ?
        `).run(teamId, playerId, eventId);
    return player.changes;
}

export async function assignTeamsToCaptains(teamId, userId, rsn, eventId){
    const captain = db.prepare(`
        UPDATE event_signups 
        SET team_id = ?
        WHERE user_id = ? and rsn = ? and event_id = ? 
        `).run(teamId, userId, rsn, eventId);
    return captain.changes;
}

export async function getCaptainTeamId(userId, eventId){
    const team = db.prepare(`
        SELECT team_id FROM event_signups
        WHERE user_id = ? and event_id = ?
        `).get(userId, eventId);
    
    return team;
}