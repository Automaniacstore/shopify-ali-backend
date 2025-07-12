const NodeCache = require('node-cache');

// Keš traje 3 sata (u sekundama)
const cache = new NodeCache({ stdTTL: 10800 });

module.exports = cache;
