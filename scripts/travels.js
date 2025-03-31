let db = {};
const STORAGE_KEY = 'travelData';

async function initStorage() {
    // Спроба отримати дані з localStorage
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        try {
            return JSON.parse(storedData);
        } catch (e) {
            console.error('Помилка парсингу localStorage:', e);
        }
    }

    // Якщо даних немає - завантажуємо з db.json
    try {
        const response = await fetch('/db.json');
        if (!response.ok) throw new Error('Помилка завантаження');
        const defaultData = await response.json();

        // Зберігаємо в localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return defaultData;
    } catch (error) {
        console.error('Помилка завантаження даних:', error);
        return { travels: [], travel_places: [] };
    }
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('uk-UA');
}

function initPage() {
    const placeSelect = document.getElementById('travel_place');
    placeSelect.innerHTML = '<option value="">Оберіть місце</option>';

    if (db.travel_places?.length) {
        db.travel_places.forEach(place => {
            const option = document.createElement('option');
            option.value = place.title;
            option.textContent = place.title;
            placeSelect.appendChild(option);
        });
    }

    renderTravels();
}

function renderTravels() {
    const renderSection = (containerId, travels) => {
        const container = document.getElementById(containerId);
        let htmlParts = [];

        travels?.forEach((travel, index) => {
            htmlParts.push(`
                <div class="card">
                    <div class="card-header">
                        <h4>${travel.city}</h4>
                        <button class="btn btn-danger" onclick="deleteTravel(${index})">Видалити</button>
                    </div>
                    <p><strong>Дата:</strong> ${travel.dateStart} - ${travel.dateEnd}</p>
                    <img src="${travel.img}" alt="${travel.city}" class="img-float ${index % 2 ? 'float-right' : 'float-left'}">
                    <p>${travel.text}</p>
                    <div class="clearfix"></div>
                </div>
            `);
        });

        container.innerHTML = htmlParts.join('');
    };

    renderSection('completed', db.travels?.filter(t => t.completed));
    renderSection('planned', db.travels?.filter(t => !t.completed));
}

function deleteTravel(index) {
    if(confirm('Видалити подорож?')) {
        db.travels.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
        renderTravels();
    }
}

document.getElementById('travel_form').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const newTravel = {
        city: formData.get('place'),
        dateStart: formatDate(formData.get('dateStart')),
        dateEnd: formatDate(formData.get('dateEnd')),
        completed: formData.get('type') === 'completed',
        img: db.travel_places?.find(p => p.title === formData.get('place'))?.img || '',
        text: formData.get('description')
    };

    db.travels.push(newTravel);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    renderTravels();
    e.target.reset();
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        db = await initStorage();
        initPage();
    } catch (error) {
        console.error('Помилка ініціалізації:', error);
    }
});