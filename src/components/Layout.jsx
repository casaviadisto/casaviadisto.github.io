import {Outlet, Link} from 'react-router-dom';
import '../assets/styles/base.css';

export default function Layout() {
    return (
        <>
            <header>
                <nav>
                    <ul>
                        <li><Link to="/">Головна</Link></li>
                        <li><Link to="/travels">Мої подорожі</Link></li>
                        <li><Link to="/places">Місця для відвідування</Link></li>
                        <li><Link to="/budget">Бюджет</Link></li>
                    </ul>
                </nav>
                <hr/>
            </header>

            <main><Outlet/></main>
            {/* рендерить поточну сторінку */}

            <footer>
                <hr/>
                <div>
                    <h5>Виконав студент групи ОІ-24 Антон.</h5>
                    <h5><a href="https://codeberg.org/casaviadisto/web_2025/">Codeberg</a></h5>
                    <h5><a href="https://github.com/casaviadisto/casaviadisto.github.io/tree/main">GitHub</a></h5>
                </div>
            </footer>
        </>
    );
}
