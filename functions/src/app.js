// backend/src/app.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import apiRouter from './routes/api.js';
import authRouter from './routes/auth.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRouter);          // API routes (data, travels, places, etc.)
app.use('/api/auth', authRouter);    // Authentication routes

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
