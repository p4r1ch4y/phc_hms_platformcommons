import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Proxy routes
app.use('/auth', createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }));
app.use('/tenants', createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true }));
app.use('/patients', createProxyMiddleware({ target: 'http://localhost:3003', changeOrigin: true }));
app.use('/consultations', createProxyMiddleware({ target: 'http://localhost:3004', changeOrigin: true }));
app.use('/pharmacy', createProxyMiddleware({ target: 'http://localhost:3005', changeOrigin: true }));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
});

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});
