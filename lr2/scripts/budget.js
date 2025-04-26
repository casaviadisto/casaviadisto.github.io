async function initStorage() {
    const storedData = localStorage.getItem('travelData');
    if (storedData) {
        try {
            return JSON.parse(storedData);
        } catch (e) {
            console.error('Помилка парсингу localStorage:', e);
        }
    }

    try {
        const response = await fetch('./db.json');
        if (!response.ok) throw new Error('Помилка завантаження');
        const defaultData = await response.json();
        localStorage.setItem('travelData', JSON.stringify(defaultData));
        return defaultData;
    } catch (error) {
        console.error('Помилка завантаження даних:', error);
        return { travels: [], travel_places: [] };
    }
}

async function populateDestinations() {
    const select = document.getElementById('destination');
    select.innerHTML = '<option value="" disabled selected>Виберіть місце</option>';

    try {
        const travelData = await initStorage();
        travelData.travel_places.forEach(place => {
            const option = document.createElement('option');
            option.value = place.title;
            option.textContent = place.title;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Помилка завантаження місць:', error);
    }
}

async function calculateCost() {
    const destination = document.getElementById('destination').value;
    const days = parseInt(document.getElementById('days').value);

    if (!destination || isNaN(days) || days < 1) {
        document.getElementById('result').innerHTML = '';
        return;
    }

    try {
        const travelData = await initStorage();
        const place = travelData.travel_places.find(p => p.title === destination);

        if (!place) throw new Error('Місце не знайдено');

        const flightCost = place.prices.flight;
        const liveCost = place.prices.live * days;
        const total = flightCost + liveCost;

        const resultHTML = `
            <h3>Деталі розрахунку</h3>
            <div class="result-item">
                <span>Місце:</span>
                <strong>${destination}</strong>
            </div>
            <div class="result-item">
                <span>Тривалість:</span>
                <strong>${days} днів</strong>
            </div>
            <div class="result-item">
                <span>Переліт:</span>
                <strong>${flightCost} €</strong>
            </div>
            <div class="result-item">
                <span>Проживання (${place.prices.live} €/день):</span>
                <strong>${liveCost} €</strong>
            </div>
            <div class="total-cost">
                <span>Загальна вартість:</span>
                <strong>${total} €</strong>
            </div>
        `;

        document.getElementById('result').innerHTML = resultHTML;
    } catch (error) {
        document.getElementById('result').innerHTML = `
            <div class="error">${error.message}</div>
        `;
    }
}

window.addEventListener('load', async () => {
    try {
        await populateDestinations();
        document.getElementById('destination').addEventListener('change', calculateCost);
        document.getElementById('days').addEventListener('input', calculateCost);
    } catch (error) {
        console.error('Помилка ініціалізації:', error);
    }
});