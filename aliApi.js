const axios = require('axios');

async function getAliExpressData(productId, countryCode = 'US') {
  const options = {
    method: 'GET',
    url: 'https://aliexpress-datahub.p.rapidapi.com/item_detail_2',
    params: {
      itemId: productId,
      targetCurrency: 'USD',
      targetLanguage: 'EN',
      countryCode
    },
    headers: {
      'X-RapidAPI-Key': '16c6cbfd78mshe15bb5c24977eb5p117f15jsn30df2747928d',
      'X-RapidAPI-Host': 'aliexpress-datahub.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    const item = response.data.result;

    return {
      price: item.appSalePrice || 'N/A',
      currency: item.currency || 'USD',
      variants: item.skuModule?.skuPriceList || [],
      free_shipping: item.shippingInformation?.freeShipping || false,
      delivery_time: item.shippingInformation?.deliveryTime || 'Unknown'
    };
  } catch (error) {
    console.error('❌ AliExpress API error:', error.message || error);
    throw new Error('Failed to fetch product data from AliExpress');
  }
}

module.exports = { getAliExpressData };
