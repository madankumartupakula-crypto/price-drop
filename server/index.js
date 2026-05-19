import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import scrapeRouter from './routes/scrape.js';
import { requireAuth } from './auth.js';

const app = express();
const port = process.env.PORT || 5001;
const host = process.env.HOST || '127.0.0.1';
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5173';

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'pricepulse-api' });
});

app.use('/api/auth', authRouter);
app.use('/api/products', requireAuth, productsRouter);
app.use('/api/scrape', requireAuth, scrapeRouter);

app.listen(port, host, () => {
  console.log(`MERN API running on http://${host}:${port}`);
});
