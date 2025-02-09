import express from 'express';
import { transactionIdMiddleware } from './middleware/transactionIdMiddleware';
import cors from 'cors';
import { loggerConsole } from './middleware/loggerConsole';
import healthCheckRoutes from './routes/healthCheckRoutes';
import catalogRoutes from './routes/catalogRoutes';

const app = express();

app.use(transactionIdMiddleware);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(loggerConsole);

app.use('/v2/api/health', healthCheckRoutes);
app.use('/v2/api/catalog', catalogRoutes);

export default app;

