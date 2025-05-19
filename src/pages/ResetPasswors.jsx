// ResetPassword.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase-config';
import '../assets/styles/auth.css';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Лист для скидання пароля відправлено на вашу пошту');
            setError('');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(getErrorMessage(err.code));
            setMessage('');
        }
    };

    const getErrorMessage = (code) => {
        switch (code) {
            case 'auth/invalid-email':
                return 'Невірний формат email';
            case 'auth/user-not-found':
                return 'Користувача з таким email не знайдено';
            default:
                return 'Помилка при відправці листа';
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