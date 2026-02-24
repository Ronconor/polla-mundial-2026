import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Card, Button, Input } from '../../components/UI'
import { User, Mail, Phone, MapPin, Shield, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ProfileScreen() {
    const { profile } = useAuth()
    const [formData, setFormData] = useState({
        phone: profile?.phone || '',
        location: profile?.location || '',
    })

    React.useEffect(() => {
        if (profile) {
            setFormData({
                phone: profile.phone || '',
                location: profile.location || '',
            })
        }
    }, [profile])

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-slate-300" />
                <div>
                    <h3 className="text-lg font-bold text-slate-800">No se encontró tu perfil</h3>
                    <p className="text-slate-500">Intenta cerrar sesión y volver a entrar.</p>
                </div>
            </div>
        )
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const { error } = await supabase
            .from('profiles')
            .update(formData)
            .eq('id', profile?.id)

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })
        }
        setLoading(false)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Configuración de Perfil</h1>
                <p className="text-slate-500">Administra tu información personal</p>
            </div>

            <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-primary-600" />

                <div className="flex flex-col items-center py-8 border-b border-slate-100">
                    <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-4xl font-black text-primary-600 border-4 border-white shadow-lg mb-4 capitalize">
                        {profile?.nickname?.[0]}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{profile?.nickname}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${profile?.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                            {profile?.role === 'admin' ? 'Administrador' : 'Participante'}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="p-6 space-y-6">
                    {message && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <p className="text-sm font-medium">{message.text}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 opacity-60">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nickname</label>
                            <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
                                <User className="w-4 h-4" />
                                <span className="font-medium text-slate-600">{profile?.nickname}</span>
                            </div>
                            <p className="text-[10px] text-slate-400">El nickname no puede ser editado</p>
                        </div>

                        <div className="space-y-1.5 opacity-60">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Correo Electrónico</label>
                            <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
                                <Mail className="w-4 h-4" />
                                <span className="font-medium text-slate-600 text-sm truncate">{profile?.email}</span>
                            </div>
                        </div>

                        <Input
                            label="Teléfono"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            icon={<Phone className="w-4 h-4" />}
                        />

                        <Input
                            label="Ubicación"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            icon={<MapPin className="w-4 h-4" />}
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" isLoading={loading} className="w-full md:w-auto px-12">
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </Card>

            {profile?.role === 'admin' && (
                <Card className="border-purple-100 bg-purple-50/20 p-6 flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-purple-100 text-purple-600">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Acceso de Administrador</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Tienes permisos para gestionar módulos, partidos y asignar sanciones a los participantes.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    )
}
