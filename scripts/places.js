let db = {};
const STORAGE_KEY = 'travelData';
const $places = document.querySelector('#places');

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}

function saveToStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function initPage() {
    renderPlaces();
    setupFormHandlers();
    setupReviewToggles();
    setupAddReviewHandlers();
}

function renderPlaces() {
    $places.innerHTML = db.travel_places.map((place, index) => `
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
                    ${place.reviews.map((review, i) => `
                        <div class="review-item">
                            <p>${review}</p>
                            <button class="btn btn-danger review-controls" 
                                data-place-index="${index}"
                                data-review-index="${i}">×</button>
                        </div>
                    `).join('')}
                </div>
                <div class="new-review">
                    <textarea class="form-textarea new-review-text" 
                            placeholder="Напишіть відгук"></textarea>
                    <button class="btn btn-primary add-review-btn">Додати</button>
                </div>
            </div>
        </div>
    `).join('');
}

function setupFormHandlers() {
    document.getElementById('place_form').addEventListener('submit', function(e) {
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
    document.querySelectorAll('.btn-toggle').forEach(btn => {
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
    });
}

function setupAddReviewHandlers() {
    document.querySelectorAll('.add-review-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const placeIndex = this.closest('.card').dataset.index;
            const reviewText = this.previousElementSibling.value;

            if(reviewText.trim()) {
                db.travel_places[placeIndex].reviews.push(reviewText);
                saveToStorage(db);
                initPage();
            }
        });
    });
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

document.addEventListener('DOMContentLoaded', () => {
    db = loadFromStorage() || { travels: [], travel_places: [] };
    initPage();
});