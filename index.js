const Savecode = require('./Scripts/Savecode');
const { BASE, setCharset, getCharSet } = require('./Scripts/Base');

// browserify ./Scripts/script.js -o bundle.js

// Example usage
const player_name = "Aches#1817";
const loadtype = 1;

// Initialize Savecode with initial BigNum value of 88
setCharset('OLD')
console.log(getCharSet())
const savecode = new Savecode(BASE());

// Values and their maximum values to encode in the correct order
const values_max_vals = [
    [0, 8],          // RandomVar9
    [0, 8],          // RandomVar8
    [0, 8],          // RandomVar7
    [0, 8],          // RandomVar6
    [0, 16],         // RandomVar5
    [0, 32],         // RandomVar4
    [0, 1],          // EasterEgg
    [0, 600],        // R5Time
    [0, 600],        // R4Time
    [0, 600],        // R3Time
    [0, 300],        // R2Time
    [0, 300],        // R1Time
    [0, 128],        // RandomVar3
    [0, 32],         // AllNitros
    [0, 1],          // LightningGreen
    [0, 1],          // LightningYellow
    [0, 1],          // LightningPurple
    [0, 1],          // LightningRed
    [0, 1],          // WhiteFire
    [0, 1],          // PinkFire
    [0, 1],          // MysticFire
    [0, 1],          // BlueFire
    [0, 999],        // RandomVar2
    [0, 10],         // Nitro
    [0, 999],        // WinStreak
    [0, 9999],       // Wins
    [0, 99999],      // Games
    [0, 99],         // Fire1
    [0, 99999],      // Saves
    [0, 99999],      // Deaths
];

// Encode each value using the maximum values
values_max_vals.forEach(([val, max_val]) => {
    savecode.Encode(val, max_val);
    savecode.DebugLastDigit();  // Debugging LastDigit after each encoding
});

// Generate the final encoded string
const encoded_string = savecode.Save(player_name, loadtype);

console.log(`Encoded Save String: ${encoded_string}`);

// Test the Load function
const loaded_savecode = new Savecode(BASE());
const load_success = loaded_savecode.Load(player_name, "`w%Wm|NX+IMd:h]`9rP2Xe^q*dz?mm", 1);

console.log(`Load success: ${load_success}`);

// Decode the values in reverse order

values_max_vals.slice().reverse().forEach(([_, max_val]) => {
    const decoded_value = loaded_savecode.Decode(max_val);
    console.log(`Decoded value: ${decoded_value}`);
});
