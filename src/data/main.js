import { db } from "../database";

export function getPlayers(){
    const dbPlayers = db.prepare("SELECT rsn FROM event_signups").all();

    dbPlayers.forEach(player => {
        

    })
}