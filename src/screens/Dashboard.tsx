import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Trophy, LayoutDashboard, Users, Zap, TrendingUp, User, LogOut, Shield, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Card, Button } from '../components/UI'
import AdminCommunities from './Admin/AdminCommunities'
import CommunityParticipants from './Admin/CommunityParticipants'
import AdminMatches from './Admin/AdminMatches'
import UserPredictions from './Matches/UserPredictions'
import RankingScreen from './Ranking/RankingScreen'
import ProfileScreen from './Common/ProfileScreen'
import UserCommunities from './Communities/UserCommunities'

export default function Dashboard() {
    const { profile, isAdmin, user } = useAuth()
    const location = useLocation()
    const [totalPoints, setTotalPoints] = useState<number>(0)

    useEffect(() => {
        if (user) {
            fetchTotalPoints()
        }
    }, [user])

    const fetchTotalPoints = async () => {
        const { data } = await supabase
            .from('community_members')
            .select('points')
            .eq('profile_id', user?.id)

        if (data) {
            const total = data.reduce((acc, curr) => acc + (curr.points || 0), 0)
            setTotalPoints(total)
        }
    }

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/dashboard/communities', label: 'Módulos', icon: Users },
        { path: '/dashboard/matches', label: 'Partidos', icon: Zap },
        { path: '/dashboard/ranking', label: 'Ranking', icon: TrendingUp },
        { path: '/dashboard/profile', label: 'Perfil', icon: User },
    ]

    const adminNavItems = [
        { path: '/dashboard/admin/communities', label: 'Admin Módulos', icon: Shield },
        { path: '/dashboard/admin/matches', label: 'Admin Partidos', icon: Trophy },
    ]

    const handleSignOut = async () => {
        await supabase.auth.signOut()
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar for Desktop / Bottom Nav for Mobile */}
            <nav className="md:w-64 bg-primary-900 text-white flex flex-col shrink-0">
                <div className="p-6 hidden md:flex items-center gap-3 border-b border-primary-800">
                    <Trophy className="w-8 h-8 text-accent-gold" />
                    <span className="text-xl font-bold tracking-tight">POLLA 2026</span>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <div className="px-4 space-y-1">
                        <p className="px-4 py-2 text-xs font-bold text-primary-400 uppercase tracking-widest">General</p>
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.path
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary-800 text-white'
                                        : 'text-primary-300 hover:bg-primary-800/50 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        })}

                        {isAdmin && (
                            <>
                                <p className="px-4 py-2 mt-6 text-xs font-bold text-primary-400 uppercase tracking-widest">Administración</p>
                                {adminNavItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = location.pathname.startsWith(item.path)
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                                ? 'bg-primary-800 text-white'
                                                : 'text-primary-300 hover:bg-primary-800/50 hover:text-white'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{item.label}</span>
                                        </Link>
                                    )
                                })}
                            </>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-primary-800 mt-auto">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-2 md:hidden">
                        <Trophy className="w-6 h-6 text-accent-gold" />
                        <span className="font-bold text-primary-900">POLLA 2026</span>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800 hidden md:block">
                        Hola, {profile?.nickname} 👋
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-slate-500">Mi Puntaje</p>
                            <p className="font-bold text-primary-600">{totalPoints} pts</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border-2 border-white shadow-sm capitalize">
                            {profile?.nickname?.[0] || 'U'}
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    <Routes>
                        <Route path="/" element={<Summary />} />
                        <Route path="communities" element={<UserCommunities />} />
                        <Route path="matches" element={<UserPredictions />} />
                        <Route path="ranking" element={<RankingScreen />} />
                        <Route path="profile" element={<ProfileScreen />} />

                        {/* Admin Routes */}
                        <Route path="admin/communities" element={<AdminCommunities />} />
                        <Route path="admin/communities/:id/members" element={<CommunityParticipants />} />
                        <Route path="admin/matches" element={<AdminMatches />} />
                    </Routes>
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-20">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400'
                                }`}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="text-[10px] font-medium mt-1">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
            <div className="md:hidden h-20" /> {/* Spacer for bottom nav */}
        </div>
    )
}

function Summary() {
    const { user, profile } = useAuth()
    const [stats, setStats] = useState({ matches: 0, predictions: 0, communities: 0 })

    useEffect(() => {
        if (user) fetchStats()
    }, [user])

    const fetchStats = async () => {
        const { count: mCount } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'scheduled')
        const { count: pCount } = await supabase.from('predictions').select('*', { count: 'exact', head: true }).eq('profile_id', user?.id)
        const { count: cCount } = await supabase.from('community_members').select('*', { count: 'exact', head: true }).eq('profile_id', user?.id)

        setStats({
            matches: mCount || 0,
            predictions: pCount || 0,
            communities: cCount || 0
        })
    }

    if (!profile) return <div className="py-12 text-center text-slate-400">Cargando perfil...</div>

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-gradient-to-br from-primary-600 to-primary-700 text-white">
                    <p className="text-primary-100 text-sm font-medium">Partidos Próximos</p>
                    <p className="text-3xl font-bold mt-2">{stats.matches}</p>
                </div>
                <div className="card">
                    <p className="text-slate-500 text-sm font-medium">Predicciones Realizadas</p>
                    <p className="text-3xl font-bold mt-2">{stats.predictions}</p>
                </div>
                <div className="card">
                    <p className="text-slate-500 text-sm font-medium">Módulos Activos</p>
                    <p className="text-3xl font-bold mt-2">{stats.communities}</p>
                </div>
            </div>

            {stats.communities === 0 ? (
                <div className="card min-h-[300px] flex flex-col items-center justify-center text-center space-y-4">
                    <Users className="w-16 h-16 text-slate-200" />
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">No tienes módulos todavía</h3>
                        <p className="text-slate-500 mt-2">Contacta a un administrador para que te agregue a uno.</p>
                    </div>
                    <Link to="communities">
                        <Button className="gap-2">
                            Ir a mis módulos
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="card flex items-center justify-center py-12 border-dashed border-2">
                    <div className="text-center">
                        <Trophy className="w-12 h-12 text-accent-gold mx-auto mb-4" />
                        <h3 className="text-lg font-bold">¡Bienvenido al Dashboard!</h3>
                        <p className="text-slate-500">Comienza a predecir resultados en la sección de Partidos.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
