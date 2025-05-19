// src/pages/NewPassword.jsx
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/styles/auth.css';

export default function NewPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const oobCode = searchParams.get('oobCode');  // from email link
    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/auth/confirm-reset`, { oobCode, newPassword });
            setMessage('Пароль успішно змінено!');
            setError('');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError('Помилка при зміні пароля');
            setMessage('');
        }
    };

    return (
        <div className="auth-page">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Встановіть новий пароль</h2>
                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
                <input
                    type="password"
                    placeholder="Новий пароль"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <button type="submit">Змінити пароль</button>
            </form>
        </div>
    );
}
