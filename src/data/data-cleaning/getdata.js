import { client } from "../womclient.js";
import csv from "csv-parser";
import { Readable } from 'stream';
import { writeToFile } from "./output.js";

export async function getGroupRSN_ToCSV(groupNumber){
    const group = await client.groups.getMembersCSV(groupNumber);
    return group;
}

export async function parseDataFromCSV(groupData, exportFileName, TEMP_DIR){
    const parsedData = await new Promise((res, rej) => {
        const rows = [];

        Readable.from(groupData)
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', () => res(rows))
            .on('error', rej)
    });

    const cleanedData = parsedData.map(player => {
        const playerName = player.Player;
        const playerClanRank = player.Role;

        return {
            player: playerName,
            clanRank: playerClanRank
        }
    });

    writeToFile(cleanedData, exportFileName, TEMP_DIR);

    return cleanedData;
}
