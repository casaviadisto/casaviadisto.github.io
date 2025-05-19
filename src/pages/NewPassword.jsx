// NewPassword.jsx
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase-config';
import '../assets/styles/auth.css';

export default function NewPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const oobCode = searchParams.get('oobCode');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setMessage('Пароль успішно змінено!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(getErrorMessage(err.code));
        }
    };

    const getErrorMessage = (code) => {
        switch (code) {
            case 'auth/expired-action-code':
                return 'Посилання застаріло';
            case 'auth/invalid-action-code':
                return 'Невірний код підтвердження';
            case 'auth/weak-password':
                return 'Пароль має бути не менше 6 символів';
            default:
                return 'Помилка при зміні пароля';
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