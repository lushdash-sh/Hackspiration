import React, { useState, useEffect } from 'react'
import { useCommitFiWorking } from '../hooks/useCommitFiWorking'

const Staking = () => {
  const [stakeAmount, setStakeAmount] = useState<string>('5')
  const [duration, setDuration] = useState<string>('7')
  const [maxParticipants, setMaxParticipants] = useState<string>('50')
  const [userStakes, setUserStakes] = useState<any[]>([])
  
  const { createChallenge, loading, error, getUserStakes, STAKE_UPDATE_EVENT } = useCommitFiWorking()

  const loadStakes = async () => {
    const stakes = await getUserStakes()
    setUserStakes(stakes)
  }

  useEffect(() => {
    loadStakes()
  }, [getUserStakes])

  // Listen for stake updates
  useEffect(() => {
    const handleStakeUpdate = () => {
      console.log('Staking received stake update event')
      loadStakes()
    }

    window.addEventListener(STAKE_UPDATE_EVENT, handleStakeUpdate)
    return () => window.removeEventListener(STAKE_UPDATE_EVENT, handleStakeUpdate)
  }, [STAKE_UPDATE_EVENT, loadStakes])

  const handleCreateStake = async () => {
    const deadline = Math.floor(Date.now() / 1000) + (parseInt(duration) * 24 * 60 * 60)
    
    await createChallenge(
      parseFloat(stakeAmount),
      deadline,
      parseInt(maxParticipants)
    )
    
    // Clear form after successful creation
    setStakeAmount('5')
    setDuration('7')
    setMaxParticipants('50')
  }

  return (
    <div className="min-h-screen bg-cyber-black text-white relative overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-black via-cyber-dark to-cyber-black">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[linear-gradient(0deg,transparent_24%,rgba(0,255,136,0.05)_25%,rgba(0,255,136,0.05)_26%,transparent_27%,transparent_74%,rgba(0,255,136,0.05)_75%,rgba(0,255,136,0.05)_76%,transparent_77%,transparent)] bg-[size:50px_50px]"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-cyber font-bold mb-4 bg-gradient-to-r from-neon-green via-neon-blue to-neon-purple bg-clip-text text-transparent">
            STAKING VAULT
          </h1>
          <p className="text-xl text-gray-400 font-mono max-w-2xl mx-auto">
            Lock your ALGO in smart contracts and earn rewards while building discipline
          </p>
        </div>

        {/* Staking Interface */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Staking Form */}
          <div className="bg-cyber-dark/90 backdrop-blur-sm border border-neon-green/20 rounded-lg p-8">
            <h2 className="text-2xl font-cyber font-bold text-neon-green mb-6">CREATE STAKE</h2>
            
            <div className="space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">AMOUNT (ALGO)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full bg-cyber-black/50 border border-neon-green/20 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green focus:shadow-lg focus:shadow-neon-green/20"
                    placeholder="Enter amount"
                  />
                  <div className="absolute right-3 top-3 text-neon-green font-mono text-sm">₳</div>
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">DURATION (DAYS)</label>
                <div className="grid grid-cols-3 gap-3">
                  {['7', '14', '30'].map((days) => (
                    <button
                      key={days}
                      onClick={() => setDuration(days)}
                      className={`py-3 rounded-lg font-mono font-bold transition-all duration-300 ${
                        duration === days
                          ? 'bg-neon-green text-cyber-black'
                          : 'bg-cyber-black/50 border border-neon-green/20 text-gray-400 hover:border-neon-green/50'
                      }`}
                    >
                      {days}D
                    </button>
                  ))}
                </div>
              </div>

              {/* APY Display */}
              <div className="bg-cyber-black/50 rounded-lg p-4 border border-neon-blue/10">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-mono text-gray-400">ESTIMATED APY</span>
                  <span className="text-xl font-bold text-neon-blue font-mono">12.5%</span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={handleCreateStake}
                disabled={loading}
                className={`w-full py-4 font-bold rounded-lg font-mono transition-all duration-300 transform hover:scale-105 ${
                  loading 
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-neon-green to-neon-blue text-cyber-black hover:shadow-lg hover:shadow-neon-green/50'
                }`}
              >
                {loading ? 'CREATING CHALLENGE...' : 'CREATE STAKE'}
              </button>
            </div>
          </div>

          {/* Stats & Info */}
          <div className="space-y-6">
            {/* Total Staked */}
            <div className="bg-cyber-dark/90 backdrop-blur-sm border border-neon-blue/20 rounded-lg p-6">
              <h3 className="text-lg font-cyber font-bold text-neon-blue mb-4">TOTAL STAKED</h3>
              <div className="text-3xl font-bold text-white font-mono mb-2">
                {userStakes.reduce((sum, stake) => sum + stake.stakeAmount, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-400 font-mono">ALGO across all your vaults</div>
              <div className="mt-4 text-xs text-neon-green font-mono">
                {userStakes.length} active challenge{userStakes.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Your Stakes */}
            <div className="bg-cyber-dark/90 backdrop-blur-sm border border-neon-purple/20 rounded-lg p-6">
              <h3 className="text-lg font-cyber font-bold text-neon-purple mb-4">YOUR ACTIVE STAKES</h3>
              <div className="space-y-3">
                {userStakes.filter(stake => stake.status === 'joined').length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 font-mono">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="text-sm">No active stakes yet</div>
                      <div className="text-xs mt-1">Create your first stake above!</div>
                    </div>
                  </div>
                ) : (
                  userStakes.filter(stake => stake.status === 'joined').map((stake, index) => (
                    <div key={stake.appId.toString()} className="bg-cyber-black/50 rounded-lg p-3 border border-neon-purple/10">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-white font-mono font-semibold">
                            {stake.challengeType === 'circle' ? `👥 ${stake.circleName}` : '🎯 Individual Challenge'}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            Ends in {Math.max(0, Math.floor((stake.deadline * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))} days
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-neon-purple font-mono font-bold">{stake.stakeAmount} ALGO</div>
                          <div className="text-xs text-gray-400 font-mono">App ID: {stake.appId.toString().slice(-6)}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Staking
