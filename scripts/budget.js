function populateDestinations() {
    const travelData = JSON.parse(localStorage.getItem('travelData'));
    const select = document.getElementById('destination');

    travelData.travel_places.forEach(place => {
        const option = document.createElement('option');
        option.value = place.title;
        option.textContent = place.title;
        select.appendChild(option);
    });
}

function calculateCost() {
    const destination = document.getElementById('destination').value;
    const days = parseInt(document.getElementById('days').value);
    const travelData = JSON.parse(localStorage.getItem('travelData'));

    if (!destination || isNaN(days) || days < 1) {
        document.getElementById('result').innerHTML = '';
        return;
    }

    const place = travelData.travel_places.find(p => p.title === destination);
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
}

// Ініціалізація при завантаженні сторінки
window.onload = () => {
    populateDestinations();
    document.getElementById('destination').addEventListener('change', calculateCost);
    document.getElementById('days').addEventListener('input', calculateCost);
};