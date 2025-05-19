// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../firebase-config';
import '../assets/styles/auth.css';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Call backend to create user and get custom token
            const res = await axios.post(`${API_URL}/auth/register`, { email, password });
            const token = res.data.token;
            // Sign in with custom token
            await signInWithCustomToken(auth, token);
            navigate('/');
        } catch (err) {
            setError('Помилка реєстрації: ' + err.response?.data?.error || err.message);
        }
    };

    return (
        <div className="auth-page">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Реєстрація</h2>
                {error && <p className="error">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Зареєструватися</button>
                <p>
                    Вже є акаунт? <Link to="/login">Увійти</Link>
                </p>
            </form>
        </div>
    );
}
