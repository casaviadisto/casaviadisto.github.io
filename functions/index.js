import { onRequest } from 'firebase-functions/v2/https';
import app from './src/app.js';  // ваш Express-додаток

export const api = onRequest({ region: 'europe-west1' }, app);
