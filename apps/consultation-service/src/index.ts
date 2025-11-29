import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import consultationRoutes from './routes/consultation.routes';

import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../packages/database/.env') });

const app = express();
const port = process.env.PORT || 3004;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/consultations', consultationRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'consultation-service' });
});

app.listen(port, () => {
    console.log(`Consultation Service running on port ${port}`);
});
