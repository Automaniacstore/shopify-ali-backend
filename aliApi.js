const axios = require('axios');
const RAPID_API_KEY = '16c6cbfd78mshe15bb5c24977eb5p117f15jsn30df2747928d';

async function getAliExpressData(productId, countryCode) {
  const options = {
    method: 'GET',
    url: 'https://ali-express1.p.rapidapi.com/product/detail',
    params: {
      productId: productId,
      locale: countryCode.toLowerCase(),
      currency: 'USD'
    },
    headers: {
      'X-RapidAPI-Key': RAPID_API_KEY,
      'X-RapidAPI-Host': 'ali-express1.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    const product = response.data;

    console.log('✅ API response:', JSON.stringify(product, null, 2)); // 🧠 Debug

    const variants = product.sku_info?.map((sku) => ({
      name: sku.sku_attr,
      price: sku.sku_val?.sku_activity_amount?.value || sku.sku_val?.sku_amount?.value || "N/A",
      available: sku.sku_val?.avail_quantity || 0,
      delivery_time: product.shipping?.min_delivery_days && product.shipping?.max_delivery_days
        ? `${product.shipping.min_delivery_days}-${product.shipping.max_delivery_days} days`
        : 'Unknown'
    })) || [];

    return {
      title: product.title || 'No Title',
      price: product.app_sale_price || 'N/A',
      currency: product.currency_code || 'USD',
      variants,
      free_shipping: true,
      delivery_time: variants.length ? variants[0].delivery_time : 'Unknown'
    };

  } catch (error) {
    console.error('❌ AliExpress API error:', error.message);
    return {
      price: 'N/A',
      currency: 'USD',
      variants: [],
      free_shipping: true,
      delivery_time: 'Unknown'
    };
  }
}

module.exports = { getAliExpressData };
