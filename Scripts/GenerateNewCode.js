const { oldDecodeConfig } = require("./decodeConfig.js");
const { decodeConfig } = require("./decodeConfig");
const { BASE, setCharset } = require("./Base");
const Savecode = require("./Savecode");

function generateNewCode(savecode, player_name) {
    // Step 1: Decode the old code
    const oldValues = {}; // Initialize oldValues object
    let newValues = Array(decodeConfig.length).fill(0); // Initialize newValues array

    let i = 0;
    oldDecodeConfig.slice().reverse().forEach(([_, max_val]) => {
        oldValues[i] = savecode.Decode(max_val);
        i += 1;
    });

    // Step 2: Translate old values to new values
    // Mapping from old index to new index
    const translationMap = {
        0: 1,    // Deaths
        1: 2,    // Saves
        2: null, // Fire (Skipped)
        3: 3,    // Games
        4: 4,    // Wins
        5: 11,   // Nitro
        6: 'SpecialCase', // RandomVar2
        7: 5,    // WinStreak
        8: 17,   // BlueFire
        9: 16,  // MysticFire
        10: 18,  // PinkFire
        11: 19,  // WhiteFire
        12: 30,  // LightingRed
        13: 31,  // LightningP
        14: 32,  // LightYellow
        15: 33,  // LightGreen
        16: 'SpecialCase', // AllNitros
        17: 'SpecialCase', // RandomVar3
        18: 6,    // R1Time
        19: 7,    // R2Time
        20: 8,    // R3Time
        21: 9,    // R4Time
        22: 10,   // R5Time
        23: 35,   // RedTend
        24: 'SpecialCase', // RVar4
        25: 'SpecialCase', // RVar5
        26: 'SpecialCase', // RVar6
        27: 'SpecialCase', // RVar7
        28: 'SpecialCase', // RVar8
        29: 'SpecialCase', // RVar9
    };

    Object.entries(translationMap).forEach(([oldIndex, newIndex]) => {
        if (newIndex !== null && newIndex !== 'SpecialCase') {
            newValues[newIndex] = oldValues[oldIndex];
        } else if (newIndex === 'SpecialCase') {
            handleSpecialCases(parseInt(oldIndex), oldValues, newValues);
        }
    });

    // Step 3: Encode the new values to produce the new code
    setCharset("NEW");
    const newSaveCode = new Savecode(BASE());
    newValues.forEach((val, index) => {
        const max_val = decodeConfig[index][1];
        newSaveCode.Encode(val, max_val);
    });

    return newSaveCode.Save(player_name, 1);
}

function handleSpecialCases(oldIndex, oldValues, newValues) {
    let value = oldValues[oldIndex];
    switch (oldIndex) {
        case 6:
            // Logic for RandomVar2
            // Modify newValues as needed
            if (value >> 7 & 1) newValues[33] = 1; // Lightnings
            if (value >> 6 & 1) newValues[32] = 1;
            if (value >> 5 & 1) newValues[31] = 1;
            if (value >> 4 & 1) newValues[30] = 1;
            if (value >> 3 & 1) newValues[19] = 1; // White Fire
            if (value >> 2 & 1) newValues[18] = 1; // Pink Fire
            if (value >> 1 & 1) newValues[16] = 1;
            if (value & 1) newValues[17] = 1;
            break;
        case 16:
            // Logic for AllNitros
            // Modify newValues as needed
            if (value >> 3 & 1) newValues[15] = 1;
            if (value >> 2 & 1) newValues[14] = 1;
            if (value >> 1 & 1) newValues[13] = 1;
            if (value & 1) newValues[12] = 1;
            break;
        case 17:
            // Logic for RandomVar3
            // Modify newValues as needed
            if (value >> 6 & 1) newValues[36] = 1;
            if (value >> 5 & 1) newValues[37] = 1;
            if (value >> 4 & 1) newValues[29] = 1;
            if (value >> 3 & 1) newValues[28] = 1;
            if (value >> 2 & 1) newValues[27] = 1;
            if (value >> 1 & 1) newValues[26] = 1;
            if (value & 1) newValues[25] = 1;
            break;
        case 24:
            if (value >> 4 & 1) newValues[24] = 1;
            if (value >> 3 & 1) newValues[23] = 1;
            if (value >> 2 & 1) newValues[22] = 1;
            if (value >> 1 & 1) newValues[21] = 1;
            if (value & 1) newValues[20] = 1;
            break;
        case 25:
            if (value >> 3 & 1) newValues[34] = 1;
            break;
        case 26:
            if (value & 1) newValues[38] = 1;
            break;
        default:
            break;
    }
}

module.exports = generateNewCode;
