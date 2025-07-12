const axios = require('axios');

const RAPID_API_KEY = '16c6cbfd78mshe15bb5c24977eb5p117f15jsn30df2747928d';

async function getAliExpressData(productId, countryCode = 'US') {
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

    return data;
  } catch (error) {
    console.error("❌ AliExpress API error:", error.response?.data || error.message);
    throw new Error("Failed to fetch product data from AliExpress");
  }
}

module.exports = { getAliExpressData };
