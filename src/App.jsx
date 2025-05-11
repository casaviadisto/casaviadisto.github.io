import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Travels from './pages/Travels';
import Places from './pages/Places';
import Budget from './pages/Budget';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
    return (
        <HashRouter>
            <Routes>
                {/* Публічні маршрути */}
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="places" element={<Places />} />
                </Route>

                {/* Приватні маршрути */}
                <Route element={<PrivateRoute />}>
                    <Route path="/" element={<Layout />}>
                        <Route path="travels" element={<Travels />} />
                        <Route path="budget" element={<Budget />} />
                    </Route>
                </Route>
            </Routes>
        </HashRouter>
    );
}