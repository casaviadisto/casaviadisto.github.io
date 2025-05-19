// server/src/routes/auth.js
import express from 'express';
import admin from 'firebase-admin';
import axios from 'axios';
import db from '../firebase.js';

const router = express.Router();
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

// Реєстрація
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Створення користувача
        const userRecord = await admin.auth().createUser({ email, password });

        // Збереження профілю
        const profileRef = db.ref(`users/${userRecord.uid}/profile`);
        await profileRef.set({
            email,
            createdAt: admin.database.ServerValue.TIMESTAMP
        });

        // Генерація токена
        const token = await admin.auth().createCustomToken(userRecord.uid);

        res.status(201).json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Вхід
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
            { email, password, returnSecureToken: true }
        );

        res.json({ token: response.data.idToken });
    } catch (error) {
        res.status(400).json({ error: 'Невірні облікові дані' });
    }
});

// Скидання пароля
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;
        const link = await admin.auth().generatePasswordResetLink(email, {
            url: `${process.env.CLIENT_URL}/new-password`
        });

        // Тут додайте логіку відправки листа
        console.log('Password reset link:', link);

        res.json({ message: 'Лист з інструкціями відправлено' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Підтвердження нового пароля
router.post('/confirm-reset', async (req, res) => {
    try {
        const { oobCode, newPassword } = req.body;
        await admin.auth().confirmPasswordReset(oobCode, newPassword);
        res.json({ message: 'Пароль успішно змінено' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;