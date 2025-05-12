// Travels.jsx
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase-config';
import { loadData, getUserTravels, addUserTravel, deleteUserTravel } from '../data';
import { ref, onValue } from "firebase/database";
import '../assets/styles/travels_places.css';

export default function Travels() {
    const [user] = useAuthState(auth);
    const [travels, setTravels] = useState([]);
    const [dbData, setDbData] = useState({ travel_places: [], place_types: [] });
    const [formData, setFormData] = useState({
        place: '',
        dateStart: '',
        dateEnd: '',
        type: 'completed',
        description: ''
    });
    const [filters, setFilters] = useState({
        status: 'all',
        placeType: 'all'
    });

    // Завантаження спільних даних
    useEffect(() => {
        loadData().then(data => setDbData(data));
    }, []);

    // Синхронізація подорожей з Firebase
    useEffect(() => {
        if (user) {
            const travelsRef = ref(db, `users/${user.uid}/travels`);
            const unsubscribe = onValue(travelsRef, (snapshot) => {
                const data = snapshot.val();
                setTravels(data ? Object.entries(data).map(([id, travel]) => ({ id, ...travel })) : []);
            });
            return () => unsubscribe();
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        const newTravel = {
            completed: formData.type === 'completed',
            city: formData.place,
            dateStart: formatDate(formData.dateStart),
            dateEnd: formatDate(formData.dateEnd),
            img: dbData.travel_places.find(p => p.title === formData.place)?.img || '',
            text: formData.description
        };

        try {
            await addUserTravel(user.uid, newTravel); // Виправлений виклик

            setFormData({
                place: '',
                dateStart: '',
                dateEnd: '',
                type: 'completed',
                description: ''
            });
        } catch (error) {
            console.error("Помилка додавання подорожі:", error);
        }
    };

    // Фільтрація та групування подорожей
    const filteredTravels = travels.filter(travel => {
        const statusMatch = filters.status === 'all' ||
            (filters.status === 'completed' && travel.completed) ||
            (filters.status === 'planned' && !travel.completed);

        const place = dbData.travel_places.find(p => p.title === travel.city);
        const typeMatch = filters.placeType === 'all' ||
            (place && place.place_type === parseInt(filters.placeType));

        return statusMatch && typeMatch;
    });

    const travelsByStatus = filteredTravels.reduce((acc, travel) => {
        const key = travel.completed ? 'completed' : 'planned';
        acc[key].push(travel);
        return acc;
    }, { completed: [], planned: [] });

    const shouldShowCompleted = ['all', 'completed'].includes(filters.status);
    const shouldShowPlanned = ['all', 'planned'].includes(filters.status);

    return (
        <>
            <h1>Мої подорожі</h1>

            <div className="filter-controls">
                <div className="filter-group">
                    <label>Статус:</label>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                    >
                        <option value="all">Всі</option>
                        <option value="completed">Завершені</option>
                        <option value="planned">Заплановані</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Тип місця:</label>
                    <select
                        name="placeType"
                        value={filters.placeType}
                        onChange={handleFilterChange}
                    >
                        <option value="all">Всі типи</option>
                        {dbData.place_types?.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.name_ua}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <article id="travels">
                {shouldShowCompleted && (
                    <div className="card">
                        <h3>Завершені подорожі</h3>
                        <div id="completed">
                            {travelsByStatus.completed.map((travel, index) => (
                                <div key={index} className="card">
                                    <div className="card-header">
                                        <h4>{travel.city}</h4>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => deleteUserTravel(user.uid, travel.id)} // Використовуємо ID подорожі
                                        >
                                            Видалити
                                        </button>
                                    </div>
                                    <p><strong>Дата:</strong> {travel.dateStart} - {travel.dateEnd}</p>
                                    <img
                                        src={travel.img}
                                        alt={travel.city}
                                        className={`img-float ${index % 2 ? 'float-right' : 'float-left'}`}
                                    />
                                    <p>{travel.text}</p>
                                    <div className="clearfix"></div>
                                </div>
                            ))}
                            {travelsByStatus.completed.length === 0 && (
                                <p className="no-results">Немає завершених подорожей</p>
                            )}
                        </div>
                    </div>
                )}

                {shouldShowPlanned && (
                    <div className="card">
                        <h3>Заплановані подорожі</h3>
                        <div id="planned">
                            {travelsByStatus.planned.map((travel, index) => (
                                <div key={index} className="card">
                                    <div className="card-header">
                                        <h4>{travel.city}</h4>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => deleteUserTravel(user.uid, travel.id)} // Використовуємо ID подорожі
                                        >
                                            Видалити
                                        </button>
                                    </div>
                                    <p><strong>Дата:</strong> {travel.dateStart} - {travel.dateEnd}</p>
                                    <img
                                        src={travel.img}
                                        alt={travel.city}
                                        className={`img-float ${index % 2 ? 'float-right' : 'float-left'}`}
                                    />
                                    <p>{travel.text}</p>
                                    <div className="clearfix"></div>
                                </div>
                            ))}
                            {travelsByStatus.planned.length === 0 && (
                                <p className="no-results">Немає запланованих подорожей</p>
                            )}
                        </div>
                    </div>
                )}
            </article>

            <form id="travel_form" className="card" onSubmit={handleSubmit}>
                <h2>Додати подорож</h2>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="travel_place">Місце</label>
                        <select
                            className="form-input"
                            id="travel_place"
                            name="place"
                            value={formData.place}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Оберіть місце</option>
                            {dbData.travel_places?.map((place, index) => ( // Змінено db.travel_places на dbData.travel_places
                                <option key={index} value={place.title}>
                                    {place.title} ({dbData.place_types.find(t => t.id === place.place_type)?.name_ua})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="travel_date_start">Початок</label>
                        <input
                            type="date"
                            className="form-input"
                            id="travel_date_start"
                            name="dateStart"
                            value={formData.dateStart}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="travel_date_end">Кінець</label>
                        <input
                            type="date"
                            className="form-input"
                            id="travel_date_end"
                            name="dateEnd"
                            value={formData.dateEnd}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="travel_type">Тип</label>
                        <select
                            className="form-input"
                            id="travel_type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                        >
                            <option value="completed">Завершена</option>
                            <option value="planned">Запланована</option>
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="travel_description">Опис</label>
                    <textarea
                        className="form-textarea"
                        id="travel_description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                    ></textarea>
                </div>
                <div className="form-submit">
                    <button type="submit" className="btn btn-primary">Додати</button>
                </div>
            </form>
        </>
    );
}