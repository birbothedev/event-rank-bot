import { db } from '../database.js';

export async function getUpdatedSignUpCount(eventId) {
	const getSignUpCount = 
		await db.prepare(`
                SELECT COUNT(rsn) AS count
                FROM event_signups
                WHERE event_id = ?
            `).get(eventId);

	return getSignUpCount.count;
}

export async function getExistingRSN(userId, eventId){
    const existingSignUp = await db.prepare(`
        SELECT rsn
        FROM event_signups
        WHERE user_id = ? AND event_id = ?
    `).get(userId, eventId);

    return existingSignUp;
}

export async function updateExistingRSN(userId, eventId, newrsn) {
    const row = db.prepare(`
            UPDATE event_signups
            SET rsn = ?
            WHERE user_id = ? and event_id = ?
        `).run(newrsn, userId, eventId)

    // returns number of changes so we can check if any changes were made
    return row.changes;
}