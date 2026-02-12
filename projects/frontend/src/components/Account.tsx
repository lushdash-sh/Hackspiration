import { useWallet } from '@txnlab/use-wallet-react'
import { useMemo } from 'react'
import { ellipseAddress } from '../utils/ellipseAddress'

const Account = () => {
  const { activeAddress } = useWallet()

  const address = useMemo(() => {
    if (!activeAddress) return ''
    // Shortens the address (e.g., "H7D...XYZ")
    return ellipseAddress(activeAddress)
  }, [activeAddress])

  if (!activeAddress) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-cyber-black/50 px-4 py-2 rounded-lg border border-neon-green/20">
        <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
        <span className="font-mono text-sm text-neon-green" title={activeAddress}>
          {address}
        </span>
      </div>
      <a
        className="text-xs text-neon-blue hover:text-neon-green transition-colors duration-300 font-mono"
        href={`https://lora.algokit.io/testnet/account/${activeAddress}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        [VIEW]
      </a>
    </div>
  )
}

export default Account