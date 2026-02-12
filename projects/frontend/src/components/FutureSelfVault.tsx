import React, { useState } from 'react'

const FutureSelfVault = () => {
  const [depositAmount, setDepositAmount] = useState<string>('50')
  const [unlockDate, setUnlockDate] = useState<string>('2024-12-31')
  const [goalDescription, setGoalDescription] = useState<string>('Complete my DSA course')

  const vaults = [
    { 
      id: 1, 
      goal: 'Master React Development', 
      amount: 100, 
      unlockDate: '2024-06-15', 
      progress: 75,
      status: 'active'
    },
    { 
      id: 2, 
      goal: 'Complete Blockchain Course', 
      amount: 75, 
      unlockDate: '2024-08-30', 
      progress: 45,
      status: 'active'
    },
    { 
      id: 3, 
      goal: 'Build Portfolio Project', 
      amount: 50, 
      unlockDate: '2024-03-01', 
      progress: 100,
      status: 'completed'
    },
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
          <h1 className="text-5xl md:text-7xl font-cyber font-bold mb-4 bg-gradient-to-r from-neon-blue via-neon-green to-neon-purple bg-clip-text text-transparent">
            FUTURE SELF VAULT
          </h1>
          <p className="text-xl text-gray-400 font-mono max-w-2xl mx-auto">
            Lock funds for your future goals. Only your future self can unlock them.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-cyber-dark/50 backdrop-blur-sm border border-neon-blue/20 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-neon-blue font-mono">225</div>
            <div className="text-sm text-gray-400 font-mono mt-1">ALGO LOCKED</div>
            <div className="text-xs text-neon-green font-mono mt-2">Across 3 vaults</div>
          </div>
          <div className="bg-cyber-dark/50 backdrop-blur-sm border border-neon-green/20 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-neon-green font-mono">73%</div>
            <div className="text-sm text-gray-400 font-mono mt-1">AVERAGE PROGRESS</div>
            <div className="text-xs text-neon-green font-mono mt-2">On track to goals</div>
          </div>
          <div className="bg-cyber-dark/50 backdrop-blur-sm border border-neon-purple/20 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-neon-purple font-mono">2</div>
            <div className="text-sm text-gray-400 font-mono mt-1">ACTIVE VAULTS</div>
            <div className="text-xs text-neon-green font-mono mt-2">1 completed</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create New Vault */}
          <div className="bg-cyber-dark/90 backdrop-blur-sm border border-neon-blue/20 rounded-lg p-8">
            <h2 className="text-2xl font-cyber font-bold text-neon-blue mb-6">CREATE NEW VAULT</h2>
            
            <div className="space-y-6">
              {/* Goal Description */}
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">GOAL DESCRIPTION</label>
                <textarea
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  className="w-full bg-cyber-black/50 border border-neon-blue/20 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-blue focus:shadow-lg focus:shadow-neon-blue/20 resize-none"
                  rows={3}
                  placeholder="Describe your future goal..."
                />
              </div>

              {/* Deposit Amount */}
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">DEPOSIT AMOUNT (ALGO)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-cyber-black/50 border border-neon-blue/20 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-blue focus:shadow-lg focus:shadow-neon-blue/20"
                    placeholder="Enter amount"
                  />
                  <div className="absolute right-3 top-3 text-neon-blue font-mono text-sm">₳</div>
                </div>
              </div>

              {/* Unlock Date */}
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">UNLOCK DATE</label>
                <input
                  type="date"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  className="w-full bg-cyber-black/50 border border-neon-blue/20 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-blue focus:shadow-lg focus:shadow-neon-blue/20"
                />
              </div>

              {/* Warning */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-red-400 mt-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-mono text-red-400 font-semibold mb-1">TIME-LOCKED VAULT</div>
                    <div className="text-xs text-gray-400 font-mono">
                      Funds cannot be withdrawn before the unlock date. This is enforced by smart contract.
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full py-4 bg-gradient-to-r from-neon-blue to-neon-green text-cyber-black font-bold rounded-lg font-mono hover:shadow-lg hover:shadow-neon-blue/50 transition-all duration-300 transform hover:scale-105">
                CREATE VAULT
              </button>
            </div>
          </div>

          {/* Existing Vaults */}
          <div className="space-y-6">
            <h2 className="text-2xl font-cyber font-bold text-neon-green mb-6">YOUR VAULTS</h2>
            
            {vaults.map((vault) => (
              <div key={vault.id} className="bg-cyber-dark/90 backdrop-blur-sm border border-neon-green/20 rounded-lg p-6">
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    vault.status === 'completed' 
                      ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' 
                      : 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                  }`}>
                    {vault.status === 'completed' ? 'COMPLETED' : 'ACTIVE'}
                  </div>
                  <div className="text-neon-purple font-mono text-xs">
                    Vault #{1000 + vault.id}
                  </div>
                </div>

                {/* Goal */}
                <h3 className="text-lg font-cyber font-bold text-white mb-3">{vault.goal}</h3>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400 font-mono">PROGRESS</span>
                    <span className="text-xs text-neon-green font-mono font-bold">{vault.progress}%</span>
                  </div>
                  <div className="w-full bg-cyber-gray rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        vault.status === 'completed' ? 'bg-neon-green' : 'bg-neon-blue'
                      }`}
                      style={{ width: `${vault.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-cyber-black/50 rounded-lg p-3 border border-neon-green/10">
                    <div className="text-xs text-gray-500 font-mono mb-1">LOCKED AMOUNT</div>
                    <div className="text-lg font-bold text-neon-green font-mono">{vault.amount} ALGO</div>
                  </div>
                  <div className="bg-cyber-black/50 rounded-lg p-3 border border-neon-blue/10">
                    <div className="text-xs text-gray-500 font-mono mb-1">UNLOCKS ON</div>
                    <div className="text-sm font-bold text-neon-blue font-mono">{vault.unlockDate}</div>
                  </div>
                </div>

                {/* Action */}
                {vault.status === 'completed' ? (
                  <button className="w-full py-2 bg-gradient-to-r from-neon-green to-neon-blue text-cyber-black font-bold rounded-lg font-mono text-sm">
                    WITHDRAW FUNDS
                  </button>
                ) : (
                  <div className="text-center text-xs text-gray-400 font-mono">
                    Funds locked until {vault.unlockDate}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FutureSelfVault
