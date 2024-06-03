let s1 = [];
let s2 = 0;

// WC3 Lookup Table
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

// WC3 SetRandomSeed function
function SetRandomSeed(seed) {
    s1 = [(seed + (seed < 0 ? 1 << 32 : 0)) % 61, (seed + (seed < 0 ? 1 << 32 : 0)) % 59, (seed + (seed < 0 ? 1 << 32 : 0)) % 53, (seed + (seed < 0 ? 1 << 32 : 0)) % 47];
    s2 = seed;
    random();
}

// WC3 GetRandomInt function
function GetRandomInt(l, h) {
    const i = random();
    const j = Math.abs(h - l) + 1;
    return h === l ? h : Math.floor((i / 4294967296) * j) + l;
}

module.exports = {
    SetRandomSeed,
    GetRandomInt
};
