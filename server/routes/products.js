import { ObjectId } from 'mongodb';
import { Router } from 'express';
import { getProductsCollection } from '../db.js';

const router = Router();

function formatProduct(product) {
  const { _id, userId, ...safeProduct } = product;
  return {
    ...safeProduct,
    id: _id.toString()
  };
}

router.get('/', async (req, res) => {
  try {
    const products = await getProductsCollection();
    const data = await products.find({ userId: req.user.id }).sort({ _id: -1 }).toArray();
    res.json(data.map(formatProduct));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/', async (req, res) => {
  try {
    const product = {
      name: req.body.name,
      imageUrl: req.body.imageUrl || 'https://picsum.photos/seed/placeholder/600/400',
      currentPrice: Number(req.body.currentPrice),
      targetPrice: Number(req.body.targetPrice),
      priceHistory: Array.isArray(req.body.priceHistory) ? req.body.priceHistory : [],
      retailer: req.body.retailer || 'Unknown',
      url: req.body.url || '#',
      lastChecked: req.body.lastChecked || 'Just now',
      recommendation: req.body.recommendation || 'wait',
      reason: req.body.reason || '',
      userId: req.user.id,
      createdAt: new Date().toISOString()
    };

    if (!product.name || Number.isNaN(product.currentPrice)) {
      return res.status(400).json({ error: 'Product name and currentPrice are required.' });
    }

    if (Number.isNaN(product.targetPrice)) {
      product.targetPrice = product.currentPrice * 0.9;
    }

    if (product.priceHistory.length === 0) {
      product.priceHistory = [{ date: new Date().toISOString(), price: product.currentPrice }];
    }

    const products = await getProductsCollection();
    const result = await products.insertOne(product);

    res.status(201).json({ id: result.insertedId.toString() });
  } catch (error) {
    console.error('Failed to save product:', error);
    res.status(500).json({ error: 'Failed to save product' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const products = await getProductsCollection();
    const result = await products.deleteOne({ _id: new ObjectId(req.params.id), userId: req.user.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
