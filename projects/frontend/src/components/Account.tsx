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
    <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full border border-gray-600">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
      <span className="font-mono text-sm text-white" title={activeAddress}>
        {address}
      </span>
      <a
        className="text-xs text-blue-400 hover:text-blue-300 ml-2"
        href={`https://lora.algokit.io/testnet/account/${activeAddress}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        View
      </a>
    </div>
  )
}

export default Account