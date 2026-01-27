import { client } from "./womclient.js";

export async function validateRSN(rsn){
    const players = await client.players.searchPlayers(rsn, { limit: 1 });

    if (!players || players.length === 0) {
        return false;
    }

    const player = players[0];
    return player.type !== 'unknown';
}

export async function rankAllPlayers(players){
    // TODO end goal: return json file of all ranked players as text file, have the bot send the text file as an attachment in a message

    return;
}