import React, { useState, useEffect } from 'react'
import { useCommitFiWorking } from '../hooks/useCommitFiWorking'

const StudyCircle = () => {
  const [selectedCircle, setSelectedCircle] = useState<number | null>(null)
  const [joinedCircles, setJoinedCircles] = useState<number[]>([])
  const [createMode, setCreateMode] = useState<boolean>(false)
  const [circleName, setCircleName] = useState<string>('')
  const [circleStake, setCircleStake] = useState<string>('5')
  const [maxParticipants, setMaxParticipants] = useState<string>('10')
  const [userStakes, setUserStakes] = useState<any[]>([])
  
  const { createCircle, joinCircle, loading, error, getUserStakes, STAKE_UPDATE_EVENT } = useCommitFiWorking()

  const existingCircles = [
    { id: 1, name: 'DSA Masters', members: 12, level: 'Advanced', stake: 5, nextMeeting: '2 hours' },
    { id: 2, name: 'Web3 Warriors', members: 8, level: 'Intermediate', stake: 5, nextMeeting: '1 day' },
    { id: 3, name: 'Algorithm Ninjas', members: 15, level: 'Advanced', stake: 5, nextMeeting: '3 hours' },
    { id: 4, name: 'Blockchain Basics', members: 20, level: 'Beginner', stake: 5, nextMeeting: 'Tomorrow' },
  ]

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
      console.log('StudyCircle received stake update event')
      loadStakes()
    }

    window.addEventListener(STAKE_UPDATE_EVENT, handleStakeUpdate)
    return () => window.removeEventListener(STAKE_UPDATE_EVENT, handleStakeUpdate)
  }, [STAKE_UPDATE_EVENT, loadStakes])

  const handleCreateCircle = async () => {
    const deadline = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
    
    await createCircle(
      circleName,
      parseFloat(circleStake),
      parseInt(maxParticipants)
    )
    
    // Clear form after successful creation
    setCircleName('')
    setCircleStake('5')
    setMaxParticipants('10')
    setCreateMode(false)
  }

  const handleJoinCircle = async (circle: { id: number; name: string; members: number; level: string; stake: number; nextMeeting: string }) => {
    await joinCircle(circle.id.toString(), circle.stake)
    setJoinedCircles([...joinedCircles, circle.id])
    
    // Show success message
    alert(`Successfully joined ${circle.name} with ${circle.stake} ALGO stake!`)
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
            STUDY CIRCLES
          </h1>
          <p className="text-xl text-gray-400 font-mono max-w-2xl mx-auto">
            Join collaborative learning groups with shared stakes and accountability
          </p>
          
          {/* Create Circle Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setCreateMode(true)}
              className="px-6 py-3 bg-gradient-to-r from-neon-green to-neon-blue text-cyber-black font-bold rounded-lg font-mono hover:shadow-lg hover:shadow-neon-green/50 transition-all duration-300 transform hover:scale-105"
            >
              CREATE NEW CIRCLE
            </button>
          </div>
        </div>

        {/* Create Circle Form */}
        {createMode && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-cyber-dark border border-neon-green/20 rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-cyber font-bold text-neon-green mb-6">CREATE STUDY CIRCLE</h2>
              
              <div className="space-y-6">
                {/* Circle Name */}
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">CIRCLE NAME</label>
                  <input
                    type="text"
                    value={circleName}
                    onChange={(e) => setCircleName(e.target.value)}
                    className="w-full bg-cyber-black/50 border border-neon-green/20 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green focus:shadow-lg focus:shadow-neon-green/20"
                    placeholder="Enter circle name..."
                  />
                </div>

                {/* Stake Amount */}
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">STAKE AMOUNT (ALGO)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={circleStake}
                      onChange={(e) => setCircleStake(e.target.value)}
                      className="w-full bg-cyber-black/50 border border-neon-green/20 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green focus:shadow-lg focus:shadow-neon-green/20"
                      placeholder="Enter amount"
                    />
                    <div className="absolute right-3 top-3 text-neon-green font-mono text-sm">₳</div>
                  </div>
                </div>

                {/* Max Participants */}
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">MAX PARTICIPANTS</label>
                  <input
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    className="w-full bg-cyber-black/50 border border-neon-green/20 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green focus:shadow-lg focus:shadow-neon-green/20"
                    placeholder="Enter max participants"
                    min="2"
                    max="50"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleCreateCircle}
                    disabled={loading || !circleName.trim()}
                    className={`flex-1 py-3 font-bold rounded-lg font-mono transition-all duration-300 ${
                      loading || !circleName.trim()
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-neon-green to-neon-blue text-cyber-black hover:shadow-lg hover:shadow-neon-green/50'
                    }`}
                  >
                    {loading ? 'CREATING...' : 'CREATE CIRCLE'}
                  </button>
                  <button
                    onClick={() => setCreateMode(false)}
                    className="px-6 py-3 bg-cyber-gray text-gray-400 font-bold rounded-lg font-mono hover:bg-cyber-gray/50 transition-all duration-300"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-cyber-dark/50 backdrop-blur-sm border border-neon-purple/20 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-neon-purple font-mono">24</div>
            <div className="text-xs text-gray-400 font-mono mt-1">ACTIVE CIRCLES</div>
          </div>
          <div className="bg-cyber-dark/50 backdrop-blur-sm border border-neon-pink/20 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-neon-pink font-mono">156</div>
            <div className="text-xs text-gray-400 font-mono mt-1">MEMBERS</div>
          </div>
          <div className="bg-cyber-dark/50 backdrop-blur-sm border border-neon-blue/20 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-neon-blue font-mono">89%</div>
            <div className="text-xs text-gray-400 font-mono mt-1">COMPLETION RATE</div>
          </div>
          <div className="bg-cyber-dark/50 backdrop-blur-sm border border-neon-green/20 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-neon-green font-mono">1,250</div>
            <div className="text-xs text-gray-400 font-mono mt-1">TOTAL ALGO POOLED</div>
          </div>
        </div>

        {/* Study Circles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {existingCircles.map((circle) => (
            <div
              key={circle.id}
              className="relative group cursor-pointer"
              onClick={() => setSelectedCircle(circle.id)}
            >
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg blur opacity-0 group-hover:opacity-75 transition-all duration-300"></div>
              
              {/* Card */}
              <div className="relative bg-cyber-dark/90 backdrop-blur-sm border border-neon-purple/20 rounded-lg p-6 transform transition-all duration-300 hover:scale-105 hover:border-neon-purple/50">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-cyber font-bold text-white mb-1">{circle.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-mono font-bold ${
                        circle.level === 'Advanced' 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : circle.level === 'Intermediate'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        {circle.level}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">Level</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-neon-purple font-mono">{circle.members}</div>
                    <div className="text-xs text-gray-400 font-mono">Members</div>
                  </div>
                </div>

                {/* Stake Info */}
                <div className="bg-cyber-black/50 rounded-lg p-4 mb-4 border border-neon-purple/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-500 font-mono mb-1">REQUIRED STAKE</div>
                      <div className="text-xl font-bold text-neon-purple font-mono">
                        {circle.stake} <span className="text-sm text-gray-400">ALGO</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-neon-purple/20 rounded-full flex items-center justify-center">
                      <span className="text-neon-purple font-bold text-lg">₳</span>
                    </div>
                  </div>
                </div>

                {/* Next Meeting */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-400 font-mono">Next meeting</div>
                  <div className="text-neon-pink font-mono font-bold">{circle.nextMeeting}</div>
                </div>

                {/* Members Preview */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i}
                        className="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full border-2 border-cyber-dark flex items-center justify-center"
                      >
                        <span className="text-xs font-bold text-cyber-black">{i}</span>
                      </div>
                    ))}
                    {circle.members > 4 && (
                      <div className="w-8 h-8 bg-cyber-gray rounded-full border-2 border-cyber-dark flex items-center justify-center">
                        <span className="text-xs text-gray-400 font-mono">+{circle.members - 4}</span>
                      </div>
                    )}
                  </div>
                  <button className="text-neon-purple hover:text-neon-pink transition-colors duration-300 font-mono text-sm">
                    JOIN →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Your Created Circles */}
        {userStakes.filter(stake => stake.challengeType === 'circle').length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-cyber font-bold text-neon-green mb-6">YOUR CREATED CIRCLES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {userStakes.filter(stake => stake.challengeType === 'circle').map((stake) => (
                <div
                  key={stake.appId.toString()}
                  className="relative group cursor-pointer"
                >
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg blur opacity-0 group-hover:opacity-75 transition-all duration-300"></div>
                  
                  {/* Card */}
                  <div className="relative bg-cyber-dark/90 backdrop-blur-sm border border-neon-green/20 rounded-lg p-6 transform transition-all duration-300 hover:scale-105 hover:border-neon-green/50">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white font-mono mb-2">
                          👥 {stake.circleName || 'Study Circle'}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded-full text-xs font-mono">
                            YOUR CIRCLE
                          </span>
                          <span className="text-xs text-gray-400 font-mono">Created by you</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-neon-green font-mono">{stake.stakeAmount}</div>
                        <div className="text-xs text-gray-400 font-mono">ALGO stake</div>
                      </div>
                    </div>

                    {/* Stake Info */}
                    <div className="bg-cyber-black/50 rounded-lg p-4 mb-4 border border-neon-green/10">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs text-gray-500 font-mono mb-1">YOUR STAKE</div>
                          <div className="text-xl font-bold text-neon-green font-mono">
                            {stake.stakeAmount} <span className="text-sm text-gray-400">ALGO</span>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-neon-green/20 rounded-full flex items-center justify-center">
                          <span className="text-neon-green font-bold text-lg">₳</span>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-400 font-mono">Status</div>
                      <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                        stake.status === 'withdrawn' 
                          ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' 
                          : stake.proofSubmitted 
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                      }`}>
                        {stake.status === 'withdrawn' ? 'COMPLETED' : stake.proofSubmitted ? 'PROOF SUBMITTED' : 'ACTIVE'}
                      </div>
                    </div>

                    {/* App ID */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400 font-mono">App ID: {stake.appId.toString()}</div>
                      <button className="text-neon-green hover:text-neon-blue transition-colors duration-300 font-mono text-sm">
                        MANAGE →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create New Circle */}
        <div className="text-center">
          <button className="px-8 py-4 bg-gradient-to-r from-neon-purple to-neon-pink text-cyber-black font-bold rounded-lg font-mono hover:shadow-lg hover:shadow-neon-purple/50 transition-all duration-300 transform hover:scale-105">
            CREATE NEW CIRCLE
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudyCircle
