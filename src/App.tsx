import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginScreen from './screens/Auth/LoginScreen'
import RegisterScreen from './screens/Auth/RegisterScreen'
import Dashboard from './screens/Dashboard'

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
    return user ? <>{children}</> : <Navigate to="/login" />
}

function App() {
    React.useEffect(() => {
        // Force redirect to root if page is refreshed, as requested
        const navEntries = window.performance.getEntriesByType('navigation');
        const isReload = navEntries.length > 0 && (navEntries[0] as any).type === 'reload';

        if (isReload && window.location.pathname !== '/' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.replace('/');
        }
    }, [])

    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginScreen />} />
                    <Route path="/register" element={<RegisterScreen />} />
                    <Route
                        path="/dashboard/*"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
