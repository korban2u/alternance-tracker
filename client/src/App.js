// Modifiez votre fichier client/src/App.js comme suit:

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Offers from './pages/Offers';
import OfferDetail from './pages/OfferDetail';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Nouvelles pages pour l'itération 3
import Reminders from './pages/Reminders';
import Documents from './pages/Documents';
import EmailTemplates from './pages/EmailTemplates';
import LetterTemplates from './pages/LetterTemplates';

// Importer la page GmailComplete
import GmailComplete from './pages/GmailComplete';

const App = () => {
    const { isAuthenticated, loading } = useAuth();

    // Route protégée
    const ProtectedRoute = ({ children }) => {
        if (loading) {
            return <div className="flex h-screen items-center justify-center">Chargement...</div>;
        }

        if (!isAuthenticated) {
            return <Navigate to="/login" />;
        }

        return children;
    };

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Ajout de la route Gmail Complete en dehors des routes protégées */}
            <Route path="/gmail-complete" element={<GmailComplete />} />

            <Route path="/" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Dashboard />} />
                <Route path="statistics" element={<Statistics />} />
                <Route path="companies" element={<Companies />} />
                <Route path="companies/:id" element={<CompanyDetail />} />
                <Route path="offers" element={<Offers />} />
                <Route path="offers/:id" element={<OfferDetail />} />
                <Route path="applications" element={<Applications />} />
                <Route path="applications/:id" element={<ApplicationDetail />} />

                {/* Nouvelles routes pour l'itération 3 */}
                <Route path="reminders" element={<Reminders />} />
                <Route path="documents" element={<Documents />} />
                <Route path="email-templates" element={<EmailTemplates />} />
                <Route path="letter-templates" element={<LetterTemplates />} />

                <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default App;