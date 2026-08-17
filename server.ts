import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/config/db.js';
import apiRoutes from './server/routes/api.js';

dotenv.config();

async function startServer() {
  const app = express();
  
  const PORT = Number(process.env.PORT) || 3000;

  // Connect Database
  await connectDB();

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes
  app.use('/api', apiRoutes);

  // Database offline error fallback middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err?.name === 'MongooseError' || err?.name === 'MongoNetworkError' || err?.message?.includes('buffering timed out')) {
      console.warn('[AI Studio] Database offline — fallback handling');
      if (req.method === 'GET') {
        return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
      }
      return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
    }
    next(err);
  });

  // Serve static uploads or media if any
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Vite middleware in dev mode vs static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 GoldBod Pro Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start GoldBod Pro server:', err);
});