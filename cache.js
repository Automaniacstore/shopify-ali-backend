const cache = {};
const TTL = 3 * 60 * 60 * 1000;

function get(key) {
  const item = cache[key];
  if (!item) return null;

  if (Date.now() - item.timestamp < TTL) {
    return item.data;
  } else {
    delete cache[key];
    return null;
  }
}

function set(key, data) {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
}

module.exports = { get, set };