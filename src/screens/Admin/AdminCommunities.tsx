import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, Community, Profile } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Card, Button, Input } from '../../components/UI'
import { Plus, Users, Search, Trash2, Shield, UserPlus } from 'lucide-react'

export default function AdminCommunities() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [communities, setCommunities] = useState<Community[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [newName, setNewName] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCommunities()
    }, [])

    const fetchCommunities = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('communities')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) setCommunities(data)
        setLoading(false)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim() || !user) return

        const { data, error } = await supabase
            .from('communities')
            .insert([{ name: newName, admin_id: user.id }])
            .select()

        if (!error && data) {
            setCommunities([data[0], ...communities])
            setNewName('')
            setIsCreating(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Módulos (Comunidades)</h1>
                    <p className="text-slate-500">Gestiona los grupos de la polla mundialista</p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="gap-2">
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Nuevo Módulo</span>
                </Button>
            </div>

            {isCreating && (
                <Card className="border-primary-200 bg-primary-50/30">
                    <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
                        <Input
                            label="Nombre del Módulo"
                            placeholder="Ej: Amigos del Trabajo"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            required
                        />
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button type="submit" className="flex-1">Crear</Button>
                            <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
                        </div>
                    </form>
                </Card>
            )}

            {loading ? (
                <div className="text-center py-12">Cargando módulos...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communities.map(community => (
                        <CommunityCard key={community.id} community={community} onRefresh={fetchCommunities} navigate={navigate} />
                    ))}
                    {communities.length === 0 && !isCreating && (
                        <div className="col-span-full py-12 text-center text-slate-400">
                            No hay módulos creados todavía.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function CommunityCard({ community, onRefresh, navigate }: { community: Community, onRefresh: () => void, navigate: any }) {
    const [membersCount, setMembersCount] = useState(0)

    useEffect(() => {
        supabase
            .from('community_members')
            .select('id', { count: 'exact', head: true })
            .eq('community_id', community.id)
            .then(({ count }) => setMembersCount(count || 0))
    }, [community.id])

    return (
        <Card className="hover:border-primary-200 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-primary-100 p-3 rounded-xl text-primary-600">
                    <Shield className="w-6 h-6" />
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                {community.name}
            </h3>

            <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm">
                <Users className="w-4 h-4" />
                <span>{membersCount} participantes</span>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50 flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => navigate(`/dashboard/admin/communities/${community.id}/members`)}
                >
                    <UserPlus className="w-4 h-4" />
                    Miembros
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/dashboard/admin/communities/${community.id}/members`)}
                >
                    Gestionar
                </Button>
            </div>
        </Card>
    )
}
