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
