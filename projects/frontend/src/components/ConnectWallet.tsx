import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import Account from "./Account";

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  return (
    <dialog 
      id="connect_wallet_modal" 
      className={`modal ${openModal ? 'modal-open' : ''} backdrop-blur-sm`}
    >
      <div className="modal-box bg-cyber-dark border border-neon-green/20 rounded-lg max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-cyber font-bold text-2xl text-neon-green">
            CONNECT WALLET
          </h3>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-neon-green transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Connected Account */}
        {activeAddress && (
          <div className="mb-6">
            <div className="bg-cyber-black/50 rounded-lg p-4 border border-neon-green/10">
              <div className="text-xs text-gray-500 font-mono mb-2">CONNECTED ACCOUNT</div>
              <Account />
            </div>
            <div className="border-t border-neon-green/10 my-6"></div>
          </div>
        )}

        {/* Wallet Options */}
        <div className="space-y-3">
          {!activeAddress &&
            wallets?.map((wallet) => (
              <button
                data-test-id={`${wallet.id}-connect`}
                className="w-full p-4 bg-cyber-black/30 border border-neon-green/20 rounded-lg flex items-center gap-4 hover:bg-cyber-black/50 hover:border-neon-green/50 transition-all duration-300 transform hover:scale-105 group"
                key={`provider-${wallet.id}`}
                onClick={() => {
                  return wallet.connect()
                }}
              >
                <div className="w-12 h-12 bg-neon-green/10 rounded-lg flex items-center justify-center group-hover:bg-neon-green/20 transition-colors duration-300">
                  {!isKmd(wallet) ? (
                    <img
                      alt={`wallet_icon_${wallet.id}`}
                      src={wallet.metadata.icon}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-neon-green rounded flex items-center justify-center">
                      <span className="text-cyber-black font-bold text-sm">KMD</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-mono font-semibold">
                    {isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {isKmd(wallet) ? 'Development wallet' : wallet.id}
                  </div>
                </div>
                <div className="text-neon-green">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            data-test-id="close-wallet-modal"
            className="flex-1 px-4 py-3 bg-cyber-gray text-gray-400 rounded-lg font-mono text-sm hover:bg-cyber-gray/80 transition-colors duration-300"
            onClick={closeModal}
          >
            CLOSE
          </button>
          {activeAddress && (
            <button
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-mono text-sm hover:from-red-600 hover:to-red-700 transition-all duration-300"
              data-test-id="logout"
              onClick={async () => {
                if (wallets) {
                  const activeWallet = wallets.find((w) => w.isActive)
                  if (activeWallet) {
                    await activeWallet.disconnect()
                  } else {
                    // Required for logout/cleanup of inactive providers
                    // For instance, when you login to localnet wallet and switch network
                    // to testnet/mainnet or vice verse.
                    localStorage.removeItem('@txnlab/use-wallet:v3')
                    window.location.reload()
                  }
                }
              }}
            >
              DISCONNECT
            </button>
          )}
        </div>
      </div>
    </dialog>
  )
}
export default ConnectWallet
