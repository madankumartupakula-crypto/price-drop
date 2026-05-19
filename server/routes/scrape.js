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

function cleanText(value) {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeAbsoluteUrl(value, pageUrl) {
  const cleaned = cleanText(value);
  if (!cleaned) return '';

  try {
    return new URL(cleaned, pageUrl).href;
  } catch {
    return '';
  }
}

function pickMetaContent(html, names) {
  for (const name of names) {
    const pattern = new RegExp(
      `<meta[^>]+(?:property|name|itemprop)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>|` +
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name|itemprop)=["']${name}["'][^>]*>`,
      'i'
    );
    const match = html.match(pattern);
    if (match?.[1] || match?.[2]) return cleanText(match[1] || match[2]);
  }

  return '';
}

function extractJsonLdImage(html) {
  const scripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];

  for (const script of scripts) {
    const content = script
      .replace(/^<script[^>]*>/i, '')
      .replace(/<\/script>$/i, '')
      .trim();

    try {
      const data = JSON.parse(content);
      const queue = Array.isArray(data) ? [...data] : [data];

      while (queue.length) {
        const item = queue.shift();
        if (!item || typeof item !== 'object') continue;

        const image = item.image;
        if (typeof image === 'string') return image;
        if (Array.isArray(image) && typeof image[0] === 'string') return image[0];
        if (image?.url) return image.url;

        if (Array.isArray(item['@graph'])) queue.push(...item['@graph']);
      }
    } catch {
      // Some ecommerce pages include invalid JSON-LD. Other image fallbacks handle those.
    }
  }

  return '';
}

function extractStoreImage(html) {
  const amazonDynamicImage = html.match(/data-a-dynamic-image=["']({[^"']+})["']/i);
  if (amazonDynamicImage?.[1]) {
    const decoded = cleanText(amazonDynamicImage[1]);
    const image = decoded.match(/"([^"]+)"/)?.[1];
    if (image) return image;
  }

  return pickMeta(html, [
    /id=["']landingImage["'][^>]+(?:src|data-old-hires)=["']([^"']+)["']/i,
    /(?:src|data-old-hires)=["']([^"']+)["'][^>]+id=["']landingImage["']/i,
    /data-old-hires=["']([^"']+)["']/i,
    /<img[^>]+class=["'][^"']*(?:_396cs4|_2r_T1I|DByuf4|_53J4C-)[^"']*["'][^>]+src=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+)["'][^>]+class=["'][^"']*(?:_396cs4|_2r_T1I|DByuf4|_53J4C-)[^"']*["']/i
  ]);
}

function extractImageUrl(html, pageUrl) {
  const image = pickMetaContent(html, ['og:image:secure_url', 'og:image', 'twitter:image', 'twitter:image:src', 'image']) ||
    extractJsonLdImage(html) ||
    extractStoreImage(html) ||
    pickMeta(html, [
      /"image"\s*:\s*\[\s*"([^"]+)"/i,
      /"image"\s*:\s*"([^"]+)"/i
    ]);

  return makeAbsoluteUrl(image, pageUrl);
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
    const name = pickMetaContent(html, ['og:title', 'twitter:title']) || pickMeta(html, [
      /<title[^>]*>([^<]+)<\/title>/i,
      /"name"\s*:\s*"([^"]+)"/i
    ]);
    const imageUrl = extractImageUrl(html, url);
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
