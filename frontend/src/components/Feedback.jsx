export function LoadingSpinner({ size = 'md', text }) {
    const sizeClass = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className={`${sizeClass} border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
            {text && <p className="text-sm text-slate-500 font-medium">{text}</p>}
        </div>
    )
}

export function ErrorMessage({ message, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">⚠️</div>
            <p className="text-sm text-red-600 font-medium text-center max-w-sm">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                >
                    Try Again
                </button>
            )}
        </div>
    )
}

export function EmptyState({ icon = '📭', title, description }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <span className="text-5xl">{icon}</span>
            <h3 className="font-semibold text-slate-700 text-lg">{title}</h3>
            {description && <p className="text-sm text-slate-400 max-w-sm">{description}</p>}
        </div>
    )
}