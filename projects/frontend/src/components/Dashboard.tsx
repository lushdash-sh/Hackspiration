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

const Dashboard = () => {
  const [userStakes, setUserStakes] = useState<UserStake[]>([])
  const [selectedStake, setSelectedStake] = useState<UserStake | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofDescription, setProofDescription] = useState<string>('')
  const [showProofModal, setShowProofModal] = useState<boolean>(false)
  const { getUserStakes, submitProof, withdrawStake, loading, STAKE_UPDATE_EVENT } = useCommitFiWorking()
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

  const handleUploadProof = async () => {
    if (!selectedStake || !proofFile) return

    try {
      await submitProof(selectedStake.appId, proofFile, proofDescription)
      setShowProofModal(false)
      setSelectedStake(null)
      setProofFile(null)
      setProofDescription('')
    } catch (error) {
      console.error('Proof upload failed:', error)
    }
  }

  const handleWithdraw = async (stake: UserStake) => {
    try {
      await withdrawStake(stake.appId)
    } catch (error) {
      console.error('Withdraw failed:', error)
    }
  }

  const openProofModal = (stake: UserStake) => {
    setSelectedStake(stake)
    setShowProofModal(true)
  }

  const totalStaked = userStakes.reduce((sum: number, stake: UserStake) => sum + stake.stakeAmount, 0)
  const activeStakes = userStakes.filter((stake: UserStake) => stake.status === 'joined').length
  const completedStakes = userStakes.filter((stake: UserStake) => stake.status === 'withdrawn').length

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

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  {stake.status === 'joined' && !stake.proofSubmitted && (
                    <button
                      onClick={() => openProofModal(stake)}
                      className="flex-1 py-2 px-4 bg-neon-blue text-cyber-black font-bold rounded-lg font-mono text-sm hover:bg-neon-blue/80 transition-colors duration-300"
                    >
                      📤 SUBMIT PROOF
                    </button>
                  )}
                  
                  {stake.proofSubmitted && stake.status !== 'withdrawn' && (
                    <button
                      onClick={() => handleWithdraw(stake)}
                      disabled={loading}
                      className="flex-1 py-2 px-4 bg-neon-green text-cyber-black font-bold rounded-lg font-mono text-sm hover:bg-neon-green/80 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'WITHDRAWING...' : '💰 WITHDRAW STAKE'}
                    </button>
                  )}
                  
                  {stake.status === 'withdrawn' && (
                    <div className="flex-1 py-2 px-4 bg-gray-500/20 text-gray-400 font-bold rounded-lg font-mono text-sm text-center border border-gray-500/30">
                      ✅ COMPLETED
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Proof Upload Modal */}
      {showProofModal && selectedStake && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cyber-dark border border-neon-green/20 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-neon-green font-mono mb-4">
              SUBMIT PROOF
            </h3>
            
            <div className="mb-4">
              <div className="text-sm text-gray-400 font-mono mb-2">CHALLENGE</div>
              <div className="text-white font-mono">
                {selectedStake.challengeType === 'circle' ? `👥 ${selectedStake.circleName}` : '🎯 Individual Challenge'}
              </div>
              <div className="text-xs text-gray-400 font-mono mt-1">
                Stake: {selectedStake.stakeAmount} ALGO
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-mono text-gray-400 mb-2">PROOF FILE</label>
              <input
                type="file"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProofFile(e.target.files?.[0] || null)}
                className="w-full bg-cyber-black/50 border border-neon-green/20 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green"
                accept="image/*,.pdf,.doc,.docx"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-mono text-gray-400 mb-2">DESCRIPTION</label>
              <textarea
                value={proofDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProofDescription(e.target.value)}
                className="w-full bg-cyber-black/50 border border-neon-green/20 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green resize-none"
                rows={3}
                placeholder="Describe your completed work..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowProofModal(false)}
                className="flex-1 py-2 px-4 bg-gray-500/20 text-gray-400 font-bold rounded-lg font-mono text-sm border border-gray-500/30 hover:bg-gray-500/30 transition-colors duration-300"
              >
                CANCEL
              </button>
              <button
                onClick={handleUploadProof}
                disabled={!proofFile || loading}
                className="flex-1 py-2 px-4 bg-neon-green text-cyber-black font-bold rounded-lg font-mono text-sm hover:bg-neon-green/80 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'UPLOADING...' : 'UPLOAD PROOF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
