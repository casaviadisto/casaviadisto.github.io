import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import '../assets/styles/auth.css';
import {signInWithPopup} from 'firebase/auth';
import {auth, googleProvider} from '../firebase-config';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err) {
            setError('Помилка реєстрації: ' + err.message);
        }
    };

    const handleGoogleRegister = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/');
        } catch (err) {
            setError('Помилка реєстрації через Google');
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