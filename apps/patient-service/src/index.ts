import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import patientRoutes from './routes/patient.routes';

import path from 'path';
// Load environment from repo root so services running individually pick up the same config
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const port = process.env.PORT || 3003;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/patients', patientRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'patient-service' });
});

app.listen(port, () => {
    console.log(`Patient Service running on port ${port}`);
});
