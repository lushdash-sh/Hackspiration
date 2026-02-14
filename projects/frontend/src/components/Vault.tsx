import React, { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useCommitFiWorking } from '../hooks/useCommitFiWorking'

interface UserStake {
  appId: bigint
  stakeAmount: number
  deadline: number
  status: 'joined' | 'verified' | 'withdrawn'
  proofSubmitted: boolean
  proofUrl?: string
  challengeType: 'individual' | 'circle'
  circleName?: string
}

const Vault = () => {
  const [userStakes, setUserStakes] = useState<UserStake[]>([])
  const { getUserStakes, submitProof, withdrawStake, loading, STAKE_UPDATE_EVENT } = useCommitFiWorking()
  const { activeAddress } = useWallet()

  const [selectedStake, setSelectedStake] = useState<UserStake | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofDescription, setProofDescription] = useState<string>('')

  // Calculate vault statistics
  const totalStaked = userStakes.reduce((sum, stake) => sum + stake.stakeAmount, 0)
  const activeChallenges = userStakes.filter(stake => stake.status === 'joined')
  const completedChallenges = userStakes.filter(stake => stake.status === 'withdrawn')
  const pendingVerification = userStakes.filter(stake => stake.proofSubmitted && stake.status !== 'withdrawn')
  const totalEarned = completedChallenges.reduce((sum, stake) => sum + stake.stakeAmount, 0) // Simplified earning calculation

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
      console.log('Vault received stake update event')
      loadStakes()
    }

    window.addEventListener(STAKE_UPDATE_EVENT, handleStakeUpdate)
    return () => window.removeEventListener(STAKE_UPDATE_EVENT, handleStakeUpdate)
  }, [STAKE_UPDATE_EVENT, loadStakes])

  const handleUploadProof = async () => {
    if (!selectedStake || !proofFile) return

    await submitProof(selectedStake.appId, proofFile, proofDescription)
    
    // Reset form
    setSelectedStake(null)
    setProofFile(null)
    setProofDescription('')
  }

  const handleWithdraw = async (stake: any) => {
    await withdrawStake(stake.appId)
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
            MY VAULT
          </h1>
          <p className="text-xl text-gray-400 font-mono max-w-2xl mx-auto">
            Your personal challenge history and stake information
          </p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-cyber-dark/50 backdrop-blur-sm border border-neon-green/20 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-neon-green font-mono">{userStakes.length}</div>
            <div className="text-sm text-gray-400 font-mono mt-1">TOTAL CHALLENGES</div>
            <div className="text-xs text-neon-green font-mono mt-2">All time participation</div>
          </div>
          <div className="bg-cyber-dark/50 backdrop-blur-sm border border-neon-blue/20 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-neon-blue font-mono">
              {userStakes.filter(s => s.status === 'joined').length}
            </div>
            <div className="text-sm text-gray-400 font-mono mt-1">ACTIVE STAKES</div>
            <div className="text-xs text-neon-blue font-mono mt-2">Currently in progress</div>
          </div>
          <div className="bg-cyber-dark/50 backdrop-blur-sm border border-neon-purple/20 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-neon-purple font-mono">
              {userStakes.reduce((sum, s) => sum + s.stakeAmount, 0)}
            </div>
            <div className="text-sm text-gray-400 font-mono mt-1">TOTAL ALGO STAKED</div>
            <div className="text-xs text-neon-purple font-mono mt-2">Across all challenges</div>
          </div>
        </div>

        {/* Your Challenges */}
        <div className="space-y-6">
          <h2 className="text-2xl font-cyber font-bold text-neon-green mb-6">YOUR CHALLENGE HISTORY</h2>
          
          {userStakes.length === 0 ? (
            <div className="bg-cyber-dark/50 backdrop-blur-sm border border-gray-500/20 rounded-lg p-8 text-center">
              <div className="text-gray-400 font-mono">
                <div className="text-4xl mb-4">🎯</div>
                <div className="text-lg mb-2">No challenges found</div>
                <div className="text-sm">Join a challenge to get started!</div>
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
                    {stake.status === 'withdrawn' ? 'COMPLETED' : stake.proofSubmitted ? 'PROOF SUBMITTED' : 'ACTIVE'}
                  </div>
                  <div className="text-neon-purple font-mono text-xs">
                    {stake.challengeType === 'circle' ? `👥 ${stake.circleName}` : '🎯 Individual'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400 font-mono mb-1">STAKE AMOUNT</div>
                    <div className="text-lg font-bold text-neon-green font-mono">{stake.stakeAmount} ALGO</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 font-mono mb-1">DEADLINE</div>
                    <div className="text-sm font-bold text-neon-blue font-mono">
                      {new Date(stake.deadline * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400 font-mono mb-1">STATUS</div>
                    <div className="text-sm font-bold text-white font-mono">
                      {stake.status === 'withdrawn' ? '✅ Completed & Withdrawn' : 
                       stake.proofSubmitted ? '⏳ Proof Submitted - Pending' : '🔄 Active'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 font-mono mb-1">APP ID</div>
                    <div className="text-sm font-bold text-neon-purple font-mono">{stake.appId.toString()}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  {stake.status === 'joined' && !stake.proofSubmitted && (
                    <button
                      onClick={() => setSelectedStake(stake)}
                      className="flex-1 py-2 bg-gradient-to-r from-neon-green to-neon-blue text-cyber-black font-bold rounded-lg font-mono text-sm hover:shadow-lg hover:shadow-neon-green/50 transition-all duration-300"
                    >
                      SUBMIT PROOF
                    </button>
                  )}
                  
                  {stake.proofSubmitted && stake.status !== 'withdrawn' && (
                    <button
                      onClick={() => handleWithdraw(stake)}
                      disabled={loading}
                      className="flex-1 py-2 bg-gradient-to-r from-neon-purple to-neon-pink text-cyber-black font-bold rounded-lg font-mono text-sm hover:shadow-lg hover:shadow-neon-purple/50 transition-all duration-300"
                    >
                      WITHDRAW STAKE
                    </button>
                  )}
                  
                  {stake.status === 'withdrawn' && (
                    <div className="flex-1 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-center">
                      <span className="text-gray-400 font-mono text-sm">✅ COMPLETED</span>
                    </div>
                  )}
                </div>

                {/* Proof Upload Modal */}
                {selectedStake && selectedStake.appId === stake.appId && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-cyber-dark border border-neon-green/20 rounded-lg p-8 max-w-md w-full">
                      <h2 className="text-2xl font-cyber font-bold text-neon-green mb-6">SUBMIT PROOF</h2>
                      
                      <div className="space-y-6">
                        {/* File Upload */}
                        <div>
                          <label className="block text-sm font-mono text-gray-400 mb-2">PROOF FILE</label>
                          <input
                            type="file"
                            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                            className="w-full bg-cyber-black/50 border border-neon-green/20 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green focus:shadow-lg focus:shadow-neon-green/20"
                            accept="image/*,.pdf,.doc,.doc"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-mono text-gray-400 mb-2">DESCRIPTION</label>
                          <textarea
                            value={proofDescription}
                            onChange={(e) => setProofDescription(e.target.value)}
                            className="w-full bg-cyber-black/50 border border-neon-green/20 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green focus:shadow-lg focus:shadow-neon-green/20"
                            rows={3}
                            placeholder="Describe how you completed the challenge..."
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                          <button
                            onClick={handleUploadProof}
                            disabled={!proofFile || loading}
                            className={`flex-1 py-3 font-bold rounded-lg font-mono transition-all duration-300 ${
                              !proofFile || loading
                                ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-neon-green to-neon-blue text-cyber-black hover:shadow-lg hover:shadow-neon-green/50'
                            }`}
                          >
                            {loading ? 'UPLOADING...' : 'SUBMIT PROOF'}
                          </button>
                          <button
                            onClick={() => setSelectedStake(null)}
                            className="px-6 py-3 bg-cyber-gray text-gray-400 font-bold rounded-lg font-mono hover:bg-cyber-gray/50 transition-all duration-300"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
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

export default Vault
