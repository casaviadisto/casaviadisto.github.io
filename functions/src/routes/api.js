// backend/src/routes/api.js
import express from 'express';
import admin from 'firebase-admin';
const router = express.Router();

// Ensure Firebase Admin is initialized (if not done elsewhere)
import { readFileSync } from 'fs';
import {resolve} from "path";
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

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}
const db = admin.database();

// Example data endpoints (unchanged)
// GET /api/data
router.get('/data', async (req, res) => {
    try {
        const [placesSnap, typesSnap] = await Promise.all([
            db.ref('travel_places').once('value'),
            db.ref('place_types').once('value')
        ]);
        const responseData = {
            travel_places: placesSnap.exists()
                ? Object.entries(placesSnap.val()).map(([id, place]) => ({
                    id,
                    ...place,
                    prices: place.prices || { flight: 0, live: 0 },
                    reviews: place.reviews || []
                }))
                : [],
            place_types: typesSnap.exists()
                ? Object.values(typesSnap.val())
                : []
        };
        res.json(responseData);
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// User travels endpoints (no auth middleware for simplicity)
router.get('/users/:userId/travels', async (req, res) => {
    try {
        const snapshot = await db.ref(`users/${req.params.userId}/travels`).once('value');
        const travels = snapshot.exists()
            ? Object.entries(snapshot.val()).map(([id, travel]) => ({ id, ...travel }))
            : [];
        res.json(travels);
    } catch (error) {
        console.error('Error fetching travels:', error);
        res.status(500).json({ error: 'Failed to get travels' });
    }
});
router.post('/users/:userId/travels', async (req, res) => {
    try {
        const newTravelRef = db.ref(`users/${req.params.userId}/travels`).push();
        await newTravelRef.set({
            ...req.body,
            createdAt: admin.database.ServerValue.TIMESTAMP
        });
        res.status(201).json({ id: newTravelRef.key, ...req.body });
    } catch (error) {
        console.error('Add Travel Error:', error);
        res.status(400).json({ error: 'Invalid travel data' });
    }
});
router.delete('/users/:userId/travels/:travelId', async (req, res) => {
    try {
        await db.ref(`users/${req.params.userId}/travels/${req.params.travelId}`).remove();
        res.json({ success: true });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(404).json({ error: 'Travel not found' });
    }
});

// Places endpoints
router.post('/places', async (req, res) => {
    try {
        const newPlaceRef = db.ref('travel_places').push();
        await newPlaceRef.set(req.body);
        res.status(201).json({ id: newPlaceRef.key, ...req.body });
    } catch (error) {
        console.error('Add Place Error:', error);
        res.status(400).json({ error: 'Invalid place data' });
    }
});
router.delete('/places/:placeId', async (req, res) => {
    try {
        await db.ref(`travel_places/${req.params.placeId}`).remove();
        res.json({ success: true });
    } catch (error) {
        console.error('Delete Place Error:', error);
        res.status(404).json({ error: 'Place not found' });
    }
});
router.put('/places/:placeId/reviews', async (req, res) => {
    try {
        await db.ref(`travel_places/${req.params.placeId}/reviews`).set(req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Update Reviews Error:', error);
        res.status(400).json({ error: 'Invalid reviews data' });
    }
});

export default router;
