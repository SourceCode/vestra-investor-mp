import * as trpcExpress from '@trpc/server/adapters/express';
import cors from 'cors';
import express from 'express';
import { appRouter } from './routers/_app';
import { AppDataSource } from '../db/data-source';
import { configureSecurity } from './middleware/security';

import compression from 'compression';

const app = express();
const PORT = 7321;

app.use(cors());
app.use(compression());
configureSecurity(app);

// Initialize DB
AppDataSource.initialize()
    .then(() => {
        console.log('Database initialized');
    })
    .catch((err) => {
        console.error('Database initialization failed:', err);
    });

app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext: () => ({}), // Context creation if needed
    })
);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
