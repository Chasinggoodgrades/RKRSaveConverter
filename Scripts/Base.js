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
