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
        6: 11,   // Nitro
        7: 'SpecialCase', // RandomVar2
        5: 5,    // WinStreak
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
            if((newIndex === 18 || newIndex === 19 || newIndex === 20 || newIndex === 21 || newIndex === 22) && oldValues[oldIndex] >= 300) // Time
                newValues[newIndex] = 300;
            else
                newValues[newIndex] = oldValues[oldIndex];
        }
        else if (newIndex === 'SpecialCase') {
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
        case 7: {
            const bitPositions = [33, 32, 31, 30, 19, 18, 16, 17]; // Corresponding newValues indices
            const maxBitMask = 0b11111111; // 8 bits for RandomVar2
            if (value > maxBitMask) {
                bitPositions.forEach(index => newValues[index] = 1); // Grant all rewards
            } else {
                for (let i = 0; i < bitPositions.length; i++) {
                    if (value >> (bitPositions.length - 1 - i) & 1) {
                        newValues[bitPositions[i]] = 1;
                    }
                }
            }
            break;
        }
        case 16: {
            const bitPositions = [15, 14, 13, 12];
            const maxBitMask = 0b1111; // 4 bits for AllNitros
            if (value > maxBitMask) {
                bitPositions.forEach(index => newValues[index] = 1);
            } else {
                for (let i = 0; i < bitPositions.length; i++) {
                    if (value >> (bitPositions.length - 1 - i) & 1) {
                        newValues[bitPositions[i]] = 1;
                    }
                }
            }
            break;
        }
        case 17: {
            const bitPositions = [36, 37, 29, 28, 27, 26, 25];
            const maxBitMask = 0b1111111; // 7 bits for RandomVar3
            if (value > maxBitMask) {
                bitPositions.forEach(index => newValues[index] = 1);
            } else {
                for (let i = 0; i < bitPositions.length; i++) {
                    if (value >> (bitPositions.length - 1 - i) & 1) {
                        newValues[bitPositions[i]] = 1;
                    }
                }
            }
            break;
        }
        case 24: {
            const bitPositions = [24, 23, 22, 21, 20];
            const maxBitMask = 0b11111; // 5 bits RandomVar4
            if (value > maxBitMask) {
                bitPositions.forEach(index => newValues[index] = 1);
            } else {
                for (let i = 0; i < bitPositions.length; i++) {
                    if (value >> (bitPositions.length - 1 - i) & 1) {
                        newValues[bitPositions[i]] = 1;
                    }
                }
            }
            break;
        }
        case 25: {
            const bitPositions = [34];
            const maxBitMask = 0b1000; // 4th bit for RandomVar5
            if (value > maxBitMask) {
                bitPositions.forEach(index => newValues[index] = 1);
            } else {
                if (value >> 3 & 1) newValues[34] = 1;
            }
            break;
        }
        case 26: {
            const bitPositions = [38];
            const maxBitMask = 0b1; // 1st bit for RandomVar6
            if (value > maxBitMask) {
                bitPositions.forEach(index => newValues[index] = 1);
            } else {
                if (value & 1) newValues[38] = 1;
            }
            break;
        }
        default:
            break;
    }
}



module.exports = generateNewCode;
