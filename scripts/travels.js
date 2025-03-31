let db = {};
const STORAGE_KEY = 'travelData';

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}

function saveToStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('uk-UA');
}

function initPage() {
    const placeSelect = document.getElementById('travel_place');
    placeSelect.innerHTML = '<option value="">Оберіть місце</option>';

    if (db.travel_places?.length) {
        let index = 0;
        do {
            const place = db.travel_places[index];
            const option = document.createElement('option');
            option.value = place.title;
            option.textContent = place.title;
            placeSelect.appendChild(option);
            index++;
        } while (index < db.travel_places.length);
    }

    renderTravels();
}

function renderTravels() {
    const renderSection = (containerId, travels) => {
        const container = document.getElementById(containerId);
        let htmlParts = [];

        if (travels?.length) {
            let index = 0;
            do {
                const travel = travels[index];
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
                index++;
            } while (index < travels.length);
        }

        container.innerHTML = htmlParts.join('');
    };

    renderSection('completed', db.travels?.filter(t => t.completed) || []);
    renderSection('planned', db.travels?.filter(t => !t.completed) || []);
}

function deleteTravel(index) {
    if(confirm('Видалити подорож?')) {
        db.travels.splice(index, 1);
        saveToStorage(db);
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
    saveToStorage(db);
    renderTravels();
    e.target.reset();
});

document.addEventListener('DOMContentLoaded', () => {
    const storedData = loadFromStorage();
    db = storedData || { travels: [], travel_places: [] };
    initPage();
});