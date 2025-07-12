const axios = require('axios');

const RAPID_API_KEY = '16c6cbfd78mshe15bb5c24977eb5p117f15jsn30df2747928d'; // 🚨 ZAMENI sa svojim validnim ključem

async function getAliExpressData(productId, countryCode = 'US') {
  const options = {
    method: 'GET',
    url: 'https://aliexpress-datahub.p.rapidapi.com/item_detail_2',
    params: {
      itemId: productId
    },
    headers: {
      'X-RapidAPI-Key': RAPID_API_KEY,
      'X-RapidAPI-Host': 'aliexpress-datahub.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);

    if (!response.data || !response.data.data) {
      console.warn('⚠️ Prazan odgovor sa API-ja za productId:', productId);
      throw new Error(`Empty or invalid data returned for productId: ${productId}`);
    }

    const data = response.data.data;

    const variants = (data.sku_info || []).map((sku) => ({
      name: sku?.sku_attr?.map(attr => `${attr.attr_name}: ${attr.attr_value}`).join(', ') || 'Unknown variant',
      price: sku?.sku_val?.sku_activity_amount?.value || sku?.sku_val?.sku_amount?.value || 'N/A',
      available: sku?.sku_val?.avail_quantity || 0,
      delivery_time: data.delivery?.ship_time || 'Unknown'
    }));

    const result = {
      title: data.subject || 'No Title',
      price: data.app_sale_price?.value || 'N/A',
      currency: data.app_sale_price?.currency || 'USD',
      variants,
      free_shipping: true,
      delivery_time: data.delivery?.ship_time || 'Unknown'
    };

    console.log('✅ API odgovor za', productId, '=>', JSON.stringify(result, null, 2));
    return result;

  } catch (error) {
    console.error('❌ AliExpress API error:', error.message || error);
    return {
      price: 'N/A',
      currency: 'USD',
      variants: [],
      free_shipping: false,
      delivery_time: 'Unknown'
    };
  }
}

module.exports = { getAliExpressData };
