const API_URL = import.meta.env.VITE_API_URL;

// Загальна функція для виконання запитів
async function fetchData(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Server error');
        }

        return await response.json();
    } catch (error) {
        console.error(`Request failed: ${error.message}`);
        throw error;
    }
}

// Отримати всі дані
export async function loadData() {
    return fetchData(`${API_URL}/data`);
}

// Отримати подорожі користувача
export async function getUserTravels(userId) {
    return fetchData(`${API_URL}/users/${userId}/travels`);
}

// Додати подорож
export async function addUserTravel(userId, travelData) {
    return fetchData(`${API_URL}/users/${userId}/travels`, {
        method: 'POST',
        body: JSON.stringify(travelData)
    });
}

// Видалити подорож
export async function deleteUserTravel(userId, travelId) {
    return fetchData(`${API_URL}/users/${userId}/travels/${travelId}`, {
        method: 'DELETE'
    });
}

// Додати місце
export async function addPlace(newPlace) {
    return fetchData(`${API_URL}/places`, {
        method: 'POST',
        body: JSON.stringify(newPlace)
    });
}

// Видалити місце
export async function deletePlace(placeId) {
    return fetchData(`${API_URL}/places/${placeId}`, {
        method: 'DELETE'
    });
}

// Оновити відгуки
export async function updatePlaceReviews(placeId, reviews) {
    return fetchData(`${API_URL}/places/${placeId}/reviews`, {
        method: 'PUT',
        body: JSON.stringify(reviews)
    });
}