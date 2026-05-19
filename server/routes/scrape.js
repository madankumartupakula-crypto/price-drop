import { Router } from 'express';

const router = Router();

function getRetailer(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Unknown';
  }
}

function pickMeta(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return '';
}

function extractPrice(html) {
  const metaPrice = pickMeta(html, [
    /property=["']product:price:amount["'][^>]*content=["']([\d.,]+)["']/i,
    /name=["']twitter:data1["'][^>]*content=["'][^\d]*([\d.,]+)["']/i,
    /"price"\s*:\s*"?([\d.,]+)"?/i
  ]);

  const fallback = metaPrice || pickMeta(html, [/[$₹€£]\s*([\d,]+(?:\.\d{1,2})?)/i]);
  const numeric = Number(String(fallback).replace(/,/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

router.post('/', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Product URL is required.' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 PricePulse/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Remote site returned ${response.status}`);
    }

    const html = await response.text();
    const name = pickMeta(html, [
      /property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
      /<title[^>]*>([^<]+)<\/title>/i,
      /"name"\s*:\s*"([^"]+)"/i
    ]);
    const imageUrl = pickMeta(html, [
      /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
      /name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
      /"image"\s*:\s*"([^"]+)"/i
    ]);
    const currentPrice = extractPrice(html);

    res.json({
      name: name || `Product from ${getRetailer(url)}`,
      imageUrl: imageUrl || 'https://picsum.photos/seed/product/600/400',
      currentPrice: currentPrice || 1,
      retailer: getRetailer(url),
      url
    });
  } catch (error) {
    console.error('Failed to scrape product:', error);
    res.status(502).json({
      error: 'Could not extract product details from that URL.',
      fallback: {
        name: `Product from ${getRetailer(url)}`,
        imageUrl: 'https://picsum.photos/seed/product/600/400',
        currentPrice: 1,
        retailer: getRetailer(url),
        url
      }
    });
  }
});

export default router;
