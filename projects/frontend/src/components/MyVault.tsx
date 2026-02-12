import React, { useState, useEffect } from 'react'
import { useCommitFiSimple } from '../hooks/useCommitFiSimple'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import * as algokit from '@algorandfoundation/algokit-utils'
import { CommitFiClient } from '../contracts/CommitFiClient'
import { useWallet } from '@txnlab/use-wallet-react'

interface UserStake {
  appId: bigint
  stakeAmount: number
  deadline: number
  status: string // 'joined', 'verified', 'withdrawn'
  proofSubmitted: boolean
  proofUrl?: string | undefined
}

const MyVault = () => {
  const [userStakes, setUserStakes] = useState<UserStake[]>([])
  const [selectedStake, setSelectedStake] = useState<UserStake | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofDescription, setProofDescription] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)
  
  const { loading, error } = useCommitFiSimple()
  const { activeAddress } = useWallet()

  // Load user's stakes from blockchain
  useEffect(() => {
    const loadUserStakes = async () => {
      if (!activeAddress) return

      const appIds = [BigInt(755419650), BigInt(755002266)] // Your deployed apps
      const stakes: UserStake[] = []

      for (const appId of appIds) {
        try {
          // For now, use mock data
          stakes.push({
            appId,
            stakeAmount: 25, // Mock data
            deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
            status: 'joined',
            proofSubmitted: false
          })
        } catch (err) {
          console.log(`No stake found for app ${appId}`)
        }
      }

      setUserStakes(stakes)
    }

    loadUserStakes()
  }, [activeAddress])

  const handleUploadProof = async () => {
    if (!selectedStake || !proofFile) return

    setUploading(true)
    
    try {
      // Mock IPFS upload
      const proofUrl = await new Promise((resolve) => {
        setTimeout(() => resolve(`ipfs://mock-hash-${Date.now()}`), 2000)
      })
      
      // Update local state to mark proof as submitted
      const updatedStakes = userStakes.map(stake => 
        stake.appId === selectedStake.appId 
          ? { ...stake, proofSubmitted: true, proofUrl: proofUrl || undefined }
          : stake
      )
      setUserStakes(updatedStakes)
      
      alert('Proof submitted successfully! Waiting for verification.')
      
      // Reset form
      setSelectedStake(null)
      setProofFile(null)
      setProofDescription('')
    } catch (err) {
      alert(`Failed to upload proof: ${(err as Error).message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleWithdraw = async (stake: UserStake) => {
    try {
      // Mock withdrawal
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      // Update local state
      const updatedStakes = userStakes.map(s => 
        s.appId === stake.appId 
          ? { ...s, status: 'withdrawn' }
          : s
      )
      setUserStakes(updatedStakes)
      
      alert('Stake withdrawn successfully!')
    } catch (err) {
      alert(`Failed to withdraw: ${(err as Error).message}`)
    }
  }

  // Mock IPFS upload function
  const uploadToIPFS = async (file: File, description: string): Promise<string> => {
    // In a real implementation, you'd use Pinata, Infura IPFS, etc.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`ipfs://mock-hash-${Date.now()}`)
      }, 2000)
    })
  }

  const formatDeadline = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
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
            Track your active stakes, submit proof of completion, and withdraw your rewards
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* User Stakes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {userStakes.map((stake) => (
            <div key={stake.appId.toString()} className="bg-cyber-dark/90 backdrop-blur-sm border border-neon-green/20 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-cyber font-bold text-neon-green">Stake #{stake.appId.toString()}</h3>
                  <p className="text-sm text-gray-400 font-mono">App ID: {stake.appId.toString()}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-mono ${
                  stake.status === 'withdrawn' 
                    ? 'bg-gray-500/20 text-gray-400' 
                    : stake.proofSubmitted 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-neon-green/20 text-neon-green'
                }`}>
                  {stake.status === 'withdrawn' ? 'WITHDRAWN' : stake.proofSubmitted ? 'PROOF SUBMITTED' : 'ACTIVE'}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Stake Amount</span>
                  <span className="text-white font-mono font-bold">{stake.stakeAmount} ALGO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Deadline</span>
                  <span className="text-white font-mono text-sm">{formatDeadline(stake.deadline)}</span>
                </div>
                {stake.proofUrl && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono text-sm">Proof</span>
                    <a href={stake.proofUrl} target="_blank" className="text-neon-blue hover:text-neon-purple font-mono text-sm">
                      View Proof →
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3">
                {!stake.proofSubmitted && stake.status !== 'withdrawn' && (
                  <button 
                    onClick={() => setSelectedStake(stake)}
                    className="w-full py-2 bg-neon-blue text-cyber-black font-bold rounded-lg font-mono text-sm hover:bg-neon-purple transition-colors"
                  >
                    SUBMIT PROOF
                  </button>
                )}
                {stake.proofSubmitted && stake.status !== 'withdrawn' && (
                  <button 
                    onClick={() => handleWithdraw(stake)}
                    disabled={loading}
                    className="w-full py-2 bg-neon-green text-cyber-black font-bold rounded-lg font-mono text-sm hover:bg-neon-blue transition-colors disabled:opacity-50"
                  >
                    {loading ? 'WITHDRAWING...' : 'WITHDRAW STAKE'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Proof Upload Modal */}
        {selectedStake && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-cyber-dark border border-neon-green/20 rounded-lg p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-cyber font-bold text-neon-green mb-6">Submit Proof</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">STAKE DETAILS</label>
                  <div className="bg-cyber-black/50 rounded-lg p-3 border border-neon-green/10">
                    <p className="text-white font-mono">Stake #{selectedStake.appId.toString()}</p>
                    <p className="text-gray-400 font-mono text-sm">{selectedStake.stakeAmount} ALGO</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">PROOF DESCRIPTION</label>
                  <textarea
                    value={proofDescription}
                    onChange={(e) => setProofDescription(e.target.value)}
                    className="w-full bg-cyber-black/50 border border-neon-green/20 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green"
                    rows={3}
                    placeholder="Describe how you completed your challenge..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">UPLOAD PROOF</label>
                  <input
                    type="file"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="w-full bg-cyber-black/50 border border-neon-green/20 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button 
                  onClick={() => setSelectedStake(null)}
                  className="flex-1 py-3 bg-cyber-gray text-white font-bold rounded-lg font-mono hover:bg-gray-600 transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleUploadProof}
                  disabled={!proofFile || uploading}
                  className="flex-1 py-3 bg-neon-green text-cyber-black font-bold rounded-lg font-mono hover:bg-neon-blue transition-colors disabled:opacity-50"
                >
                  {uploading ? 'UPLOADING...' : 'SUBMIT PROOF'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyVault
