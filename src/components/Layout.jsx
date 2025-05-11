import { Outlet, NavLink } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase-config';
import { signOut } from 'firebase/auth';
import '../assets/styles/base.css';

export default function Layout() {
    const [user, loading] = useAuthState(auth);

    if (loading) return <div>Завантаження...</div>;

    return (
        <div className="app">
            <header className="app-header">
                <nav>
                    <ul className="nav-list">
                        <li>
                            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                                Головна
                            </NavLink>
                        </li>

                        {/* Посилання на місця - завжди видиме */}
                        <li>
                            <NavLink to="/places" className={({ isActive }) => isActive ? 'active' : ''}>
                                Місця для відвідування
                            </NavLink>
                        </li>

                        {/* Приховуємо захищені посилання для неавторизованих */}
                        {user && (
                            <>
                                <li>
                                    <NavLink to="/travels" className={({ isActive }) => isActive ? 'active' : ''}>
                                        Мої подорожі
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/budget" className={({ isActive }) => isActive ? 'active' : ''}>
                                        Бюджет
                                    </NavLink>
                                </li>
                            </>
                        )}

                        <li>
                            {user ? (
                                <button onClick={() => signOut(auth)}>Вийти</button>
                            ) : (
                                <NavLink to="/login">Увійти</NavLink>
                            )}
                        </li>
                    </ul>
                </nav>
                <hr />
            </header>

            <main className="app-main">
                <Outlet />
            </main>

            <footer className="app-footer">
                <hr />
                <div className="footer-content">
                    <h5>Виконав студент групи ОІ-24 Антон.</h5>
                    <h5>
                        <a href="https://codeberg.org/casaviadisto/web_2025/" target="_blank" rel="noopener">
                            Codeberg
                        </a>
                    </h5>
                    <h5>
                        <a href="https://github.com/casaviadisto/casaviadisto.github.io/tree/main" target="_blank" rel="noopener">
                            GitHub
                        </a>
                    </h5>
                </div>
            </footer>
        </div>
    );
}