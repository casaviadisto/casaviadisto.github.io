let db = {};
const STORAGE_KEY = 'travelData';
const $places = document.querySelector('#places');

async function initStorage() {
    const storedData = localStorage.getItem(STORAGE_KEY);
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return defaultData;
    } catch (error) {
        console.error('Помилка завантаження даних:', error);
        return { travels: [], travel_places: [] };
    }
}

function initPage() {
    renderPlaces();
    setupFormHandlers();
    setupReviewToggles();
    setupAddReviewHandlers();
}

function renderPlaces() {
    $places.innerHTML = '';

    db.travel_places?.forEach((place, index) => {
        let reviewsHTML = place.reviews?.map((review, reviewIndex) => `
            <div class="review-item">
                <p>${review}</p>
                <button class="btn btn-danger review-controls" 
                    data-place-index="${index}"
                    data-review-index="${reviewIndex}">×</button>
            </div>
        `).join('') || '';

        $places.innerHTML += `
            <div class="card" data-index="${index}">
                <div class="card-header">
                    <h4>${place.title}</h4>
                    <div>
                        <button class="btn btn-toggle">Показати відгуки</button>
                        <button class="btn btn-danger">Видалити</button>
                    </div>
                </div>
                <img src="${place.img}" alt="${place.title}" class="img-float ${index % 2 ? 'float-right' : 'float-left'}">
                <p>${place.text}</p>
                <div class="price-list">
                    <p><strong>Ціни:</strong></p>
                    <p>Переліт: ${place.prices.flight}€</p>
                    <p>Проживання: ${place.prices.live}€/доба</p>
                </div>
                <div class="clearfix"></div>    
                <div class="reviews-container" style="display: none;">
                    <h5>Відгуки:</h5>
                    <div class="reviews-list">
                        ${reviewsHTML}
                    </div>
                    <div class="new-review">
                        <textarea class="form-textarea new-review-text" 
                                placeholder="Напишіть відгук"></textarea>
                        <button class="btn btn-primary add-review-btn">Додати</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function setupFormHandlers() {
    const form = document.getElementById('place_form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const newPlace = {
            title: formData.get('place'),
            img: formData.get('photo'),
            text: formData.get('description'),
            prices: {
                flight: Number(formData.get('flight_cost')),
                live: Number(formData.get('live_cost'))
            },
            reviews: []
        };

        db.travel_places.push(newPlace);
        saveToStorage(db);
        initPage();
        e.target.reset();
    });
}

function setupReviewToggles() {
    const toggles = document.querySelectorAll('.btn-toggle');
    if (!toggles.length) return;

    let index = 0;
    do {
        const btn = toggles[index];
        btn.addEventListener('click', function() {
            const container = this.closest('.card').querySelector('.reviews-container');
            const isHidden = container.style.display === 'none';

            container.style.display = isHidden ? 'block' : 'none';
            this.textContent = isHidden ? 'Сховати відгуки' : 'Показати відгуки';

            if(isHidden) {
                container.style.maxHeight = container.scrollHeight + 'px';
            } else {
                container.style.maxHeight = '0';
                setTimeout(() => container.style.maxHeight = null, 300);
            }
        });
        index++;
    } while (index < toggles.length);
}

function setupAddReviewHandlers() {
    const addButtons = document.querySelectorAll('.add-review-btn');
    if (!addButtons.length) return;

    let index = 0;
    do {
        const btn = addButtons[index];
        btn.addEventListener('click', function() {
            const placeIndex = this.closest('.card').dataset.index;
            const reviewText = this.previousElementSibling.value;

            if(reviewText.trim()) {
                db.travel_places[placeIndex].reviews.push(reviewText);
                saveToStorage(db);
                initPage();
            }
        });
        index++;
    } while (index < addButtons.length);
}

document.addEventListener('click', function(e) {
    if(e.target.classList.contains('btn-danger')) {
        if(e.target.closest('.card')) {
            const index = e.target.closest('.card').dataset.index;
            if(confirm('Видалити місце?')) {
                db.travel_places.splice(index, 1);
                saveToStorage(db);
                initPage();
            }
        }
        else if(e.target.classList.contains('review-controls')) {
            const placeIndex = e.target.dataset.placeIndex;
            const reviewIndex = e.target.dataset.reviewIndex;
            db.travel_places[placeIndex].reviews.splice(reviewIndex, 1);
            saveToStorage(db);
            initPage();
        }
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        db = await initStorage();
        initPage();
    } catch (error) {
        console.error('Помилка ініціалізації:', error);
    }
});