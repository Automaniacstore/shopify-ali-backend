const axios = require('axios');

const RAPID_API_KEY = '16c6cbfd78mshe15bb5c24977eb5p117f15jsn30df2747928d';

async function getAliExpressData(productId, countryCode = 'US') {
  const options = {
    method: 'GET',
    url: 'https://ali-express1.p.rapidapi.com/product/detail',
    params: {
      productId: productId,
      locale: countryCode.toLowerCase(),
      currency: 'USD',
    },
    headers: {
      'X-RapidAPI-Key': RAPID_API_KEY,
      'X-RapidAPI-Host': 'ali-express1.p.rapidapi.com',
    }
  };

  try {
    const response = await axios.request(options);
    const product = response.data;

    if (!product || !product.sku_info) throw new Error('Missing product data');

    const data = {
      title: product.title || '',
      price: product.app_sale_price || 'N/A',
      currency: product.currency_code || 'USD',
      variants: product.sku_info.map(sku => ({
        name: sku.sku_attr,
        price: sku.sku_val?.sku_activity_amount?.value || sku.sku_val?.sku_amount?.value || 'N/A',
        available: sku.sku_val?.avail_quantity || 0,
      })),
      free_shipping: true,
      delivery_time: product.shipping 
        ? `${product.shipping.min_delivery_days}-${product.shipping.max_delivery_days} days`
        : 'Unknown',
    };

    return data;
  } catch (error) {
    console.error('❌ AliExpress API error:', error.message);
    throw new Error('Failed to fetch product data from AliExpress');
  }
}

module.exports = { getAliExpressData };
