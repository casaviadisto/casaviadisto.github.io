export async function loadData() {
    const key = 'travelData';

    // якщо є в localStorage
    const cached = localStorage.getItem(key);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (err) {
            console.error('Помилка при розборі JSON з localStorage', err);
        }
    }

    // якщо немає або зіпсоване — тягнемо з db.json
    const response = await fetch('./db.json');
    if (!response.ok) {
        throw new Error('Помилка завантаження db.json');
    }

    const data = await response.json();
    localStorage.setItem(key, JSON.stringify(data));
    return data;
}