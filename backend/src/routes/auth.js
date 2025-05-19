// backend/src/routes/auth.js
import express from 'express';
import admin from 'firebase-admin';
import axios from 'axios';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const router = express.Router();

// --- Зчитуємо сервісний ключ із файлу ---
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath) {
    console.error('❌ Не задано FIREBASE_SERVICE_ACCOUNT_PATH у .env');
    process.exit(1);
}
let serviceAccount;
try {
    const fullPath = resolve(process.cwd(), serviceAccountPath);
    const file = readFileSync(fullPath, 'utf8');
    serviceAccount = JSON.parse(file);
} catch (e) {
    console.error('❌ Не вдалося прочитати serviceAccountKey.json:', e);
    process.exit(1);
}

// Ініціалізуємо Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
}
const db = admin.database();

// Налаштування для Identity Toolkit REST API
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
if (!FIREBASE_API_KEY) {
    console.error('❌ FIREBASE_API_KEY не заданий у .env');
}

// --- РЕЄСТРАЦІЯ ---
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userRecord = await admin.auth().createUser({ email, password });
        await db.ref(`users/${userRecord.uid}/profile`).set({
            email,
            createdAt: admin.database.ServerValue.TIMESTAMP,
        });
        const token = await admin.auth().createCustomToken(userRecord.uid);
        res.status(201).json({ token });
    } catch (error) {
        console.error('Register error:', error);
        res.status(400).json({ error: error.message });
    }
});

// --- ВХІД ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!FIREBASE_API_KEY) {
        return res.status(500).json({ error: 'Server misconfiguration' });
    }
    try {
        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
            { email, password, returnSecureToken: true }
        );
        const uid = response.data.localId;
        const customToken = await admin.auth().createCustomToken(uid);
        console.log('Generated custom token:', customToken); // для перевірки
        res.json({ token: customToken });
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        const code = error.response?.data?.error?.message;
        let message = 'Невірні облікові дані';
        if (code === 'EMAIL_NOT_FOUND') message = 'Користувача не знайдено';
        if (code === 'INVALID_PASSWORD') message = 'Невірний пароль';
        res.status(400).json({ error: message });
    }
});

// --- СКИДАННЯ ПАРОЛЯ ---
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;
        const link = await admin.auth().generatePasswordResetLink(email, {
            url: `${process.env.CLIENT_URL}/new-password`,
        });
        console.log('Password reset link:', link);
        res.json({ message: 'Лист з інструкціями відправлено' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({ error: error.message });
    }
});

// --- ПІДТВЕРДЖЕННЯ НОВОГО ПАРОЛЯ ---
router.post('/confirm-reset', async (req, res) => {
    try {
        const { oobCode, newPassword } = req.body;
        await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${FIREBASE_API_KEY}`,
            { oobCode, newPassword }
        );
        res.json({ message: 'Пароль успішно змінено' });
    } catch (error) {
        console.error('Confirm reset error:', error.response?.data || error.message);
        const firebaseMessage = error.response?.data?.error?.message;
        const message =
            firebaseMessage === 'INVALID_OOB_CODE'
                ? 'Невірний або прострочений код активації'
                : 'Не вдалося змінити пароль';
        res.status(400).json({ error: message });
    }
});

export default router;
