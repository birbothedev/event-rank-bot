import { client } from "../womclient.js";
import csv from "csv-parser";
import { Readable } from 'stream';
import { writeToFile, delay, readFromFile } from "./output.js";

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

export async function parseCSVWithDBList(DBplayerList, eventId){
    const CSVplayerList = await readFromFile('outputs', `parsedcsv${eventId}`);
    const combinedPlayers = [];

    for (let i=0; i<DBplayerList.length; i++){
        const foundPlayer = CSVplayerList?.find(player => player.player.toLowerCase() === DBplayerList[i].rsn.toLowerCase());

        if (foundPlayer){
            combinedPlayers.push({
                playerName: foundPlayer.player,
                playerClanRank: foundPlayer.clanRank
            });
        }
    }
    return combinedPlayers;
}


export async function getRawPlayerDataFromList(players, exportFileName, TEMP_DIR){
    const playerDetails = [];

    for (let i=0; i < players.length; i++){
        const playerName  = players[i].playerName;
        const playerClanRank = players[i].playerClanRank;
        let success = false;
        let attempt = 0;

        while (!success && attempt < 10){
            attempt++;
            try {
                console.log(
                `(${i + 1}/${players.length}) Fetching gains for ${playerName}, attempt ${attempt}`
                );

                // get player data and add it
                const playerData = await client.players.getPlayerDetails(playerName);
                playerDetails.push({ playerName, playerClanRank, ...playerData });
                success=true;
            } catch (error) {
                // catch too many requests error
                if (error.statusCode === 429) {
                    const waitTime = 15000 * attempt;
                    console.warn(
                        `⚠️ Rate limit hit for ${playerName}, waiting ${
                        waitTime / 1000
                        }s before retry...`
                    );
                    await delay(waitTime);
                } else {
                    console.error(
                        `❌ Error fetching gains for ${playerName}:`,
                        error.message || error
                    );
                    success = true; 
                }
            }
        }
        // 5 seconds between requests
        await delay(2000);
    }

    await writeToFile(playerDetails, exportFileName, TEMP_DIR);
    console.log(`fetched gains for ${playerDetails.length} players. data saved to ${TEMP_DIR}/${exportFileName}`);

    return playerDetails;
}