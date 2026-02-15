import { useEffect, useState } from 'react'

interface ChallengeCardProps {
  id?: string
  title: string        // <--- NEW PROP
  stakeAmount: number
  deadline: number
  onJoin: () => void
  status: string
}

const ChallengeCard = ({ title, stakeAmount, deadline, onJoin, status }: ChallengeCardProps) => {
  const [timeLeft, setTimeLeft] = useState('')
  const [progress, setProgress] = useState(0)

  // Real-time countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      const diff = deadline - now

      if (diff <= 0) {
        setTimeLeft('EXPIRED')
        setProgress(100)
      } else {
        const days = Math.floor(diff / 86400)
        const hours = Math.floor((diff % 86400) / 3600)
        
        if (days > 0) setTimeLeft(`${days}d ${hours}h left`)
        else setTimeLeft(`${hours}h ${Math.floor((diff % 3600) / 60)}m left`)

        // Calculate progress bar (assuming 7 day standard for visual)
        const totalDuration = 7 * 86400 
        const elapsed = totalDuration - diff
        setProgress(Math.min(100, (elapsed / totalDuration) * 100))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [deadline])

  return (
    <div className="bg-cyber-dark/40 border border-gray-800 hover:border-neon-green/50 rounded-xl p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] hover:-translate-y-1">
      
      {/* Status Badge */}
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
          status === 'MANAGE' ? 'bg-neon-blue/20 text-neon-blue border-neon-blue' : 
          timeLeft === 'EXPIRED' ? 'bg-red-500/20 text-red-500 border-red-500' :
          'bg-neon-green/20 text-neon-green border-neon-green'
        }`}>
          {timeLeft === 'EXPIRED' ? 'CLOSED' : 'ACTIVE'}
        </span>
        <span className="text-gray-500 text-xs font-mono">#{String(deadline).slice(-4)}</span>
      </div>

      {/* DYNAMIC TITLE */}
      <h3 className="text-xl font-cyber font-bold text-white mb-2 leading-tight group-hover:text-neon-green transition-colors">
        {title || "Untitled Challenge"} 
      </h3>

      {/* Stake Amount */}
      <div className="bg-black/40 rounded-lg p-4 mb-4 border border-gray-800 flex justify-between items-center">
        <span className="text-gray-400 text-xs font-mono uppercase">Entry Stake</span>
        <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">{stakeAmount}</span>
            <span className="text-neon-green font-bold text-xs bg-neon-green/10 px-1 rounded">ALGO</span>
        </div>
      </div>

      {/* Time Remaining Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2 font-mono">
            <span className="text-gray-500">TIME REMAINING</span>
            <span className={timeLeft === 'EXPIRED' ? 'text-red-500' : 'text-neon-blue'}>{timeLeft}</span>
        </div>
        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
            <div 
                className={`h-full ${timeLeft === 'EXPIRED' ? 'bg-red-500' : 'bg-neon-blue'} shadow-[0_0_10px_currentColor]`} 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={onJoin}
        disabled={timeLeft === 'EXPIRED'}
        className={`w-full py-3 font-bold text-sm rounded transition-all uppercase tracking-widest ${
          status === 'MANAGE' 
            ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
            : timeLeft === 'EXPIRED'
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-neon-green text-black hover:bg-white hover:shadow-[0_0_15px_rgba(0,255,136,0.5)]'
        }`}
      >
        {status === 'MANAGE' ? 'MANAGE CHALLENGE' : timeLeft === 'EXPIRED' ? 'EXPIRED' : 'JOIN CHALLENGE'}
      </button>
    </div>
  )
}

export default ChallengeCard