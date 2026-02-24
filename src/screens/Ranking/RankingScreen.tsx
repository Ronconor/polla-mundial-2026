import React, { useState, useEffect } from 'react'
import { supabase, Profile } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Card, Button } from '../../components/UI'
import { Trophy, Medal, Search, TrendingUp, Users } from 'lucide-react'

export default function RankingScreen() {
    const { user } = useAuth()
    const [communities, setCommunities] = useState<any[]>([])
    const [selectedCommId, setSelectedCommId] = useState<string | null>(null)
    const [rankings, setRankings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchUserCommunities()
    }, [])

    useEffect(() => {
        if (selectedCommId) {
            fetchRankings(selectedCommId)
        }
    }, [selectedCommId])

    const fetchUserCommunities = async () => {
        // Fetch communities where the user is a member
        const { data } = await supabase
            .from('community_members')
            .select('community_id, communities(id, name)')
            .eq('profile_id', user?.id)

        if (data && data.length > 0) {
            const comms = data.map((d: any) => d.communities)
            setCommunities(comms)
            setSelectedCommId(comms[0].id)
        } else {
            setLoading(false)
        }
    }

    const fetchRankings = async (commId: string) => {
        setLoading(true)
        const { data } = await supabase
            .from('community_members')
            .select('*, profiles(*)')
            .eq('community_id', commId)
            .order('points', { ascending: false })

        if (data) setRankings(data)
        setLoading(false)
    }

    const getMedalColor = (index: number) => {
        if (index === 0) return 'text-accent-gold'
        if (index === 1) return 'text-slate-400' // Silver
        if (index === 2) return 'text-amber-700' // Bronze
        return 'text-slate-200'
    }

    const getBgColor = (index: number) => {
        if (index === 0) return 'bg-yellow-50 border-yellow-200'
        if (index === 1) return 'bg-slate-50 border-slate-200'
        if (index === 2) return 'bg-orange-50/50 border-orange-200'
        return 'bg-white border-slate-100'
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tabla de Posiciones</h1>
                    <p className="text-slate-500">¿Quién va liderando el mundial?</p>
                </div>

                {communities.length > 0 && (
                    <select
                        value={selectedCommId || ''}
                        onChange={(e) => setSelectedCommId(e.target.value)}
                        className="w-full md:w-auto px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-medium shadow-sm translate-y-0 active:translate-y-0.5 transition-all"
                    >
                        {communities.map((comm) => (
                            <option key={comm.id} value={comm.id}>{comm.name}</option>
                        ))}
                    </select>
                )}
            </div>

            {loading ? (
                <div className="text-center py-12">Calculando puntajes...</div>
            ) : communities.length === 0 ? (
                <Card className="text-center py-16 space-y-4">
                    <TrendingUp className="w-16 h-16 text-slate-200 mx-auto" />
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Aún no estás en ningún módulo</h2>
                        <p className="text-slate-500">Únete a una comunidad para ver el ranking.</p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {/* Top 3 Spotlight */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {rankings.slice(0, 3).map((member, index) => (
                            <Card key={member.id} className={`${getBgColor(index)} flex flex-col items-center p-6 border-2 relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Trophy className="w-24 h-24" />
                                </div>
                                <div className={`mb-4 relative`}>
                                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-black shadow-inner border-2 border-white capitalize">
                                        {member.profiles.nickname[0]}
                                    </div>
                                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md ${getMedalColor(index)}`}>
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                    </div>
                                </div>
                                <h3 className="font-black text-slate-800 text-lg truncate w-full text-center">
                                    {member.profiles.nickname}
                                </h3>
                                <p className="text-3xl font-black text-primary-600 mt-2">
                                    {member.points} <span className="text-sm font-medium text-slate-400">PTS</span>
                                </p>
                            </Card>
                        ))}
                    </div>

                    {/* Full List */}
                    <Card className="p-0 overflow-hidden border-slate-200 shadow-xl">
                        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span>Posición / Usuario</span>
                            <span>Puntos Totales</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {rankings.map((member, index) => (
                                <div
                                    key={member.id}
                                    className={`px-6 py-4 flex items-center justify-between transition-colors ${member.profiles.id === user?.id ? 'bg-primary-50/30' : 'hover:bg-slate-50/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 font-mono font-bold text-lg ${index < 3 ? 'text-primary-600' : 'text-slate-300'}`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-600 font-bold capitalize shadow-sm">
                                                {member.profiles.nickname[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 flex items-center gap-2">
                                                    {member.profiles.nickname}
                                                    {member.profiles.id === user?.id && (
                                                        <span className="text-[10px] bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full uppercase">Tú</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-slate-400">@{member.profiles.nickname.toLowerCase()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-xl text-slate-900 leading-none">{member.points}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Puntos</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
