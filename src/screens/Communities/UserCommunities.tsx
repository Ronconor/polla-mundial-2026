import React, { useState, useEffect } from 'react'
import { supabase, Community } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Card, Button } from '../../components/UI'
import { Users, Shield, ArrowRight, Trophy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function UserCommunities() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [communities, setCommunities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) fetchJoinedCommunities()
    }, [user])

    const fetchJoinedCommunities = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('community_members')
            .select('*, communities(*)')
            .eq('profile_id', user?.id)

        if (data) setCommunities(data)
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Mis Módulos</h1>
                <p className="text-slate-500">Comunidades donde estás participando</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-400 font-medium">Cargando tus comunidades...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communities.map(item => (
                        <Card key={item.id} className="hover:border-primary-200 transition-all group overflow-hidden">
                            <div className="h-2 bg-primary-600 absolute top-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="p-2">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-primary-50 p-3 rounded-xl text-primary-600">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mi Puntaje</p>
                                        <p className="text-xl font-black text-primary-600">{item.points} pts</p>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors truncate">
                                    {item.communities.name}
                                </h3>

                                <div className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                    <Trophy className="w-3.5 h-3.5" />
                                    <span>Mundial 2026</span>
                                </div>

                                <div className="mt-6 flex gap-2">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="flex-1 gap-2"
                                        onClick={() => navigate('/dashboard/ranking')}
                                    >
                                        Ver Ranking
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {communities.length === 0 && (
                        <div className="col-span-full py-16 text-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">No estás en ningún módulo</h3>
                            <p className="text-slate-500 mt-2">Pide a un administrador que te invite usando tu nickname.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
