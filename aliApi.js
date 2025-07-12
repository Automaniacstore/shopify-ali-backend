const axios = require('axios');
const fs = require('fs');
const path = require('path');

const RAPID_API_KEY = '16c6cbfd78mshe15bb5c24977eb5p117f15jsn30df2747928d';
const CACHE_DIR = './cache'; // Lokalno (na serveru ćeš koristiti /mnt/data/ali_cache)

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

function getCacheFilePath(productId, countryCode) {
  return path.join(CACHE_DIR, `${productId}_${countryCode.toUpperCase()}.json`);
}

function isCacheValid(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const stats = fs.statSync(filePath);
  const age = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60); // u satima
  return age < 3;
}

async function getAliExpressData(productId, countryCode = 'US') {
  const cacheFile = getCacheFilePath(productId, countryCode);

  // ✅ Ako postoji validan cache, koristi njega
  if (isCacheValid(cacheFile)) {
    console.log('📦 Returning cached data...');
    const data = fs.readFileSync(cacheFile);
    return JSON.parse(data);
  }

  const options = {
    method: 'GET',
    url: 'https://aliexpress-datahub.p.rapidapi.com/item_detail_2',
    params: {
      itemId: productId,
      locale: countryCode.toLowerCase(),
      currency: 'USD'
    },
    headers: {
      'X-RapidAPI-Key': RAPID_API_KEY,
      'X-RapidAPI-Host': 'aliexpress-datahub.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    const product = response.data.result;

    const data = {
      title: product.title,
      price: product.app_sale_price?.value || 'N/A',
      currency: product.app_sale_price?.currency || 'USD',
      variants: product.sku_info?.map(sku => ({
        name: sku.sku_attr,
        price: sku.sku_val?.sku_activity_amount?.value || sku.sku_val?.sku_amount?.value,
        available: sku.sku_val?.avail_quantity
      })) || [],
      free_shipping: true,
      delivery_time: product.delivery_time || 'Unknown'
    };

    // 💾 Snimi u cache
    fs.writeFileSync(cacheFile, JSON.stringify(data));

    return data;
  } catch (error) {
    console.error("❌ AliExpress API error:", error.response?.data || error.message);
    throw new Error("Failed to fetch product data from AliExpress");
  }
}

module.exports = { getAliExpressData };
