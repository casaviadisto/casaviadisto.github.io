// Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/styles/auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            navigate('/');
        } catch (err) {
            setError('Невірний email або пароль');
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
                <button type="button" onClick={handleGoogleLogin} className="google-btn">
                    Увійти через Google
                </button>
                <button type="submit">Увійти</button>
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