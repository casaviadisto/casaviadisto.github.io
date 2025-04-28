import { useState, useEffect } from 'react';
import { loadData } from "../data.js";
import '../assets/styles/budget.css';

export default function Budget() {
    const [places, setPlaces] = useState([]);
    const [placeTypes, setPlaceTypes] = useState([]);
    const [destination, setDestination] = useState('');
    const [days, setDays] = useState(1);
    const [result, setResult] = useState(null);
    const [selectedType, setSelectedType] = useState('всі');

    // Ініціалізація даних
    useEffect(() => {
        loadData().then(data => {
            setPlaces(data.travel_places);
            setPlaceTypes(data.place_types);
        }).catch(err => {
            console.error('Помилка завантаження даних:', err);
        });
    }, []);

    // Фільтровані місця
    const filteredPlaces = places.filter(place =>
        selectedType === 'всі' || place.place_type === parseInt(selectedType)
    );

    // Перерахунок вартості
    useEffect(() => {
        if (!destination || days < 1) return setResult(null);
        const place = places.find(p => p.title === destination);
        if (!place) return setResult({error: 'Місце не знайдено'});
        const flight = place.prices.flight;
        const live = place.prices.live * days;
        setResult({
            destination,
            days,
            flight,
            live,
            livePerDay: place.prices.live,
            total: flight + live
        });
    }, [destination, days, places]);

    return (
        <article id="budget">
            <h1>Розрахунок вартості подорожі</h1>
            <section className="calculator">
                <form id="budgetForm">
                    <div className="form-group">
                        <label htmlFor="type">Тип подорожі:</label>
                        <select
                            id="type"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="всі">Всі типи</option>
                            {placeTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name_ua}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="destination">Оберіть місце:</label>
                        <select
                            id="destination"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            required
                        >
                            <option value="" disabled>Виберіть місце</option>
                            {filteredPlaces.map(place => (
                                <option key={place.title} value={place.title}>
                                    {place.title} ({placeTypes.find(t => t.id === place.place_type)?.name_ua})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="days">Кількість днів:</label>
                        <input
                            type="number"
                            id="days"
                            min="1"
                            value={days}
                            onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                            required
                        />
                    </div>
                </form>

                {/* Решта коду з результатами залишається незмінною */}
                <div id="result" className="result-container">
                    {result?.error ? (
                        <div className="error">{result.error}</div>
                    ) : result ? (
                        <>
                            <h3>Деталі розрахунку</h3>
                            <div className="result-item">
                                <span>Місце:</span>
                                <strong>{result.destination}</strong>
                            </div>
                            <div className="result-item">
                                <span>Тривалість:</span>
                                <strong>{result.days} днів</strong>
                            </div>
                            <div className="result-item">
                                <span>Переліт:</span>
                                <strong>{result.flight} €</strong>
                            </div>
                            <div className="result-item">
                                <span>Проживання ({result.livePerDay} €/день):</span>
                                <strong>{result.live} €</strong>
                            </div>
                            <div className="total-cost">
                                <span>Загальна вартість:</span>
                                <strong>{result.total} €</strong>
                            </div>
                        </>
                    ) : null}
                </div>
            </section>
        </article>
    );
}