import React, { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useCommitFiWorking } from '../hooks/useCommitFiWorking'

const Dashboard = () => {
  const [userStakes, setUserStakes] = useState<any[]>([])
  const { getUserStakes, STAKE_UPDATE_EVENT } = useCommitFiWorking()
  const { activeAddress } = useWallet()

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
      console.log('Dashboard received stake update event')
      loadStakes()
    }

    window.addEventListener(STAKE_UPDATE_EVENT, handleStakeUpdate)
    return () => window.removeEventListener(STAKE_UPDATE_EVENT, handleStakeUpdate)
  }, [STAKE_UPDATE_EVENT, loadStakes])

  const totalStaked = userStakes.reduce((sum, stake) => sum + stake.stakeAmount, 0)
  const activeStakes = userStakes.filter(stake => stake.status === 'joined').length
  const completedStakes = userStakes.filter(stake => stake.status === 'withdrawn').length

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
            DASHBOARD
          </h1>
          <p className="text-xl text-gray-400 font-mono max-w-2xl mx-auto">
            Track your commitment challenges and stakes
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-cyber-dark/50 backdrop-blur-sm border border-neon-green/20 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-neon-green font-mono">{totalStaked}</div>
            <div className="text-sm text-gray-400 font-mono mt-1">ALGO STAKED</div>
            <div className="text-xs text-neon-green font-mono mt-2">Total across all challenges</div>
          </div>
          <div className="bg-cyber-dark/50 backdrop-blur-sm border border-neon-blue/20 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-neon-blue font-mono">{activeStakes}</div>
            <div className="text-sm text-gray-400 font-mono mt-1">ACTIVE CHALLENGES</div>
            <div className="text-xs text-neon-blue font-mono mt-2">Currently in progress</div>
          </div>
          <div className="bg-cyber-dark/50 backdrop-blur-sm border border-neon-purple/20 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-neon-purple font-mono">{completedStakes}</div>
            <div className="text-sm text-gray-400 font-mono mt-1">COMPLETED</div>
            <div className="text-xs text-neon-green font-mono mt-2">Successfully withdrawn</div>
          </div>
        </div>

        {/* Your Stakes */}
        <div className="space-y-6">
          <h2 className="text-2xl font-cyber font-bold text-neon-green mb-6">YOUR ACTIVE STAKES</h2>
          
          {userStakes.length === 0 ? (
            <div className="bg-cyber-dark/50 backdrop-blur-sm border border-gray-500/20 rounded-lg p-8 text-center">
              <div className="text-gray-400 font-mono">
                <div className="text-4xl mb-4">🎯</div>
                <div className="text-lg mb-2">No active stakes found</div>
                <div className="text-sm">Create your first challenge to get started!</div>
              </div>
            </div>
          ) : (
            userStakes.map((stake, index) => (
              <div key={stake.appId.toString()} className="bg-cyber-dark/90 backdrop-blur-sm border border-neon-green/20 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    stake.status === 'withdrawn' 
                      ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' 
                      : stake.proofSubmitted 
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                  }`}>
                    {stake.status === 'withdrawn' ? 'WITHDRAWN' : stake.proofSubmitted ? 'PROOF SUBMITTED' : 'ACTIVE'}
                  </div>
                  <div className="text-neon-purple font-mono text-xs">
                    App ID: {stake.appId.toString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400 font-mono mb-1">TYPE</div>
                    <div className="text-lg font-bold text-white font-mono">
                      {stake.challengeType === 'circle' ? `👥 ${stake.circleName || 'Study Circle'}` : '🎯 Individual Challenge'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 font-mono mb-1">STAKE AMOUNT</div>
                    <div className="text-lg font-bold text-neon-green font-mono">{stake.stakeAmount} ALGO</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400 font-mono mb-1">DEADLINE</div>
                    <div className="text-sm font-bold text-neon-blue font-mono">
                      {new Date(stake.deadline * 1000).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 font-mono mb-1">STATUS</div>
                    <div className="text-sm font-bold text-white font-mono">
                      {stake.status === 'withdrawn' ? '✅ Completed' : 
                       stake.proofSubmitted ? '⏳ Pending Verification' : '🔄 In Progress'}
                    </div>
                  </div>
                </div>

                {stake.proofUrl && (
                  <div className="bg-cyber-black/50 rounded-lg p-3 border border-neon-blue/10">
                    <div className="text-xs text-gray-400 font-mono mb-1">PROOF SUBMITTED</div>
                    <div className="text-xs text-neon-blue font-mono">
                      📎 {stake.proofUrl}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
