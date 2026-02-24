import React, { useState, useEffect } from 'react'
import { supabase, Match } from '../../lib/supabase'
import { Card, Button, Input } from '../../components/UI'
import { Plus, Calendar, Trophy, CheckCircle2, Clock, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AdminMatches() {
    const [matches, setMatches] = useState<Match[]>([])
    const [communities, setCommunities] = useState<any[]>([])
    const [isAdding, setIsAdding] = useState(false)
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({
        local_team: '',
        visitor_team: '',
        match_date: '',
        phase: 'Grupos',
        community_id: '',
    })

    useEffect(() => {
        fetchMatches()
        fetchCommunities()
    }, [])

    const fetchCommunities = async () => {
        const { data } = await supabase.from('communities').select('id, name')
        if (data) {
            setCommunities(data)
            if (data.length > 0) setForm(f => ({ ...f, community_id: data[0].id }))
        }
    }

    const fetchMatches = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('matches')
            .select('*')
            .order('match_date', { ascending: true })
        if (data) setMatches(data)
        setLoading(false)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const { error } = await supabase.from('matches').insert([
            { ...form, status: 'scheduled' }
        ])
        if (!error) {
            setIsAdding(false)
            fetchMatches()
            setForm({ ...form, local_team: '', visitor_team: '', match_date: '' })
        }
    }

    const updateResult = async (matchId: string, local: number, visitor: number) => {
        const { error } = await supabase
            .from('matches')
            .update({ local_score: local, visitor_score: visitor, status: 'finished' })
            .eq('id', matchId)

        if (!error) {
            // Trigger point calculation (ideally this should be a DB trigger or Edge Function)
            // For now, we'll assume the DB function calculate_points is used in a view or during fetch
            fetchMatches()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Partidos</h1>
                    <p className="text-slate-500">Programa encuentros y registra resultados oficiales</p>
                </div>
                <Button onClick={() => setIsAdding(true)} className="gap-2">
                    <Plus className="w-5 h-5" />
                    Nuevo Partido
                </Button>
            </div>

            {isAdding && (
                <Card className="bg-slate-50 border-slate-200">
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <Input
                            label="Local"
                            placeholder="Ej: Argentina"
                            value={form.local_team}
                            onChange={e => setForm({ ...form, local_team: e.target.value })}
                            required
                        />
                        <Input
                            label="Visitante"
                            placeholder="Ej: España"
                            value={form.visitor_team}
                            onChange={e => setForm({ ...form, visitor_team: e.target.value })}
                            required
                        />
                        <Input
                            label="Fecha y Hora"
                            type="datetime-local"
                            value={form.match_date}
                            onChange={e => setForm({ ...form, match_date: e.target.value })}
                            required
                        />
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">Fase</label>
                            <select
                                className="w-full h-10 border rounded px-3"
                                value={form.phase}
                                onChange={e => setForm({ ...form, phase: e.target.value })}
                            >
                                {['Grupos', 'Octavos', 'Cuartos', 'Semis', 'Final'].map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">Módulo</label>
                            <select
                                className="w-full h-10 border rounded px-3 bg-white"
                                value={form.community_id}
                                onChange={e => setForm({ ...form, community_id: e.target.value })}
                                required
                            >
                                <option value="" disabled>Seleccionar Módulo...</option>
                                {communities.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1" disabled={!form.community_id}>Guardar</Button>
                            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>X</Button>
                        </div>
                    </form>
                </Card>
            )}

            {loading ? (
                <div className="text-center py-12">Cargando partidos...</div>
            ) : (
                <div className="space-y-4">
                    {['Grupos', 'Octavos', 'Cuartos', 'Semis', 'Final'].map(phase => {
                        const phaseMatches = matches.filter(m => m.phase === phase)
                        if (phaseMatches.length === 0) return null
                        return (
                            <div key={phase} className="space-y-3">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">{phase}</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {phaseMatches.map(match => (
                                        <MatchAdminCard key={match.id} match={match} onUpdateResult={updateResult} />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

function MatchAdminCard({ match, onUpdateResult }: { match: Match, onUpdateResult: (id: string, l: number, v: number) => void }) {
    const [scores, setScores] = useState({
        local: match.local_score ?? 0,
        visitor: match.visitor_score ?? 0
    })

    return (
        <Card className="flex items-center justify-between gap-6">
            <div className="flex-1 flex items-center justify-between">
                <div className="text-right flex-1">
                    <p className="font-bold text-slate-800">{match.local_team}</p>
                </div>
                <div className="px-4 flex items-center gap-2">
                    {match.status === 'finished' ? (
                        <div className="flex gap-2 font-mono text-2xl font-black bg-slate-100 px-3 py-1 rounded-lg">
                            <span>{match.local_score}</span>
                            <span className="text-slate-300">-</span>
                            <span>{match.visitor_score}</span>
                        </div>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <input
                                type="number"
                                className="w-12 h-10 border rounded text-center font-bold"
                                value={scores.local}
                                onChange={e => setScores({ ...scores, local: parseInt(e.target.value) })}
                            />
                            <span className="text-slate-300">-</span>
                            <input
                                type="number"
                                className="w-12 h-10 border rounded text-center font-bold"
                                value={scores.visitor}
                                onChange={e => setScores({ ...scores, visitor: parseInt(e.target.value) })}
                            />
                        </div>
                    )}
                </div>
                <div className="text-left flex-1">
                    <p className="font-bold text-slate-800">{match.visitor_team}</p>
                </div>
            </div>

            <div className="shrink-0 border-l pl-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(match.match_date), "d MMM, HH:mm", { locale: es })}
                </div>

                {match.status === 'scheduled' ? (
                    <Button size="sm" onClick={() => onUpdateResult(match.id, scores.local, scores.visitor)}>
                        Finalizar
                    </Button>
                ) : (
                    <div className="flex items-center gap-1 text-green-500 text-xs font-bold uppercase">
                        <CheckCircle2 className="w-4 h-4" />
                        Finalizado
                    </div>
                )}
            </div>
        </Card>
    )
}
