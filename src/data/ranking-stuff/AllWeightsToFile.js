import { writeToFile } from "../data-cleaning/output.js";
import { applyWeightsToPlayerSkills } from "./skill-weights.js";
import { applyWeightsToPlayerBossCount } from "./boss-weights.js";
import { applyWeightsToPlayerEfficiency } from "./efficiency-weights.js";

function getPlayerClanRankWeight(rank){
    if (rank === "zenyte") return 5;
        else if (rank === "onyx") return 4;
        else if (rank === "dragonstone") return 3;
        else if (rank === "diamond") return 2;
        else if (rank === "ruby") return 1;
        else if (rank === "emerald") return 0;
        else return 0;
}

async function applyWeightsToPlayerClanRank(playerData){
    const playerClanRank = playerData.map(player => ({
        playerName: player.playerName,
        clanRank: player.playerClanRank
    }));

    const weightedRank = playerClanRank.map(player => {
        const rankWeights = getPlayerClanRankWeight(player.clanRank);

        return {
            playerName: player.playerName,
            rankWeights
        }
    });

    return weightedRank;
}

export async function getAllPlayerWeights(playerData, exportfilename, TEMP_DIR){
    const bossweights = await applyWeightsToPlayerBossCount(playerData);
    const efficiencyweights = await applyWeightsToPlayerEfficiency(playerData);
    const skillweights = await applyWeightsToPlayerSkills(playerData);
    const clanRankWeights = await applyWeightsToPlayerClanRank(playerData);

    const allWeightsMerged = bossweights.map(bossItem => {
        const playerName = bossItem.playerName;
        const skillItem = skillweights.find(s => s.playerName === playerName);
        const efficiencyItem = efficiencyweights.find(e => e.playerName === playerName);
        const rankItem = clanRankWeights.find(c => c.playerName === playerName);

        return {
            playerName,
            clanRank: rankItem.rankWeights,
            data: {
            bossWeights: {
                t1: bossItem.t1weights,
                t2: bossItem.t2weights,
                t3: bossItem.t3weights,
                t4: bossItem.t4weights,
                t5: bossItem.t5weights,
                toa: bossItem.toaWeights,
                tob: bossItem.tobWeights,
                cox: bossItem.coxWeights
            },
            skills: {
                weightedCombats: skillItem ? skillItem.weightedCombats : {},
                weightedSkilling: skillItem ? skillItem.weightedSkilling : {}
            },
            efficiency: {
                ehp: efficiencyItem ? efficiencyItem.ehpWeights : {},
                ehb: efficiencyItem ? efficiencyItem.ehbWeights : {}
            }
        }
        };
    });

    await writeToFile(allWeightsMerged, exportfilename, TEMP_DIR);
    return allWeightsMerged;
}