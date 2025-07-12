const axios = require('axios');

const RAPID_API_KEY = '16c6cbfd78mshe15bb5c24977eb5p117f15jsn30df2747928d';

async function getAliExpressData(productId, countryCode = 'US') {
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

    // 🧪 Debug: Celi odgovor i skuMap
    console.log("🔥 RAW RESPONSE:", JSON.stringify(response.data, null, 2));
    console.log("🧪 DEBUG SKU MAP:", JSON.stringify(result?.item?.sku?.skuMap, null, 2));

    if (!result?.item) {
      console.warn(`⚠️ Prazan odgovor sa API-ja za productId: ${productId}`);
      return {
        title: 'No Title',
        price: 'N/A',
        currency: result?.settings?.currency || 'USD',
        variants: [],
        free_shipping: false,
        delivery_time: 'Unknown'
      };
    }

    const item = result.item;
    const delivery = result.delivery || {};
    const skuMap = item?.sku?.skuMap || {};

    const variants = Object.entries(skuMap).map(([key, sku]) => ({
      name: key,
      price: sku.price?.discountPrice?.value || sku.price?.salePrice?.value || 'N/A',
      available: sku.inventory || 0,
      delivery_time: delivery.shippingOutDays
        ? `${delivery.shippingOutDays} days`
        : 'Unknown'
    }));

    return {
      title: item.title || 'No Title',
      price: variants[0]?.price || 'N/A',
      currency: result.settings?.currency || 'USD',
      variants,
      free_shipping: true,
      delivery_time: delivery.shippingOutDays
        ? `${delivery.shippingOutDays} days`
        : 'Unknown'
    };

  } catch (error) {
    console.error('❌ AliExpress API error:', error.message);
    return {
      title: 'No Title',
      price: 'N/A',
      currency: 'USD',
      variants: [],
      free_shipping: false,
      delivery_time: 'Unknown'
    };
  }
}

module.exports = { getAliExpressData };
