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

  const response = await axios.request(options);
  const product = response.data;

  const data = {
    title: product.title,
    price: product.app_sale_price,
    currency: product.currency_code,
    variants: product.sku_info?.map(sku => ({
      name: sku.sku_attr,
      price: sku.sku_val.sku_activity_amount?.value || sku.sku_val.sku_amount?.value,
      available: sku.sku_val.avail_quantity,
      delivery_time: product.shipping.min_delivery_days + '-' + product.shipping.max_delivery_days + ' days',
      sku_id: sku.sku_val.sku_id
    })) || [],
    free_shipping: true,
    delivery_time: product.shipping.min_delivery_days + '-' + product.shipping.max_delivery_days + ' days'
  };

  return data;
}

module.exports = { getAliExpressData };