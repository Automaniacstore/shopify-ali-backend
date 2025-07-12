const express = require('express');
const axios = require('axios');
const cache = require('./cache');
const aliApi = require('./aliApi');

const app = express();
const PORT = process.env.PORT || 10000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/api/product', async (req, res) => {
  const productId = req.query.productId;
  const manualCountry = req.query.country;
  const refresh = req.query.refresh === 'true';

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;

  if (!productId) return res.status(400).json({ error: 'Missing productId' });

  let country = 'US'; // default

  if (manualCountry) {
    country = manualCountry.toUpperCase();
    console.log(`🌍 Manual country override: ${country}`);
  } else {
    try {
      const geoRes = await axios.get(`https://ipwho.is/${ip}`);
      if (geoRes.data && geoRes.data.success && geoRes.data.country_code) {
        country = geoRes.data.country_code;
      } else {
        console.warn('⚠️ Geo IP lookup failed, defaulting to US');
      }
    } catch {
      console.warn('⚠️ Geo IP API unreachable, using US');
    }
  }

  console.log(`[IP: ${ip}] Country: ${country} | Product: ${productId}`);

  const cacheKey = `${productId}_${country}`;

  if (!refresh) {
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('✅ Serving from cache');
      return res.json({ ...cachedData, cached: true });
    }
  } else {
    console.log('🔄 Refresh enabled – skipping cache');
  }

  try {
    const aliData = await aliApi.getAliExpressData(productId, country);
    cache.set(cacheKey, aliData);
    res.json({ ...aliData, cached: false });
  } catch (err) {
    console.error('❌ API error:', err.message || err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
