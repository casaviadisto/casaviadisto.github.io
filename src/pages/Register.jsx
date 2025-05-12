import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import '../assets/styles/auth.css';
import { auth, googleProvider, db } from '../firebase-config';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Function to write user profile to Realtime Database
    const writeUserProfile = async (uid, email, displayName = null) => {
        const profileRef = ref(db, `users/${uid}/profile`);
        const profileData = {
            email,
            displayName,
            createdAt: Date.now(),
        };
        await set(profileRef, profileData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // Save profile in Realtime Database
            await writeUserProfile(user.uid, user.email, user.displayName);
            navigate('/');
        } catch (err) {
            setError('Помилка реєстрації: ' + err.message);
        }
    };

    const handleGoogleRegister = async () => {
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            // Save or update profile in Realtime Database
            await writeUserProfile(user.uid, user.email, user.displayName);
            navigate('/');
        } catch (err) {
            setError('Помилка реєстрації через Google: ' + err.message);
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
                <button type="button" onClick={handleGoogleRegister} className="google-btn">
                    Зареєструватися через Google
                </button>
                <p>
                    Вже є акаунт? <Link to="/login">Увійти</Link>
                </p>
            </form>
        </div>
    );
}
