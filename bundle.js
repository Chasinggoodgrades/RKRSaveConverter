(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const BigNum_l = require('./BigNum_l');

class BigNum {
    constructor(base) {
        this.list = BigNum_l.create();
        this.base = base;
    }

    static create(base) {
        return new BigNum(base);
    }

    AddSmall(carry) {
        let cur = this.list;

        if (cur === null) {
            cur = BigNum_l.create();
            this.list = cur;
        }
        while (carry !== 0) {
            let sum_val = cur.leaf + carry;
            carry = Math.floor(sum_val / this.base);
            cur.leaf = sum_val % this.base; // Use modulo for leaf value

            if (cur.next === null) {
                cur.next = BigNum_l.create();
            }
            cur = cur.next;
        }
    }

    MulSmall(x) {
        if (this.list === null) {
            this.list = BigNum_l.create();
        }

        let cur = this.list;
        let carry = 0;
        while (cur !== null || carry !== 0) {
            if (cur !== null) {
                let product = x * cur.leaf + carry;
                carry = Math.floor(product / this.base);
                let remainder = product % this.base; // Use modulo for remainder
                cur.leaf = remainder;

                if (cur.next === null && carry !== 0) {
                    cur.next = BigNum_l.create();
                }
                cur = cur.next;
            }
        }
    }

    Clean() {
        if (this.list !== null) {
            this.list.clean();
        }
    }

    LastDigit() {
        if (this.list === null) {
            return 0;
        }

        let cur = this.list;
        while (cur.next !== null) {
            cur = cur.next;
        }
        return cur.leaf;
    }

    DivSmall(denom) {
        if (this.list !== null) {
            return this.list.DivSmall(this.base, denom);
        }
        return 0;
    }

    toString() {
        return this.list.toString();
    }
}

module.exports = BigNum;

},{"./BigNum_l":2}],2:[function(require,module,exports){
class BigNum_l {
    constructor(leaf = 0) {
        this.leaf = leaf;
        this.next = null;
    }

    static create() {
        return new BigNum_l();
    }

    clean() {
        if (this.next === null && this.leaf === 0) {
            return true;
        } else if (this.next !== null && this.next.clean()) {
            this.next = null;
            return this.leaf === 0;
        } else {
            return false;
        }
    }

    DivSmall(base, denom) {
        let quotient = 0;
        let remainder = 0;

        if (this.next !== null) {
            remainder = this.next.DivSmall(base, denom);
        }

        let num = this.leaf + remainder * base;
        quotient = Math.floor(num / denom);
        remainder = num - quotient * denom;
        this.leaf = quotient;
        return remainder;
    }

    toString() {
        return `${this.leaf} -> ${this.next}`;
    }
}

module.exports = BigNum_l;

},{}],3:[function(require,module,exports){
let charsets = {
    'NEW': "!$%&'()*+,-.0123456789:;=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}`",
    'OLD': "!#$%&'()*+,-.0123456789:;=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}`"
};

let currentCharset = charsets.NEW; // Default charset

function BASE() {
    return currentCharset.length;
}

function setCharset(name) {
    if (charsets[name]) {
        currentCharset = charsets[name];
    } else {
        throw new Error(`Charset ${name} not found`);
    }
}

function getCharSet() {
    return currentCharset;
}


module.exports = { BASE, setCharset, getCharSet };

},{}],4:[function(require,module,exports){
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
            if((newIndex === 18 || newIndex === 19 || newIndex === 20 || newIndex === 21 || newIndex === 22) && oldValues[oldIndex] >= 300)
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
            const bitPositions = [15, 14, 13, 12]; // Corresponding newValues indices
            const maxBitMask = 0b1111; // 4 bits for AllNitros
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
        case 17: {
            const bitPositions = [36, 37, 29, 28, 27, 26, 25]; // Corresponding newValues indices
            const maxBitMask = 0b1111111; // 7 bits for RandomVar3
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
        case 24: {
            const bitPositions = [24, 23, 22, 21, 20]; // Corresponding newValues indices
            const maxBitMask = 0b11111; // 5 bits for this case
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
        case 25: {
            const bitPositions = [34]; // Corresponding newValues indices
            const maxBitMask = 0b1000; // 4th bit for this case
            if (value > maxBitMask) {
                bitPositions.forEach(index => newValues[index] = 1); // Grant all rewards
            } else {
                if (value >> 3 & 1) newValues[34] = 1;
            }
            break;
        }
        case 26: {
            const bitPositions = [38]; // Corresponding newValues indices
            const maxBitMask = 0b1; // 1st bit for this case
            if (value > maxBitMask) {
                bitPositions.forEach(index => newValues[index] = 1); // Grant all rewards
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

},{"./Base":3,"./Savecode":6,"./decodeConfig":7,"./decodeConfig.js":7}],5:[function(require,module,exports){
let s1 = [];
let s2 = 0;

const tr = [
    0x9927148E, 0x08C7AAFD, 0x1F3EE6D5, 0xDA55BBF6,
    0x6A4AA075, 0xFF97BDE8, 0x9FBC9BDE, 0x46A18A81,
    0x63E30B6E, 0x5D6C7A76, 0xCA69D388, 0x25B947C3,
    0x3FA2AB83, 0xBA7C41A6, 0x0195ACE5, 0xC109CF7E,
    0x717062D9, 0x0205DB8D, 0x54EF8724, 0x3037D4C6,
    0x7BCB1BD0, 0xECD8E4B8, 0xDCADCE49, 0xC494A913,
    0x0DAE398F, 0x0EDD5218, 0x85F5FA78, 0x6DAFD258,
    0x3B53B2A4, 0xBE50A551, 0x11F42DFC, 0xF1169848,
    0x663DDF86, 0x2F2E445E, 0x176B0736, 0xB64C298B,
    0xE75F89E2, 0xE121A7CD, 0xED65C94D, 0x239CEEFE,
    0x04B77D33, 0x402A9A9E, 0xF35B10B3, 0x921C7782,
    0x571E4E20, 0x8C067222, 0xFB732C67, 0xBF0AC259,
    0x0CF95C79, 0x68121A28, 0x42193474, 0xF884C0B1,
    0x9D15F038, 0x6F3AF260, 0x91EB90B4, 0x61357F1D,
    0x5603325A, 0x932BC5A3, 0x434B0F80, 0x3CE0A8F7,
    0x2664D196, 0x4FCC45D7, 0xB5E9B0C8, 0xEA31D600
];

function rol(a, n) {
    return (a << n) | (a >>> (32 - n));
}

function random() {
    const b = [[7, 6, 3, 1], [54, 53, 50, 46], [0, 3, 2, 1]];
    let c = 0;

    for (let i = 0; i < 4; i++) {
        s1[i] = (s1[i] + (s1[i] < b[0][i] ? b[1][i] : -b[0][i])) % tr.length;
        c ^= rol(tr[s1[i]], b[2][i]);
    }

    s2 = (s2 + c) >>> 0; // Ensure 32-bit unsigned integer
    return s2;
}

function SetRandomSeed(seed) {
    s1 = [(seed + (seed < 0 ? 1 << 32 : 0)) % 61, (seed + (seed < 0 ? 1 << 32 : 0)) % 59, (seed + (seed < 0 ? 1 << 32 : 0)) % 53, (seed + (seed < 0 ? 1 << 32 : 0)) % 47];
    s2 = seed;
    random();
}

function GetRandomInt(l, h) {
    const i = random();
    const j = Math.abs(h - l) + 1;
    return h === l ? h : Math.floor((i / 4294967296) * j) + l;
}

module.exports = {
    SetRandomSeed,
    GetRandomInt
};

},{}],6:[function(require,module,exports){
const BigNum = require('../Libs/BigNum');
const { BASE, setCharset, getCharSet } = require('./Base');
const BigNum_l = require("../Libs/BigNum_l");
const { SetRandomSeed, GetRandomInt } = require('./NumberGen');

class Savecode {
    constructor(initial_value) {
        this.bignum = BigNum.create(BASE());
        this.digits = 0;
    }

    setSeed(seed) {
        SetRandomSeed(seed); // Use the new random seed function
    }

    GetRandomInt(maxValue) {
        return GetRandomInt(0, maxValue - 1);
    }

    log(y, base) {
        if (y <= 0) return 0.0;
        let logy = 0.0;
        let factor = 1.0;
        let sign = 1.0;
        if (y < 1.0) {
            y = 1.0 / y;
            sign = -1.0;
        }
        while (y >= 1.0001) {
            if (y > base) {
                y /= base;
                logy += factor;
            } else {
                base = Math.sqrt(base);
                factor /= 2.0;
            }
        }
        return sign * logy;
    }

    Encode(val, max_val) {
        this.digits += this.log(max_val + 1, BASE());
        this.bignum.MulSmall(max_val + 1);
        this.bignum.AddSmall(val);
    }

    Clean() {
        this.bignum.Clean();
    }

    DebugLastDigit() {
        const last_digit = this.bignum.LastDigit();
        return last_digit;
    }

    player_charset() {
        return "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }

    player_charsetlen() {
        return this.player_charset().length;
    }

    player_chartoi(c) {
        const cs = this.player_charset();
        const len_cs = this.player_charsetlen();
        for (let i = 0; i < len_cs; i++) {
            if (c === cs[i]) {
                return i;
            }
        }
        return -1; // If character not found
    }

    charset() {
        return getCharSet();
    }

    charsetlen() {
        return this.charset().length;
    }

    chartoi(c) {
        let i = 0;
        const cs = this.charset();
        const len = this.charsetlen();
        while (i < len && c !== cs.charAt(i)) {
            i++;
        }
        return i;
    }

    scommhash(s) {
        const count = new Array(this.player_charsetlen()).fill(0); // Ensure the array length matches the charset length
        s = s.toUpperCase();

        for (let i = 0; i < s.length; i++) {
            const x = this.player_chartoi(s.charAt(i));
            if (x >= 0) {
                count[x]++;
            }
        }

        let x = 0;
        for (let i = 0; i < this.player_charsetlen(); i++) {
            x = count[i] * count[i] * i + count[i] * x + x + 199;
        }

        if (x < 0) {
            x = -x;
        }

        return x;
    }

    Hash() {
        let hash_value = 0;
        const base = BASE();
        let current = this.bignum.list;
        while (current !== null) {
            const x = current.leaf;
            hash_value = (hash_value + Math.floor(79 * hash_value / (x + 1)) + Math.floor(293 * x / (1 + hash_value - Math.floor(hash_value / base) * base)) + 479) % 5000;
            current = current.next;
        }
        return hash_value;
    }

    Pad() {
        let cur = this.bignum.list;
        let prev = null;
        let maxlen = Math.floor(1.0 + this.Length());

        while (cur !== null) {
            prev = cur;
            cur = cur.next;
            maxlen -= 1;
        }

        while (maxlen > 0) {
            prev.next = BigNum_l.create();
            prev = prev.next;
            maxlen -= 1;
        }
    }

    Length() {
        return this.digits / BASE();
    }

    modb(value) {
        if(value >= BASE()) {
            return value - BASE();
        }
        else if(value < 0) {
            return value + BASE();
        }
        else{
            return value;
        }
    }

    Obfuscate(key, sign) {
        const seed = Math.floor(Math.random() * 2147483647+1);
        let advance = 0;
        let xtest = 0;
        let x = 0;
        let cur = this.bignum.list;

        if (sign === -1) {
            this.setSeed(this.bignum.LastDigit());
            cur.leaf = this.modb(cur.leaf + (sign * this.GetRandomInt(BASE())));
            x = cur.leaf;
        }

        this.setSeed(key);
        while (cur !== null) {
            if (sign === -1){
                advance = cur.leaf;
            }
            xtest = this.GetRandomInt(BASE());
            cur.leaf = this.modb(cur.leaf + sign * xtest);
            if (sign === 1) {
                advance = cur.leaf;
            }
            advance += this.GetRandomInt(BASE());
            this.setSeed(advance);
            x = cur.leaf;
            cur = cur.next;
        }

        if (sign === 1) {
            this.setSeed(x);
            this.bignum.list.leaf = this.modb(this.bignum.list.leaf + sign * this.GetRandomInt(BASE()));
        }

        this.setSeed(seed);
    }

    itochar(value) {
        const charset = getCharSet();
        return charset[value % charset.length];
    }

    ToString() {
        let cur = this.bignum.list;
        let s = "";
        while (cur !== null) {
            s = this.itochar(cur.leaf) + s;
            cur = cur.next;
        }
        return s;
    }

    FromString(s) {
        let i = s.length - 1;
        let cur = BigNum_l.create();
        this.bignum.list = cur;
        while (true) {
            cur.leaf = this.chartoi(s.charAt(i));
            if (i <= 0) break;
            cur.next = BigNum_l.create();
            cur = cur.next;
            i--;
        }
    }

    Decode(max) {
        return this.bignum.DivSmall(max + 1);
    }

    Load(player, s, loadtype) {
        const ikey = this.scommhash(player) + loadtype * 73;
        let inputhash;


        this.FromString(s);
        this.Obfuscate(ikey, -1);
        inputhash = this.Decode(5000);

        this.Clean();

        return inputhash === this.Hash();
    }

    Save(player_name, loadtype) {
        const key = this.scommhash(player_name) + loadtype * 73;
        this.Clean();
        const hash_value = this.Hash();
        this.Encode(hash_value, 5000);
        this.Clean();
        this.Pad();
        this.Obfuscate(key, 1);
        return this.ToString();
    }
}
module.exports = Savecode;
},{"../Libs/BigNum":1,"../Libs/BigNum_l":2,"./Base":3,"./NumberGen":5}],7:[function(require,module,exports){
const decodeConfig = [
    ["Purple Fire", 1],    // Rewards //0
    ["Deaths", 99999],     // Game Stats
    ["Saves", 99999],      // Game Stats
    ["Games", 9999],       // Game Stats
    ["Wins", 999],         // Game Stats
    ["WinStreak", 100],    // Game Stats
    ["R1Time", 300],       // Round Times
    ["R2Time", 300],       // Round Times
    ["R3Time", 300],       // Round Times
    ["R4Time", 300],       // Round Times
    ["R5Time", 420],       // Round Times // 10
    ["Nitro", 1],          // Rewards // 11
    ["Nitro Blue", 1],     // Rewards // 12
    ["Nitro Red", 1],      // Rewards // 13
    ["Nitro Green", 1],    // Rewards // 14
    ["Nitro Purple", 1],   // Rewards // 15
    ["Turquoise Fire", 1], // Rewards
    ["Blue Fire", 1],      // Rewards
    ["Pink Fire", 1],      // Rewards
    ["White Fire", 1],     // Rewards
    ["Deathless 1", 1],    // Rewards // 20
    ["Deathless 2", 1],    // Rewards
    ["Deathless 3", 1],    // Rewards
    ["Deathless 4", 1],    // Rewards
    ["Deathless 5", 1],    // Rewards
    ["WW Blood", 1],       // Rewards // 25
    ["WW Blue", 1],        // Rewards
    ["WW Fire", 1],        // Rewards
    ["WW Necro", 1],       // Rewards
    ["WW Special", 1],     // Rewards
    ["Red Lightning", 1],  // Rewards // 30
    ["Purple Lightning", 1], // Rewards
    ["Yellow Lightning", 1], // Rewards
    ["Green Lightning", 1],  // Rewards
    ["White Tendrils", 1],   // Rewards
    ["Red Tendrils", 1],     // Rewards // 35
    ["Green Tendrils", 1],   // Rewards
    ["Yellow Tendrils", 1],  // Rewards
    ["Butterfly Aura", 1]    // Rewards
];

// New section for values_max_vals
const oldDecodeConfig = [
    ["RandomVar9", 8],    // RandomVar9
    ["RandomVar8", 8],    // RandomVar8
    ["RandomVar7", 8],    // RandomVar7
    ["RandomVar6", 8],    // RandomVar6
    ["RandomVar5", 16],   // RandomVar5
    ["RandomVar4", 32],   // RandomVar4
    ["EasterEgg", 1],     // EasterEgg
    ["R5Time", 600],      // R5Time
    ["R4Time", 600],      // R4Time
    ["R3Time", 600],      // R3Time
    ["R2Time", 300],      // R2Time
    ["R1Time", 300],      // R1Time
    ["RandomVar3", 128],  // RandomVar3
    ["AllNitros", 32],    // AllNitros
    ["LightningGreen", 1],// LightningGreen
    ["LightningYellow", 1],// LightningYellow
    ["LightningPurple", 1],// LightningPurple
    ["LightningRed", 1],  // LightningRed
    ["WhiteFire", 1],     // WhiteFire
    ["PinkFire", 1],      // PinkFire
    ["MysticFire", 1],    // MysticFire
    ["BlueFire", 1],      // BlueFire
    ["RandomVar2", 999],  // RandomVar2
    ["Nitro", 10],        // Nitro
    ["WinStreak", 999],   // WinStreak
    ["Wins", 9999],       // Wins
    ["Games", 99999],     // Games
    ["Fire1", 99],        // Fire1
    ["Saves", 99999],     // Saves
    ["Deaths", 99999],    // Deaths
];

module.exports = { decodeConfig, oldDecodeConfig };

},{}],8:[function(require,module,exports){
const Savecode = require('./Savecode');
const { BASE, setCharset } = require('./Base');
const { decodeConfig, oldDecodeConfig } = require('./decodeConfig');
const generateNewCode = require('./GenerateNewCode');

document.getElementById('decoderForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const playerName = document.getElementById('playerName').value;
    const saveCode = document.getElementById('saveCode').value;
    const actionType = document.getElementById('actionType').value;
    const gameStatsBody = document.getElementById('gameStatsBody');
    const roundTimesBody = document.getElementById('roundTimesBody');
    const rewardsBody = document.getElementById('rewardsBody');
    const newCodeSection = document.getElementById('newCodeSection');
    const newCodeElement = document.getElementById('newCode');

    if(actionType === 'newCode') {
        setCharset('OLD');
    }
    else {
        setCharset('NEW');
    }


    let savecode = new Savecode(BASE());
    const loadSuccess = savecode.Load(playerName, saveCode, 1);

    gameStatsBody.innerHTML = ''; // Clear previous results
    roundTimesBody.innerHTML = ''; // Clear previous results
    rewardsBody.innerHTML = ''; // Clear previous results
    newCodeSection.style.display = 'none'; // Hide new code section

    if (!loadSuccess) {
        alert('Invalid save code.');
        return;
    }

    if (actionType === 'newCode') {
        newCodeSection.style.display = 'block';
        newCodeElement.textContent = generateNewCode(savecode, playerName);

        savecode = new Savecode(BASE());
        savecode.Load(playerName, newCodeElement.textContent, 1);
    }




    decodeConfig.slice().reverse().forEach(([name, max_val]) => {
        const decodedValue = savecode.Decode(max_val);
        let row = document.createElement('tr');
        let nameCell = document.createElement('td');
        let valueCell = document.createElement('td');
        nameCell.textContent = name;
        valueCell.textContent = decodedValue;

        if (max_val === 1) {
            if (decodedValue === 1) {
                valueCell.classList.add('green-cell');
            }
            else {
                valueCell.classList.add('red-cell');
            }
            row.appendChild(nameCell);
            row.appendChild(valueCell);
            rewardsBody.appendChild(row);
        }
        else if (name.includes("Time")) {
            row.appendChild(nameCell);
            row.appendChild(valueCell);
            roundTimesBody.appendChild(row);
        }
        else {
            row.appendChild(nameCell);
            row.appendChild(valueCell);
            gameStatsBody.appendChild(row);
        }
    });
});

},{"./Base":3,"./GenerateNewCode":4,"./Savecode":6,"./decodeConfig":7}]},{},[8]);
