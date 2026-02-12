import { useWallet } from '@txnlab/use-wallet-react'
import { useState } from 'react'
import ChallengeCard from './ChallengeCard'
import ConnectWallet from './ConnectWallet'

const CommitFi = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const handleJoinChallenge = () => {
    if (!activeAddress) {
      alert('Please connect your wallet first!')
      return
    }
    alert(`Joining Challenge with address: ${activeAddress}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center">
      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold text-yellow-400">Commit-Fi 🚀</h1>
        <div className="flex gap-4">
           <button
            className="btn btn-warning px-4 py-2 rounded-full font-bold text-black"
            onClick={toggleWalletModal}
          >
            {activeAddress ? 'Wallet Connected' : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-10 gap-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold mb-4">Stop Procrastinating. Start Staking.</h2>
          <p className="text-gray-400 text-lg">
            Bet on your own success. Complete the task or lose your stake.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChallengeCard 
            stakeAmount={10} 
            deadline={Math.floor(Date.now() / 1000) + 86400} 
            onJoin={handleJoinChallenge}
          />
           <ChallengeCard 
            stakeAmount={50} 
            deadline={Math.floor(Date.now() / 1000) - 100} 
            onJoin={() => alert('This one is expired!')}
          />
        </div>
      </main>

      <footer className="w-full p-4 text-center text-gray-600 border-t border-gray-800">
        Built for Hackspiration '26 on Algorand
      </footer>

      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
    </div>
  )
}

export default CommitFi