import React, { useState, useEffect } from 'react'
import { supabase, Match } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Card, Button } from '../../components/UI'
import { Trophy, Clock, CheckCheck, Save, AlertTriangle } from 'lucide-react'
import { format, isBefore, subMinutes } from 'date-fns'
import { es } from 'date-fns/locale'

export default function UserPredictions() {
    const { user } = useAuth()
    const [matches, setMatches] = useState<any[]>([])
    const [predictions, setPredictions] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (user) fetchMatchesAndPredictions()
    }, [user])

    const fetchMatchesAndPredictions = async () => {
        setLoading(true)
        // Fetch all matches
        const { data: matchesData } = await supabase
            .from('matches')
            .select('*')
            .order('match_date', { ascending: true })

        // Fetch user predictions
        const { data: predsData } = await supabase
            .from('predictions')
            .select('*')
            .eq('profile_id', user?.id)

        if (matchesData) {
            const predsMap = (predsData || []).reduce((acc, curr) => ({
                ...acc,
                [curr.match_id]: curr
            }), {})

            setMatches(matchesData)
            setPredictions(predsMap)
        }
        setLoading(false)
    }

    const handleScoreChange = (matchId: string, team: 'local' | 'visitor', value: string) => {
        const val = parseInt(value) || 0
        setPredictions(prev => ({
            ...prev,
            [matchId]: {
                ...(prev[matchId] || { match_id: matchId }),
                [`${team}_score`]: val
            }
        }))
    }

    const savePredictions = async () => {
        setSaving(true)
        const toUpsert = Object.values(predictions)
            .filter(p => p.local_score !== undefined && p.visitor_score !== undefined)
            .map(p => {
                const match = matches.find(m => m.id === p.match_id)
                return {
                    ...p,
                    profile_id: user?.id,
                    community_id: match?.community_id
                }
            })

        if (toUpsert.length === 0) {
            setSaving(false)
            return
        }

        const { error } = await supabase.from('predictions').upsert(toUpsert)
        if (!error) {
            await fetchMatchesAndPredictions()
        }
        setSaving(false)
    }

    const finalizePrediction = async (matchId: string) => {
        const pred = predictions[matchId]
        if (!pred) return

        const { error } = await supabase
            .from('predictions')
            .update({ is_finalized: true })
            .eq('id', pred.id)

        if (!error) fetchMatchesAndPredictions()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-20 z-10">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mis Predicciones</h1>
                    <p className="text-slate-500">Ingresa tus marcadores antes del inicio de los partidos</p>
                </div>
                <Button onClick={savePredictions} isLoading={saving} className="gap-2">
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                </Button>
            </div>

            <div className="space-y-8">
                {['Grupos', 'Octavos', 'Cuartos', 'Semis', 'Final'].map(phase => {
                    const phaseMatches = matches.filter(m => m.phase === phase)
                    if (phaseMatches.length === 0) return null

                    return (
                        <div key={phase} className="space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{phase}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {phaseMatches.map(match => {
                                    const prediction = predictions[match.id]
                                    const isLocked = prediction?.is_finalized ||
                                        match.status === 'finished' ||
                                        isBefore(new Date(match.match_date), new Date())

                                    return (
                                        <Card key={match.id} className={cn(
                                            "transition-all",
                                            isLocked ? "bg-slate-50 opacity-90" : "hover:border-primary-300 ring-offset-4"
                                        )}>
                                            <div className="flex flex-col gap-4">
                                                <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                                                    <span className="bg-slate-100 px-2 py-1 rounded uppercase tracking-wider">{match.phase}</span>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {format(new Date(match.match_date), "d MMM, HH:mm", { locale: es })}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1 text-center space-y-2">
                                                        <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto flex items-center justify-center font-bold text-slate-400">
                                                            {match.local_team[0]}
                                                        </div>
                                                        <p className="font-bold text-slate-800 text-sm">{match.local_team}</p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            disabled={isLocked}
                                                            value={prediction?.local_score ?? ''}
                                                            onChange={e => handleScoreChange(match.id, 'local', e.target.value)}
                                                            className="w-14 h-14 text-2xl font-black text-center border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none disabled:bg-white disabled:border-transparent transition-all"
                                                        />
                                                        <span className="text-slate-300 font-bold">VS</span>
                                                        <input
                                                            type="number"
                                                            disabled={isLocked}
                                                            value={prediction?.visitor_score ?? ''}
                                                            onChange={e => handleScoreChange(match.id, 'visitor', e.target.value)}
                                                            className="w-14 h-14 text-2xl font-black text-center border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none disabled:bg-white disabled:border-transparent transition-all"
                                                        />
                                                    </div>

                                                    <div className="flex-1 text-center space-y-2">
                                                        <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto flex items-center justify-center font-bold text-slate-400">
                                                            {match.visitor_team[0]}
                                                        </div>
                                                        <p className="font-bold text-slate-800 text-sm">{match.visitor_team}</p>
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    {isLocked ? (
                                                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 bg-slate-200/50 py-2 rounded-lg">
                                                            {match.status === 'finished' ? (
                                                                <>
                                                                    <Trophy className="w-4 h-4 text-accent-gold" />
                                                                    Resultado: {match.local_score} - {match.visitor_score}
                                                                    <span className="ml-2 text-primary-600">({prediction?.points_awarded || 0} pts)</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCheck className="w-4 h-4 text-primary-500" />
                                                                    PREDICCIÓN CERRADA
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full text-xs font-bold border-primary-100 text-primary-600 hover:bg-primary-50"
                                                            onClick={() => finalizePrediction(match.id)}
                                                        >
                                                            Finalizar Predicción
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
