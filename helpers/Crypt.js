const { createHash } = require('crypto');

class Hash {
    constructor() {
    }

    hash(str) {
        return createHash('sha256').update(str).digest('hex');
    }
}

module.exports = Hash