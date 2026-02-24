import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, Profile } from '../../lib/supabase'
import { Card, Button, Input } from '../../components/UI'
import { Search, UserPlus, Trash2, ArrowLeft, Shield, Gavel, X } from 'lucide-react'

export default function CommunityParticipants() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [community, setCommunity] = useState<any>(null)
    const [members, setMembers] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [punishingUser, setPunishingUser] = useState<any>(null)
    const [punishPoints, setPunishPoints] = useState(0)
    const [punishReason, setPunishReason] = useState('')

    useEffect(() => {
        if (id) {
            fetchData()
        }
    }, [id])

    const fetchData = async () => {
        setLoading(true)
        // Fetch community info
        const { data: comm } = await supabase.from('communities').select('*').eq('id', id).single()
        setCommunity(comm)

        // Fetch members with profile details
        const { data: membersData } = await supabase
            .from('community_members')
            .select('*, profiles(*)')
            .eq('community_id', id)

        if (membersData) setMembers(membersData)
        setLoading(false)
    }

    const handleSearch = async (query: string) => {
        setSearchQuery(query)
        if (query.length < 3) {
            setSearchResults([])
            return
        }

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .ilike('nickname', `%${query}%`)
            .limit(5)

        if (data) setSearchResults(data)
    }

    const addMember = async (profileId: string) => {
        const { error } = await supabase
            .from('community_members')
            .insert([{ community_id: id, profile_id: profileId, points: 0 }])

        if (!error) {
            fetchData()
            setSearchQuery('')
            setSearchResults([])
        }
    }

    const removeMember = async (memberId: string) => {
        const { error } = await supabase
            .from('community_members')
            .delete()
            .eq('id', memberId)

        if (!error) fetchData()
    }

    const handleApplySanction = async () => {
        if (!punishingUser || punishPoints === 0) return

        // 1. Create sanction record
        await supabase.from('sanctions').insert([{
            profile_id: punishingUser.profiles.id,
            community_id: id,
            points: punishPoints,
            reason: punishReason
        }])

        // 2. Deduct points from member
        const newPoints = Math.max(0, punishingUser.points - punishPoints)
        await supabase
            .from('community_members')
            .update({ points: newPoints })
            .eq('id', punishingUser.id)

        setPunishingUser(null)
        setPunishPoints(0)
        setPunishReason('')
        fetchData()
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ml-2">
                <ArrowLeft className="w-5 h-5" />
                Volver
            </Button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{community?.name}</h1>
                    <p className="text-slate-500">Gestión de Participantes</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por nickname para agregar..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />

                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden">
                            {searchResults.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => addMember(p.id)}
                                    disabled={members.some(m => m.profiles.id === p.id)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs uppercase">
                                            {p.nickname[0]}
                                        </div>
                                        <span className="font-medium text-slate-700">{p.nickname}</span>
                                    </div>
                                    <UserPlus className="w-4 h-4 text-primary-600" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Card className="overflow-hidden p-0 border-slate-200">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Participante</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Puntos</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {members.map(member => (
                            <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold capitalize">
                                            {member.profiles.nickname[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{member.profiles.nickname}</p>
                                            <p className="text-xs text-slate-500">{member.profiles.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono font-bold text-primary-600">{member.points} pts</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-slate-400 hover:text-amber-600"
                                            onClick={() => setPunishingUser(member)}
                                        >
                                            <Gavel className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-slate-400 hover:text-red-500"
                                            onClick={() => removeMember(member.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {members.length === 0 && !loading && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                                    No hay participantes en este módulo. ¡Agrega uno arriba!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            {/* Sanction Modal Overlay */}
            {punishingUser && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md shadow-2xl scale-in-center">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Gavel className="w-6 h-6 text-amber-500" />
                                Aplicar Sanción
                            </h3>
                            <button
                                onClick={() => setPunishingUser(null)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                <p className="text-sm text-amber-800">
                                    Estás sancionando a <span className="font-bold">{punishingUser.profiles.nickname}</span>.
                                    Los puntos se restarán de su total en este módulo.
                                </p>
                            </div>

                            <Input
                                label="Puntos a Restar"
                                type="number"
                                placeholder="Ej: 5"
                                value={punishPoints}
                                onChange={e => setPunishPoints(parseInt(e.target.value) || 0)}
                            />

                            <Input
                                label="Motivo"
                                placeholder="Ej: Comportamiento antideportivo"
                                value={punishReason}
                                onChange={e => setPunishReason(e.target.value)}
                            />

                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="primary"
                                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                                    onClick={handleApplySanction}
                                >
                                    Sancionar
                                </Button>
                                <Button variant="ghost" className="flex-1" onClick={() => setPunishingUser(null)}>
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
