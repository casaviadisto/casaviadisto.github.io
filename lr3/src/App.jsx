import {BrowserRouter, Routes, Route} from 'react-router-dom';  // History API :contentReference[oaicite:4]{index=4}
import Layout from './components/Layout';
import Home from './pages/Home';
import Travels from './pages/Travels';
import Places from './pages/Places';
import Budget from './pages/Budget';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout/>}>                {/* Загальний Layout */}
                    <Route index element={<Home/>}/> {/* / */}
                    <Route path="travels" element={<Travels/>}/> {/* /travels */}
                    <Route path="places" element={<Places/>}/> {/* /places */}
                    <Route path="budget" element={<Budget/>}/> {/* /budget */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
