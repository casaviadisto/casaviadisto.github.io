import {useAuthState} from 'react-firebase-hooks/auth';
import {auth} from '../firebase-config';
import {useState, useEffect} from 'react';
import {loadData} from "../data.js";
import '../assets/styles/travels_places.css';
import {Link} from "react-router-dom";

const PlaceCard = ({place, placeTypes, index, onDelete, onToggle, isExpanded, onAddReview, onDeleteReview}) => {
    const [reviewText, setReviewText] = useState('');
    const placeType = placeTypes.find(type => type.id === place.place_type) || {};

    return (
        <div className="card" data-index={index}>
            <div className="card-header">
                <h4>{place.title}</h4>
                <div>
                    <button
                        className="btn btn-toggle"
                        onClick={() => onToggle(index)}
                    >
                        {isExpanded ? 'Сховати відгуки' : 'Показати відгуки'}
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={() => onDelete(index)}
                    >
                        Видалити
                    </button>
                </div>
            </div>
            <img
                src={place.img}
                alt={place.title}
                className={`img-float ${index % 2 ? 'float-right' : 'float-left'}`}
            />
            <p>{place.text}</p>
            <div className="price-list">
                <p><strong>Ціни:</strong></p>
                <p>Переліт: {place.prices.flight}€</p>
                <p>Проживання: {place.prices.live}€/доба</p>
                <p>Тип: {placeType.name_ua}</p>
            </div>
            <div className="clearfix"></div>

            <div
                className="reviews-container"
                style={{display: isExpanded ? 'block' : 'none'}}
            >
                <h5>Відгуки:</h5>
                <div className="reviews-list">
                    {place.reviews?.map((review, reviewIndex) => (
                        <div key={reviewIndex} className="review-item">
                            <p>{review}</p>
                            <button
                                className="btn btn-danger review-controls"
                                onClick={() => onDeleteReview(index, reviewIndex)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
                <div className="new-review">
                    <textarea
                        className="form-textarea new-review-text"
                        placeholder="Напишіть відгук"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                    ></textarea>
                    <button
                        className="btn btn-primary add-review-btn"
                        onClick={() => {
                            onAddReview(index, reviewText);
                            setReviewText('');
                        }}
                    >
                        Додати
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Places() {
    const [user] = useAuthState(auth);
    const [db, setDb] = useState({travels: [], travel_places: [], place_types: []});
    const [formData, setFormData] = useState({
        place: '',
        photo: '',
        flight_cost: '',
        live_cost: '',
        description: '',
        place_type: 0
    });
    const [expandedPlace, setExpandedPlace] = useState(null);
    const [selectedType, setSelectedType] = useState('всі');

    // Фільтровані місця
    const filteredPlaces = db.travel_places?.filter(place =>
        selectedType === 'всі' || place.place_type === parseInt(selectedType)
    ) || [];

    // Ініціалізація даних
    useEffect(() => {
        const initialize = async () => {
            try {
                const data = await loadData();
                setDb(data);
            } catch (error) {
                console.error('Помилка ініціалізації:', error);
            }
        };
        initialize();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const newPlace = {
            title: formData.place,
            img: formData.photo,
            text: formData.description,
            place_type: parseInt(formData.place_type),
            prices: {
                flight: Number(formData.flight_cost),
                live: Number(formData.live_cost)
            },
            reviews: []
        };

        const updatedDb = {
            ...db,
            travel_places: [...db.travel_places, newPlace]
        };

        setDb(updatedDb);
        localStorage.setItem('travelData', JSON.stringify(updatedDb));
        setFormData({
            place: '',
            photo: '',
            flight_cost: '',
            live_cost: '',
            description: '',
            place_type: 0
        });
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <>
            <h1>Місця для відвідування</h1>

            <div className="filter-controls">
                <div className="filter-group">
                    <label>Фільтр за типом: </label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="всі">Всі типи</option>
                        {db.place_types?.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.name_ua}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <article id="places">
                {filteredPlaces.map((place, index) => (
                    <PlaceCard
                        key={index}
                        place={place}
                        placeTypes={db.place_types}
                        index={index}
                        isExpanded={expandedPlace === index}
                        onToggle={(currentIndex) => {
                            setExpandedPlace(prev =>
                                prev === currentIndex ? null : currentIndex
                            );
                        }}
                        onDelete={(index) => {
                            if (window.confirm('Видалити місце?')) {
                                const updatedPlaces = [...db.travel_places];
                                updatedPlaces.splice(index, 1);
                                const updatedDb = {...db, travel_places: updatedPlaces};
                                setDb(updatedDb);
                                localStorage.setItem('travelData', JSON.stringify(updatedDb));
                            }
                        }}
                        onAddReview={(index, text) => {
                            const updatedPlaces = [...db.travel_places];
                            updatedPlaces[index].reviews.push(text);
                            const updatedDb = {...db, travel_places: updatedPlaces};
                            setDb(updatedDb);
                            localStorage.setItem('travelData', JSON.stringify(updatedDb));
                        }}
                        onDeleteReview={(placeIndex, reviewIndex) => {
                            const updatedPlaces = [...db.travel_places];
                            updatedPlaces[placeIndex].reviews.splice(reviewIndex, 1);
                            const updatedDb = {...db, travel_places: updatedPlaces};
                            setDb(updatedDb);
                            localStorage.setItem('travelData', JSON.stringify(updatedDb));
                        }}
                    />
                ))}
            </article>
            {user && (
                <form id="place_form" className="card" onSubmit={handleSubmit}>
                    <h2>Додати місце</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="place_place">Назва</label>
                            <input
                                type="text"
                                className="form-input"
                                id="place_place"
                                name="place"
                                value={formData.place}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="place_photo">Фото</label>
                            <input
                                type="url"
                                className="form-input"
                                id="place_photo"
                                name="photo"
                                value={formData.photo}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="flight_cost">Переліт (€)</label>
                            <input
                                type="number"
                                className="form-input"
                                id="flight_cost"
                                name="flight_cost"
                                value={formData.flight_cost}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="live_cost">Проживання (€/доба)</label>
                            <input
                                type="number"
                                className="form-input"
                                id="live_cost"
                                name="live_cost"
                                value={formData.live_cost}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="place_type">Тип місця</label>
                            <select
                                className="form-input"
                                id="place_type"
                                name="place_type"
                                value={formData.place_type}
                                onChange={handleInputChange}
                                required
                            >
                                {db.place_types?.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name_ua}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="place_description">Опис</label>
                        <textarea
                            className="form-textarea"
                            id="place_description"
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
            )}
            {!user && (
                <div className="card auth-notice">
                    <p>Щоб додавати нові місця, будь ласка <Link to="/login">увійдіть</Link> або <Link
                        to="/register">зареєструйтесь</Link>.</p>
                </div>
            )}
        </>
    );
}