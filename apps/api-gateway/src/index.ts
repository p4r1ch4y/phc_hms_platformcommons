import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

import path from 'path';
// Load environment from repo root so services running individually pick up the same config
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Proxy routes (use environment-provided service URLs in containerized setups)
const AUTH_TARGET = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const TENANT_TARGET = process.env.TENANT_SERVICE_URL || 'http://localhost:3002';
const PATIENT_TARGET = process.env.PATIENT_SERVICE_URL || 'http://localhost:3003';
const CONSULTATION_TARGET = process.env.CONSULTATION_SERVICE_URL || 'http://localhost:3004';
const PHARMACY_TARGET = process.env.PHARMACY_SERVICE_URL || 'http://localhost:3005';

app.use('/auth', createProxyMiddleware({ target: AUTH_TARGET, changeOrigin: true }));
app.use('/tenants', createProxyMiddleware({ target: TENANT_TARGET, changeOrigin: true }));
app.use('/patients', createProxyMiddleware({ target: PATIENT_TARGET, changeOrigin: true }));
app.use('/consultations', createProxyMiddleware({ target: CONSULTATION_TARGET, changeOrigin: true }));
app.use('/pharmacy', createProxyMiddleware({ target: PHARMACY_TARGET, changeOrigin: true }));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
});

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});
