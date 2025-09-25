import express from 'express';
import healthRoutes from './routes/health.routes';
import interviewRoutes from './routes/interview.routes';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(healthRoutes);
app.use(interviewRoutes);

export default app;
