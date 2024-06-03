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
