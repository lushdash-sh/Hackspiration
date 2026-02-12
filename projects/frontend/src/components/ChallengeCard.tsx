import React from 'react'

interface ChallengeCardProps {
  stakeAmount: number
  deadline: number
  onJoin: () => void
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ stakeAmount, deadline, onJoin }) => {
  const isExpired = Date.now() / 1000 > deadline
  const timeLeft = deadline - Date.now() / 1000
  const hoursLeft = Math.floor(timeLeft / 3600)
  const minutesLeft = Math.floor((timeLeft % 3600) / 60)

  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg blur opacity-0 group-hover:opacity-75 transition-all duration-300"></div>
      
      {/* Card */}
      <div className="relative bg-cyber-dark/90 backdrop-blur-sm border border-neon-green/20 rounded-lg p-6 transform transition-all duration-300 hover:scale-105 hover:border-neon-green/50">
        {/* Status Badge */}
        <div className="flex justify-between items-start mb-4">
          <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
            isExpired 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'bg-neon-green/20 text-neon-green border border-neon-green/30'
          }`}>
            {isExpired ? 'EXPIRED' : 'ACTIVE'}
          </div>
          <div className="text-neon-blue font-mono text-xs">
            #{Math.floor(Math.random() * 9000) + 1000}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-cyber font-bold text-white mb-2">
          DSA Sprint Challenge
        </h3>
        
        <p className="text-gray-400 text-sm font-mono mb-6">
          Commit to finishing your Data Structures assignment!
        </p>
        
        {/* Stake Amount */}
        <div className="bg-cyber-black/50 rounded-lg p-4 mb-6 border border-neon-green/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 font-mono mb-1">ENTRY FEE</div>
              <div className="text-2xl font-bold text-neon-green font-mono">
                {stakeAmount} <span className="text-sm text-gray-400">ALGO</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-neon-green/20 rounded-full flex items-center justify-center">
              <span className="text-neon-green font-bold text-lg">₳</span>
            </div>
          </div>
        </div>

        {/* Time Left */}
        {!isExpired && (
          <div className="bg-cyber-black/30 rounded-lg p-3 mb-6 border border-neon-blue/10">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 font-mono">TIME REMAINING</div>
              <div className="text-neon-blue font-mono font-bold">
                {hoursLeft}h {minutesLeft}m
              </div>
            </div>
            <div className="w-full bg-cyber-gray rounded-full h-1 mt-2">
              <div 
                className="bg-neon-blue h-1 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(0, (timeLeft / 86400) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Participants */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="w-8 h-8 bg-gradient-to-br from-neon-green to-neon-blue rounded-full border-2 border-cyber-dark flex items-center justify-center"
              >
                <span className="text-xs font-bold text-cyber-black">{i}</span>
              </div>
            ))}
            <div className="w-8 h-8 bg-cyber-gray rounded-full border-2 border-cyber-dark flex items-center justify-center">
              <span className="text-xs text-gray-400 font-mono">+12</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 font-mono">
            16 participants
          </div>
        </div>

        {/* Action Button */}
        <button 
          className={`w-full py-3 rounded-lg font-mono font-bold text-sm transition-all duration-300 transform ${
            isExpired 
              ? 'bg-cyber-gray text-gray-500 cursor-not-allowed border border-gray-600' 
              : 'bg-gradient-to-r from-neon-green to-neon-blue text-cyber-black hover:shadow-lg hover:shadow-neon-green/50 hover:scale-105'
          }`}
          onClick={onJoin}
          disabled={isExpired}
        >
          {isExpired ? 'CHALLENGE EXPIRED' : 'JOIN CHALLENGE'}
        </button>
      </div>
    </div>
  )
}

export default ChallengeCard