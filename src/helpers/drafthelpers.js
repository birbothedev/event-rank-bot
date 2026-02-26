import { db } from "../database.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

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

    for (const captain of captains){
        captainsArray.push({
            userId: captain.user_id,
            rsn: captain.rsn
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

export async function displayDraftMessages(players, rankOrder, rankIndex, eventId, channel) {
    if (rankIndex >= rankOrder.length) return;

    const currentRank = rankOrder[rankIndex];
    const playersWithRank = players.filter(player => player.rank === currentRank);

    for (const player of playersWithRank) {
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