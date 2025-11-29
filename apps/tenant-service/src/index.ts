import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import tenantRoutes from './routes/tenant.routes';

import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../packages/database/.env') });

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/tenants', tenantRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'tenant-service' });
});

app.listen(port, () => {
    console.log(`Tenant Service running on port ${port}`);
});
