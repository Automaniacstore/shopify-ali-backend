const axios = require('axios');
const NodeCache = require('node-cache');

const RAPID_API_KEY = '16c6cbfd78mshe15bb5c24977eb5p117f15jsn30df2747928d';
const cache = new NodeCache({ stdTTL: 10800 }); // 3 sata keš

async function getAliExpressData(productId, countryCode = 'US') {
  const cacheKey = `${productId}_${countryCode}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return { ...cachedData, cached: true };
  }

  const options = {
    method: 'GET',
    url: 'https://aliexpress-datahub.p.rapidapi.com/item_detail_2',
    params: {
      itemId: productId,
      shipTo: countryCode
    },
    headers: {
      'x-rapidapi-key': RAPID_API_KEY,
      'x-rapidapi-host': 'aliexpress-datahub.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    const result = response.data?.result;

    console.log("🔥 RAW RESPONSE:", JSON.stringify(response.data, null, 2));

    if (!result?.item) {
      console.warn(`⚠️ Prazan odgovor sa API-ja za productId: ${productId}`);
      return {
        title: 'No Title',
        price: 'N/A',
        currency: result?.settings?.currency || 'USD',
        variants: [],
        free_shipping: false,
        delivery_time: 'Unknown',
        cached: false
      };
    }

    const item = result.item;
    const delivery = result.delivery || {};
    const skuMap = item?.sku?.skuMap || {};
    const currency = result.settings?.currency || 'USD';

    const variants = Object.entries(skuMap).map(([key, sku]) => {
      const price = sku.price?.discountPrice?.value || sku.price?.salePrice?.value || null;
      const available = sku.inventory || 0;
      const delivery_time = delivery.shippingOutDays
        ? `${delivery.shippingOutDays} days`
        : 'Unknown';

      return {
        name: key,
        price,
        available,
        delivery_time,
        outOfStock: available <= 0
      };
    });

    const bestVariant = variants
      .filter(v => v.price && !v.outOfStock)
      .sort((a, b) => {
        const priceDiff = parseFloat(a.price) - parseFloat(b.price);
        if (priceDiff !== 0) return priceDiff;
        const getDays = t => parseInt(t.replace(/\D/g, '')) || 999;
        return getDays(a.delivery_time) - getDays(b.delivery_time);
      })[0];

    const finalData = {
      title: item.title || 'No Title',
      price: bestVariant?.price || 'N/A',
      currency,
      variants,
      free_shipping: true,
      delivery_time: bestVariant?.delivery_time || 'Unknown',
      cached: false
    };

    cache.set(cacheKey, finalData);
    return finalData;
  } catch (error) {
    console.error('❌ AliExpress API error:', error.message);
    return {
      title: 'No Title',
      price: 'N/A',
      currency: 'USD',
      variants: [],
      free_shipping: false,
      delivery_time: 'Unknown',
      cached: false
    };
  }
}

module.exports = { getAliExpressData };
