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
