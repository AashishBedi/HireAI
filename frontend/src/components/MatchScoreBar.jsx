export default function MatchScoreBar({ score }) {
    const pct = Math.min(Math.max((score ?? 0) * 100, 0), 100)

    const barColor =
        pct >= 70 ? 'from-green-400 to-emerald-500' :
            pct >= 40 ? 'from-amber-400 to-orange-400' :
                'from-red-400 to-rose-500'

    const textColor =
        pct >= 70 ? 'text-green-700' :
            pct >= 40 ? 'text-amber-600' :
                'text-red-600'

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500 font-medium">AI Match</span>
                <span className={`text-xs font-bold ${textColor}`}>{pct.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    )
}