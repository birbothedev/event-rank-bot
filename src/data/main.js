import { db } from "../database";

export function getPlayers(eventId){
    const dbPlayers = db.prepare(`
        SELECT rsn FROM event_signups
        WHERE event_id = ?
    `).get(eventId);

    dbPlayers.forEach(player => {
        
    })
}