import 'dotenv/config';
import express from 'express';
import { checkConnection } from './src/config/dynamodb.js';
import authRoutes from './src/routes/auth.js';
import doctorRoutes from './src/routes/doctors.js';
import patientRoutes from './src/routes/patients.js';
import appointmentRoutes from './src/routes/appointments.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ALLOWED_ORIGINS = (process.env.CLIENT_URL || 'https://healthcare-appoinment.vercel.app')
  .split(',')
  .map((o) => o.trim());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const start = async () => {
  const dbOk = await checkConnection();
  if (!dbOk) {
    console.error('\n⚠️  Server starting anyway — fix DynamoDB credentials in .env\n');
  }
  app.listen(PORT, () => {
    console.log(`\nServer running at http://localhost:${PORT}`);
    console.log(`Health check : http://localhost:${PORT}/health`);
    console.log(`API base     : http://localhost:${PORT}/api`);
  });
};

start();
