let db = {};
const STORAGE_KEY = 'travelData';

let completed_counter = 0;
let planned_counter = 0;

const $completed = document.querySelector('#completed');
const $planned = document.querySelector('#planned');


// Функція для форматування дати з ISO (2025-03-03) в ДД.ММ.РРРР
function formatDate(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}



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
                // Конвертуємо дати при першому завантаженні
                data.travels.forEach(travel => {
                    if (travel.dateStart && travel.dateStart.includes('-')) {
                        travel.dateStart = formatDate(travel.dateStart);
                    }
                    if (travel.dateEnd && travel.dateEnd.includes('-')) {
                        travel.dateEnd = formatDate(travel.dateEnd);
                    }
                });

                db = data;
                saveToStorage(db);
                initPage();
            })
            .catch(error => {
                console.error('Помилка завантаження даних:', error);
                // Створюємо пусту структуру, якщо файл не знайдено
                db = { travels: [], travel_places: [] };
                initPage();
            });
    }
}

function initPage() {
    const placeSelect = document.getElementById('travel_place');
    placeSelect.innerHTML = '<option value="">Оберіть місце</option>';

    if (db.travel_places) {
        db.travel_places.forEach(place => {
            const option = document.createElement('option');
            option.value = place.title;
            option.textContent = place.title;
            placeSelect.appendChild(option);
        });
    }

    add_section(db.travels || []);
}

function add_section(data) {
    $completed.innerHTML = '';
    $planned.innerHTML = '';
    completed_counter = 0;
    planned_counter = 0;

    data.forEach((item, index) => {
        const html = `
            <section>
                <div class="place-header">
                    <h4>${item.city || item.title}</h4>    
                    <button type="button" onclick="deleteTravel(${index})" class="delete-btn">Видалити</button>            
                </div> 
                <p><strong>Дата:</strong> ${item.dateStart || item.period} - ${item.dateEnd || ''}</p>
                <img class="${index % 2 ? 'float-right' : 'float-left'}" 
                     src="${item.img}" 
                     alt="${item.city || item.title}">
                <div class="text">
                    <p>${item.text}</p>
                </div>
            </section>
            <hr>
        `;

        if(item.completed) {
            $completed.insertAdjacentHTML('beforeend', html);
            completed_counter++;
        } else {
            $planned.insertAdjacentHTML('beforeend', html);
            planned_counter++;
        }
    });
}

function deleteTravel(index) {
    if (confirm('Ви впевнені, що хочете видалити цю подорож?')) {
        db.travels.splice(index, 1);
        saveToStorage(db);
        add_section(db.travels);
    }
}

document.getElementById('travel_form').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const place = formData.get('place');
    if (!place) {
        alert('Будь ласка, оберіть місце подорожі');
        return;
    }

    console.log(formData);

    const newTravel = {
        city: place,
        dateStart: formatDate(formData.get('dateStart')),
        dateEnd: formatDate(formData.get('dateEnd')),
        completed: formData.get('type') === 'completed',
        img: '',
        text: formData.get('description')
    };

    // Пошук фото для обраного місця
    if (db.travel_places) {
        const selectedPlace = db.travel_places.find(p => p.title === place);
        if (selectedPlace) {
            newTravel.img = selectedPlace.img;
        }
    }

    if (!db.travels) {
        db.travels = [];
    }
    // console.log('****************');
    // console.log(newTravel);

    db.travels.push(newTravel);
    saveToStorage(db);
    add_section(db.travels);
    // event.target.reset();
});

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function() {
    loadData();
});