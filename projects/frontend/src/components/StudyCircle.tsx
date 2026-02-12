import React, { useState } from 'react'

const StudyCircle = () => {
  const [selectedCircle, setSelectedCircle] = useState<number | null>(null)

  const circles = [
    { id: 1, name: 'DSA Masters', members: 12, level: 'Advanced', stake: 25, nextMeeting: '2 hours' },
    { id: 2, name: 'Web3 Warriors', members: 8, level: 'Intermediate', stake: 15, nextMeeting: '1 day' },
    { id: 3, name: 'Algorithm Ninjas', members: 15, level: 'Advanced', stake: 30, nextMeeting: '3 hours' },
    { id: 4, name: 'Blockchain Basics', members: 20, level: 'Beginner', stake: 10, nextMeeting: 'Tomorrow' },
  ]

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
          <h1 className="text-5xl md:text-7xl font-cyber font-bold mb-4 bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue bg-clip-text text-transparent">
            STUDY CIRCLES
          </h1>
          <p className="text-xl text-gray-400 font-mono max-w-2xl mx-auto">
            Join collaborative learning groups with shared stakes and accountability
          </p>
        </div>

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
          {circles.map((circle) => (
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
