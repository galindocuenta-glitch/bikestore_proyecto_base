import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contex/AuthContext';
import ProtectedRoute from './components/ProtectecRoute';
import LoginPage  from './pages/LoginPage';
import RegisterPage from './pages/RegisgterPage';
import EquiposPage from './pages/EquiposPage';
import './assets/styles.css';

export default function App() {
    return (
        <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<LoginPage/>} />
                <Route path="/registro" element={<RegisterPage/>} />

                <Route element={<ProtectedRoute/>} />
                <Route path="/registro" element={<RegisterPage/>} />
                

                </Routes>
                </AuthProvider>
                </BrowserRouter>
    );
}