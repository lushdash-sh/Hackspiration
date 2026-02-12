import * as algokit from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useState } from 'react'
import ChallengeCard from './ChallengeCard'
import ConnectWallet from './ConnectWallet'
import Staking from './Staking'
import StudyCircle from './StudyCircle'
import FutureSelfVault from './FutureSelfVault'
import { CommitFiClient } from '../contracts/CommitFiClient'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

// --------------------------------------------------------
// CONFIGURATION
// --------------------------------------------------------
const APP_ID = 755419650 // <--- YOUR REAL APP ID IS NOW SET!

type PageType = 'home' | 'staking' | 'study-circle' | 'vault'

const CommitFi = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [isJoined, setIsJoined] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<PageType>('home')
  const { activeAddress, transactionSigner } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  // REAL BLOCKCHAIN INTERACTION
const handleJoinChallenge = async (stakeAmount: number) => {
    if (!activeAddress) {
      toggleWalletModal()
      return
    }

    try {
      // 1. Setup the Algorand Wrapper
      const algodConfig = getAlgodConfigFromViteEnvironment()
      const algorand = algokit.AlgorandClient.fromConfig({
        algodConfig,
      })
      algorand.setDefaultSigner(transactionSigner)

      // 2. Initialize the Contract Client
      const client = new CommitFiClient({
        algorand,
        appId: BigInt(APP_ID), // <--- FIXED: Converted number to BigInt
        defaultSender: activeAddress,
      })

      const stakeInMicroAlgo = stakeAmount * 1_000_000
      
      alert(`Please check your Pera Wallet to sign the transaction...`)

      // 3. Create the Payment Transaction
      const paymentTxn = await algorand.createTransaction.payment({
        sender: activeAddress,
        receiver: client.appAddress,
        amount: algokit.microAlgos(stakeInMicroAlgo)
      })

      // 4. Call the Smart Contract
      await client.send.optIn.joinPool({
        args: {
          payment: paymentTxn 
        },
        extraFee: algokit.microAlgos(2000)
      })

      alert(`🎉 Success! You have officially staked ${stakeAmount} ALGO!`)
setIsJoined(true)
      
    } catch (e) {
      console.error(e)
      alert(`Transaction Failed: ${(e as Error).message}`)
    }
  }

  const renderCurrentPage = () => {
    const commonProps = {
      activeAddress,
      appId: BigInt(APP_ID),
      onJoin: handleJoinChallenge, // Reusing your existing join logic
      isJoined: isJoined}
    switch (currentPage) {
      case 'staking':
        return <Staking />
      case 'study-circle':
        return <StudyCircle />
      case 'vault':
        return <FutureSelfVault />
      default:
        return (
          <section className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-8">
                <h2 className="text-5xl md:text-7xl font-cyber font-bold mb-4 bg-gradient-to-r from-neon-green via-neon-blue to-neon-purple bg-clip-text text-transparent animate-pulse-slow">
                  STOP PROCRASTINATING
                </h2>
                <h3 className="text-4xl md:text-6xl font-cyber font-bold mb-6 text-white">
                  START <span className="text-neon-green">STAKING</span>
                </h3>
              </div>
              
              <p className="text-xl md:text-2xl text-gray-400 mb-12 font-mono leading-relaxed">
                Bet on your own success.{' '}
                <span className="text-neon-green">Complete the task</span> or{' '}
                <span className="text-neon-pink">lose your stake</span>.
              </p>

              {/* Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="bg-cyber-dark/50 backdrop-blur-sm border border-neon-green/20 rounded-lg p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-bold text-neon-green font-mono">2,847</div>
                  <div className="text-sm text-gray-400 font-mono mt-1">ACTIVE CHALLENGES</div>
                </div>
                <div className="bg-cyber-dark/50 backdrop-blur-sm border border-neon-blue/20 rounded-lg p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-bold text-neon-blue font-mono">15,234</div>
                  <div className="text-sm text-gray-400 font-mono mt-1">ALGO STAKED</div>
                </div>
                <div className="bg-cyber-dark/50 backdrop-blur-sm border border-neon-purple/20 rounded-lg p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-bold text-neon-purple font-mono">89%</div>
                  <div className="text-sm text-gray-400 font-mono mt-1">SUCCESS RATE</div>
                </div>
              </div>
            </div>

            {/* Challenge Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
              <ChallengeCard 
                stakeAmount={10} 
                deadline={Math.floor(Date.now() / 1000) + 86400} 
                onJoin={() => handleJoinChallenge(10)} 
              />
              <ChallengeCard 
                stakeAmount={50} 
                deadline={Math.floor(Date.now() / 1000) - 100} 
                onJoin={() => alert('This one is expired!')}
              />
              <ChallengeCard 
                stakeAmount={25} 
                deadline={Math.floor(Date.now() / 1000) + 172800} 
                onJoin={() => handleJoinChallenge(25)} 
              />
            </div>
          </section>
        )
    }
  }

  return (
    <div className="min-h-screen bg-cyber-black text-white relative overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-black via-cyber-dark to-cyber-black">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[linear-gradient(0deg,transparent_24%,rgba(0,255,136,0.05)_25%,rgba(0,255,136,0.05)_26%,transparent_27%,transparent_74%,rgba(0,255,136,0.05)_75%,rgba(0,255,136,0.05)_76%,transparent_77%,transparent)] bg-[size:50px_50px]"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full p-6 flex justify-between items-center bg-cyber-dark/80 backdrop-blur-lg border-b border-neon-green/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neon-green rounded-lg flex items-center justify-center animate-cyber-pulse">
            <span className="text-cyber-black font-bold text-xl">CF</span>
          </div>
          <h1 className="text-2xl font-cyber font-bold text-neon-green tracking-wider">COMMIT-FI</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <button 
            className={`transition-colors duration-300 font-mono text-sm ${
              currentPage === 'home' ? 'text-neon-green' : 'text-gray-400 hover:text-neon-green'
            }`}
            onClick={() => setCurrentPage('home')}
          >
            DASHBOARD
          </button>
          <button 
            className={`transition-colors duration-300 font-mono text-sm ${
              currentPage === 'staking' ? 'text-neon-green' : 'text-gray-400 hover:text-neon-green'
            }`}
            onClick={() => setCurrentPage('staking')}
          >
            STAKING
          </button>
          <button 
            className={`transition-colors duration-300 font-mono text-sm ${
              currentPage === 'study-circle' ? 'text-neon-green' : 'text-gray-400 hover:text-neon-green'
            }`}
            onClick={() => setCurrentPage('study-circle')}
          >
            STUDY CIRCLE
          </button>
          <button 
            className={`transition-colors duration-300 font-mono text-sm ${
              currentPage === 'vault' ? 'text-neon-green' : 'text-gray-400 hover:text-neon-green'
            }`}
            onClick={() => setCurrentPage('vault')}
          >
            VAULT
          </button>
        </nav>

        <button
          className="relative px-6 py-3 bg-gradient-to-r from-neon-green to-neon-blue text-cyber-black font-bold rounded-lg font-mono text-sm hover:shadow-lg hover:shadow-neon-green/50 transition-all duration-300 transform hover:scale-105"
          onClick={toggleWalletModal}
        >
          <span className="relative z-10">
            {activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : 'CONNECT WALLET'}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg blur opacity-50"></div>
        </button>
      </header>

      {/* Main Content */}
      {renderCurrentPage()}

      {/* Footer */}
      {currentPage === 'home' && (
        <footer className="relative z-10 w-full p-6 text-center border-t border-neon-green/20 bg-cyber-dark/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto">
            <div className="text-gray-400 font-mono text-sm mb-4 md:mb-0">
              Built for Hackspiration '26 on Algorand
            </div>
            <div className="flex gap-6">
              <button className="text-gray-400 hover:text-neon-green transition-colors duration-300 font-mono text-sm">DOCS</button>
              <button className="text-gray-400 hover:text-neon-green transition-colors duration-300 font-mono text-sm">GITHUB</button>
              <button className="text-gray-400 hover:text-neon-green transition-colors duration-300 font-mono text-sm">DISCORD</button>
            </div>
          </div>
        </footer>
      )}

      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
    </div>
  )
}

export default CommitFi