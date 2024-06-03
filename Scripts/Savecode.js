const BigNum = require('../Libs/BigNum');
const { BASE, setCharset, getCharSet } = require('./Base');
const BigNum_l = require("../Libs/BigNum_l");
const { SetRandomSeed, GetRandomInt } = require('./NumberGen');

class Savecode {
    constructor(initial_value) {
        this.bignum = BigNum.create(BASE());
        this.digits = 0;
    }

    // Both functions below use WC3 functionality.
    setSeed(seed) {
        SetRandomSeed(seed);
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