// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    signInWithCustomToken,
    signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase-config';
import '../assets/styles/auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            // цей токен — customToken від вашого бекенду
            await signInWithCustomToken(auth, res.data.token);
            navigate('/');
        } catch (err) {
            console.error('Frontend login error:', err.response?.data || err.message);
            // показуємо або повідомлення з бекенду, або загальне
            setError(err.response?.data?.error || 'Не вдалося увійти');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/');
        } catch (err) {
            console.error('Google login error:', err);
            setError('Не вдалося увійти через Google');
        }
    };

    return (
        <div className="auth-page">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Вхід</h2>
                {error && <p className="error">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Увійти</button>
                <button
                    type="button"
                    className="google-btn"
                    onClick={handleGoogleLogin}
                >
                    Увійти через Google
                </button>
                <p>
                    Немає акаунту? <Link to="/register">Створити</Link>
                </p>
                <p>
                    <Link to="/reset-password">Забули пароль?</Link>
                </p>
            </form>
        </div>
    );
}
