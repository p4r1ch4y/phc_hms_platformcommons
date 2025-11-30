import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import pharmacyRoutes from './routes/pharmacy.routes';

import path from 'path';
// Load environment from repo root so services running individually pick up the same config
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.PORT || 3005;

console.log('Pharmacy Service JWT_SECRET:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + '...' : 'NOT SET');

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/pharmacy', pharmacyRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'pharmacy-service' });
});

app.listen(PORT, () => {
    console.log(`Pharmacy Service running on port ${PORT}`);
});
