import { db } from '../database.js';
import { getGroupRSN_ToCSV, parseDataFromCSV } from '../data/data-cleaning/getdata.js';

export async function getUpdatedSignUpCount(eventId) {
	const getSignUpCount = db.prepare(`
                SELECT COUNT(rsn) AS count
                FROM event_signups
                WHERE event_id = ?
            `).get(eventId);

	return getSignUpCount.count;
}

export async function getExistingRSN(userId, eventId){
    const existingSignUp = db.prepare(`
        SELECT rsn
        FROM event_signups
        WHERE user_id = ? AND event_id = ?
    `).get(userId, eventId);

    return existingSignUp;
}

export async function addSignUp(eventId, userId, username, rsn, captain, timezone){
    const row = db.prepare(`
            INSERT INTO event_signups
            (event_id, user_id, username, rsn, created_at, captain, timezone)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
            eventId,userId,username,rsn,Date.now(),captain,timezone
        );
    return row.changes;
}   

export async function updateExistingRSN(userId, eventId, newrsn, captain, timezone) {
    const row = db.prepare(`
            UPDATE event_signups
            SET rsn = ?, timezone = ?, captain = ?
            WHERE user_id = ? and event_id = ?
        `).run(newrsn, timezone, captain, userId, eventId)

    // returns number of changes so we can check if any changes were made
    return row.changes;
}

export async function validateRSN(rsn, parsedCSVData){
    const foundRSN = parsedCSVData?.find(player => player.player.toLowerCase() === rsn);

    if (!foundRSN){

        console.log("could not find name, refreshing data");
        // refresh clan player list csv
        const groupCSV = await getGroupRSN_ToCSV(9403);
        const parsedData = await parseDataFromCSV(groupCSV, 'parsedcsv', 'outputs');

        // search for player again
        return parsedData.find(player => player.player === rsn);
    }
    return foundRSN ?? null;
}

export async function getPlayerListFromDB(eventId){
    const playerList = db.prepare(`
            SELECT id, rsn, rank, captain, timezone, is_drafted, team_id
            FROM event_signups
            WHERE event_id = ?
        `).all(eventId);

    console.log("player list in command: ", playerList);
    return playerList;
}

export async function getUpdatedEventsList(){
    const getEvents = 
		db.prepare(`
                SELECT name, id 
                FROM events
            `).all();

	return getEvents;
}

export function updatePlayerRankAndPointsInDB(eventId, playerName, playerRank, playerPoints){
    const row = db.prepare(`
            UPDATE event_signups
            SET rank = ?, rank_points = ?
            WHERE rsn = ? and event_id = ?
        `).run(playerRank, playerPoints, playerName, eventId);

    return row.changes;
}

export async function deleteplayer(eventId, rsn){
    const row = db.prepare(`
        DELETE FROM event_signups
        WHERE event_id = ? and rsn = ?
    `).run(eventId, rsn);

    return row.changes;
}

export async function getAllCurrentSignups(eventId){
    const signups = db.prepare(`
        SELECT rsn, captain, timezone
        FROM event_signups
        WHERE event_id = ?
        `).all(eventId);

    return signups;
}