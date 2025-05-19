// src/pages/ResetPasswors.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/styles/auth.css';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/auth/reset-password`, { email });
            setMessage('Лист для скидання пароля відправлено на вашу пошту');
            setError('');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError('Помилка при відправці листа');
            setMessage('');
        }
    };

    return (
        <div className="auth-page">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Скидання пароля</h2>
                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
                <input
                    type="email"
                    placeholder="Введіть ваш email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Надіслати лист</button>
                <p>
                    Повернутися до <Link to="/login">входу</Link>
                </p>
            </form>
        </div>
    );
}
