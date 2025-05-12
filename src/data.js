// data.js
import { db } from './firebase-config';
import { ref, get, child, push, set, remove } from "firebase/database";

export async function loadData() {
    try {
        const dbRef = ref(db);
        const [placesSnap, typesSnap] = await Promise.all([
            get(child(dbRef, 'travel_places')),
            get(child(dbRef, 'place_types'))
        ]);

        return {
            travel_places: placesSnap.exists()
                ? Object.entries(placesSnap.val()).map(([id, place]) => ({
                    id,
                    ...place,
                    prices: place.prices || { flight: 0, live: 0 },
                    reviews: place.reviews || [] // Додано ініціалізацію reviews
                }))
                : [],
            place_types: typesSnap.exists()
                ? Object.values(typesSnap.val())
                : []
        };
    } catch (error) {
        console.error("Помилка завантаження даних:", error);
        throw error;
    }
}

export async function getUserTravels(userId) {
    const travelsRef = ref(db, `users/${userId}/travels`);
    const snapshot = await get(travelsRef);
    return snapshot.exists() ? Object.entries(snapshot.val()).map(([id, travel]) => ({ id, ...travel })) : [];
}

export async function addUserTravel(userId, travelData) {
    try {
        const travelsRef = ref(db, `users/${userId}/travels`);
        const newTravelRef = push(travelsRef);
        await set(newTravelRef, travelData);
        return newTravelRef.key;
    } catch (error) {
        console.error("Помилка додавання подорожі:", error);
        throw error;
    }
}

export async function deleteUserTravel(userId, travelId) {
    try {
        const travelRef = ref(db, `users/${userId}/travels/${travelId}`);
        await remove(travelRef);
    } catch (error) {
        console.error("Помилка видалення подорожі:", error);
        throw error;
    }
}

export async function addPlace(newPlace) {
    try {
        const placesRef = ref(db, 'travel_places');
        const newPlaceRef = push(placesRef);
        await set(newPlaceRef, newPlace);
        return newPlaceRef.key;
    } catch (error) {
        console.error("Помилка додавання місця:", error);
        throw error;
    }
}

export async function deletePlace(placeId) {
    try {
        const placeRef = ref(db, `travel_places/${placeId}`);
        await remove(placeRef);
    } catch (error) {
        console.error("Помилка видалення місця:", error);
        throw error;
    }
}

export async function updatePlaceReviews(placeId, reviews) {
    try {
        const placeRef = ref(db, `travel_places/${placeId}/reviews`);
        await set(placeRef, reviews);
    } catch (error) {
        console.error("Помилка оновлення відгуків:", error);
        throw error;
    }
}