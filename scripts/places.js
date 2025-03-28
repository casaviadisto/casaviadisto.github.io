let db = {};
const STORAGE_KEY = 'travelData';
const $places = document.querySelector('#places');

// Функції для роботи з localStorage
function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}

function saveToStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadData() {
    const storedData = loadFromStorage();

    if(storedData) {
        db = storedData;
        initPage();
    } else {
        fetch('../db.json')
            .then(res => res.json())
            .then(data => {
                db = data;
                saveToStorage(db);
                initPage();
            })
            .catch(error => {
                console.error('Помилка завантаження даних:', error);
                db = { travels: [], travel_places: [] };
                initPage();
            });
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
    db.travel_places.forEach((place, index) => {
        const html = `
            <section class="place-item" data-index="${index}">
                <div class="place-header">
                    <h4>${place.title}</h4>
                    <div>
                        <button class="toggle-reviews-btn">Показати відгуки</button>
                        <button class="delete-place-btn">Видалити</button>
                    </div>
                </div>
                
                <div class="place-content">
                    <img src="${place.img}" alt="${place.title}" 
                         class="${index % 2 ? 'float-right' : 'float-left'}">
                    <div class="place-text">
                        <p>${place.text}</p>
                        <div class="prices">
                            <p><strong>Ціна:</strong></p>
                            <p>Переліт: ${place.prices.flight}€</p>
                            <p>Проживання: ${place.prices.live}€/доба</p>
                        </div>
                    </div>
                    <div class="clearfix"></div>
                </div>
                
                <div class="reviews-container" style="display: none;">
                    <h5>Відгуки:</h5>
                    <div class="reviews-list">
                        ${place.reviews.map((review, reviewIndex) => `
                            <div class="review">
                                <p>${review}</p>
                                <button class="delete-review-btn" 
                                        data-place-index="${index}"
                                        data-review-index="${reviewIndex}">
                                    Видалити
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="new-review">
                        <textarea class="new-review-text" 
                                placeholder="Напишіть свій відгук"></textarea>
                        <button class="add-review-btn">Додати відгук</button>
                    </div>
                </div>
                <hr>
            </section>
        `;
        $places.insertAdjacentHTML('beforeend', html);
    });
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
        renderPlaces();
        setupReviewToggles();
        setupAddReviewHandlers();
        e.target.reset();
    });
}

function setupReviewToggles() {
    document.querySelectorAll('.toggle-reviews-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const container = this.closest('.place-item').querySelector('.reviews-container');
            const isHidden = window.getComputedStyle(container).display === 'none';

            container.style.display = isHidden ? 'block' : 'none';
            this.textContent = isHidden ? 'Сховати відгуки' : 'Показати відгуки';

            if(isHidden) {
                container.style.maxHeight = container.scrollHeight + 'px';
            } else {
                container.style.maxHeight = '0';
                setTimeout(() => {
                    container.style.maxHeight = null;
                }, 300);
            }
        });
    });
}

function setupAddReviewHandlers() {
    document.querySelectorAll('.add-review-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const placeIndex = this.closest('.place-item').dataset.index;
            const reviewText = this.previousElementSibling.value;

            if(reviewText.trim()) {
                db.travel_places[placeIndex].reviews.push(reviewText);
                saveToStorage(db);
                renderPlaces();
                setupReviewToggles();
                setupAddReviewHandlers();
                this.previousElementSibling.value = '';
            }
        });
    });
}

function deletePlace(e) {
    const index = e.target.closest('.place-item').dataset.index;
    if(confirm('Видалити це місце?')) {
        db.travel_places.splice(index, 1);
        saveToStorage(db);
        renderPlaces();
    }
}

function deleteReview(e) {
    const placeIndex = e.target.dataset.placeIndex;
    const reviewIndex = e.target.dataset.reviewIndex;

    db.travel_places[placeIndex].reviews.splice(reviewIndex, 1);
    saveToStorage(db);
    renderPlaces();
    setupReviewToggles();
    setupAddReviewHandlers();
}

// Обробники подій
document.addEventListener('click', function(e) {
    if(e.target.classList.contains('delete-place-btn')) {
        deletePlace(e);
    }
    if(e.target.classList.contains('delete-review-btn')) {
        deleteReview(e);
    }
});

// Ініціалізація
document.addEventListener('DOMContentLoaded', loadData);