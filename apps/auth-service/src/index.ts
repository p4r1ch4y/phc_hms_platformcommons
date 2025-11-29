import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../packages/database/.env') });

const app = express();
const port = process.env.PORT || 3001;

console.log('Auth Service JWT_SECRET:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + '...' : 'NOT SET');

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'auth-service' });
});

app.listen(port, () => {
    console.log(`Auth Service running on port ${port}`);
});
