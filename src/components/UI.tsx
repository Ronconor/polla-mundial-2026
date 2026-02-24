import React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    ...props
}: ButtonProps) {
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md',
        secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
        outline: 'border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700',
        ghost: 'bg-transparent hover:bg-slate-100 text-slate-600',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    }

    return (
        <button
            className={cn(
                'btn flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:scale-100',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {children}
        </button>
    )
}

export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <div className={cn('card', className)}>
            {children}
        </div>
    )
}

export function Input({ label, error, icon, ...props }: { label?: string, error?: string, icon?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="space-y-1.5 w-full">
            {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </div>
                )}
                <input
                    className={cn(
                        "w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all",
                        icon && "pl-10",
                        error && "border-red-500 focus:ring-red-500",
                        props.className
                    )}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    )
}
