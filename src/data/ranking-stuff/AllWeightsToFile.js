import { writeToFile } from "../data-cleaning/output.js";
import { applyWeightsToPlayerSkills } from "./skill-weights.js";
import { applyWeightsToPlayerBossCount } from "./boss-weights.js";
import { applyWeightsToPlayerEfficiency } from "./efficiency-weights.js";

export async function getAllPlayerWeights(playerData, exportfilename, TEMP_DIR){
    const bossweights = await applyWeightsToPlayerBossCount(playerData);
    const efficiencyweights = await applyWeightsToPlayerEfficiency(playerData);
    const skillweights = await applyWeightsToPlayerSkills(playerData);

    const allWeightsMerged = bossweights.map(bossItem => {
        const playerName = bossItem.playerName;
        const skillItem = skillweights.find(s => s.playerName === playerName);
        const efficiencyItem = efficiencyweights.find(e => e.playerName === playerName);

        return {
            playerName,
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