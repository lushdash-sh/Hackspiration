// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
const { activeAddress } = useWallet()

const toggleWalletModal = () => {
setOpenWalletModal(!openWalletModal)
}

return (
<div className="min-h-screen bg-gray-900 text-white relative">
<div className="absolute top-4 right-4 z-10">
<button
data-test-id="connect-wallet"
className="btn btn-warning px-5 py-2 text-sm font-medium rounded-full shadow-md"
onClick={toggleWalletModal}
>
{activeAddress ? 'Wallet Connected' : 'Connect Wallet'}
</button>
</div>
</div>
)
}

export default Home