import { useEffect, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../utils/Firebase'
import * as algokit from '@algorandfoundation/algokit-utils'
import { CommitFiClient } from '../contracts/CommitFiClient'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface VaultProps {
  onViewDetails: (id: string) => void
  selectionMode?: boolean
}

const Vault = ({ onViewDetails, selectionMode = false }: VaultProps) => {
  const { activeAddress, transactionSigner } = useWallet()
  const [myRequests, setMyRequests] = useState<any[]>([])
  const [incomingRequests, setIncomingRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [reputation, setReputation] = useState(100) // Default Reputation

  useEffect(() => {
    if (!activeAddress) return

    // 1. Fetch User Reputation
    const fetchRep = async () => {
        const userRef = doc(db, "users", activeAddress)
        const snap = await getDoc(userRef)
        if (snap.exists()) {
            setReputation(snap.data().reputation)
        } else {
            // Create user if not exists
            await setDoc(userRef, { reputation: 100 })
        }
    }
    fetchRep()

    // 2. Fetch Requests
    const q1 = query(collection(db, "requests"), where("applicant", "==", activeAddress))
    onSnapshot(q1, (snap) => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()}))
      if (selectionMode) {
        setMyRequests(data.filter((r: any) => r.status === 'approved'))
      } else {
        setMyRequests(data)
      }
    })

    if (!selectionMode) {
      const q2 = query(collection(db, "requests"), where("leader", "==", activeAddress), where("status", "==", "pending"))
      onSnapshot(q2, (snap) => setIncomingRequests(snap.docs.map(d => ({id: d.id, ...d.data()})) ))
    }
  }, [activeAddress, selectionMode])

  const handleDecision = async (reqId: string, decision: "approved" | "rejected") => {
    await updateDoc(doc(db, "requests", reqId), { status: decision })
  }

  const handlePayAndEnter = async (challengeId: string) => {
    // ... (Keep existing payment logic same as previous step) ...
    // For brevity, assuming the payment logic from previous messages is preserved here
    if (!activeAddress) return alert("Connect Wallet")
    setLoading(true)
    try {
      const challengeSnap = await getDoc(doc(db, "challenges", challengeId))
      if (!challengeSnap.exists()) throw new Error("Challenge not found")
      
      const challengeData = challengeSnap.data()
      const appId = BigInt(challengeData.appId)
      const stakeAmount = challengeData.stakeAmount

      const algodConfig = getAlgodConfigFromViteEnvironment()
      const algorand = algokit.AlgorandClient.fromConfig({ algodConfig })
      algorand.setDefaultSigner(transactionSigner)
      
      const accountInfo = await algorand.client.algod.accountInformation(activeAddress).do()
      const hasOptedIn = accountInfo.appsLocalState?.some((a: any) => a.id === Number(appId))

      if (hasOptedIn) {
        onViewDetails(challengeId)
        setLoading(false)
        return
      }

      const client = new CommitFiClient({
        algorand,
        appId: appId,
        defaultSender: activeAddress,
      })

      const paymentTxn = await algorand.createTransaction.payment({
        sender: activeAddress,
        receiver: client.appAddress,
        amount: algokit.microAlgos(stakeAmount * 1_000_000)
      })

      await client.send.optIn.joinPool({
        args: { payment: paymentTxn },
        extraFee: algokit.microAlgos(2000)
      })

      onViewDetails(challengeId)

    } catch (e) {
      console.error(e)
      if ((e as Error).message.includes("has already opted in")) {
           onViewDetails(challengeId)
      } else {
           alert(`Payment Failed: ${(e as Error).message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      
      {/* --- NEW: REPUTATION CARD --- */}
      {!selectionMode && (
          <div className="bg-gradient-to-r from-cyber-dark to-black border border-neon-blue/30 rounded-xl p-6 mb-8 flex items-center justify-between">
              <div>
                  <h2 className="text-2xl font-cyber text-white">WELCOME TO YOUR VAULT</h2>
                  <p className="text-gray-400 font-mono text-sm mt-1">Manage your stakes and approvals.</p>
              </div>
              <div className="text-right">
                  <div className="text-xs text-neon-blue font-bold uppercase tracking-widest">Reputation Score</div>
                  <div className="text-5xl font-mono font-bold text-white shadow-neon-blue drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                      {reputation}
                  </div>
              </div>
          </div>
      )}

      <div className={`grid grid-cols-1 ${selectionMode ? 'justify-center' : 'md:grid-cols-2'} gap-8`}>
        {/* ... (Rest of the Vault UI remains the same as before) ... */}
        
        {/* MY CHALLENGES */}
        <div className={`bg-cyber-dark/40 p-8 rounded-xl border ${selectionMode ? 'border-neon-green/50 w-full max-w-3xl mx-auto' : 'border-neon-blue/20'}`}>
             <h2 className={`text-3xl font-cyber mb-6 ${selectionMode ? 'text-neon-green text-center' : 'text-neon-blue'}`}>
                {selectionMode ? "SELECT A CIRCLE TO ENTER" : "MY CHALLENGES"}
             </h2>
             {myRequests.map(req => (
                <div key={req.id} className="bg-black/40 p-6 rounded-lg border border-gray-800 flex justify-between items-center mb-4">
                    <div>
                        <div className="text-sm text-gray-400 font-mono mb-1">CHALLENGE ID</div>
                        <div className="text-white font-bold">{req.challengeId.slice(0,8)}...</div>
                        {!selectionMode && <div className="text-xs text-neon-green mt-1">STATUS: {req.status.toUpperCase()}</div>}
                    </div>
                    {req.status === 'approved' ? (
                        <button onClick={() => handlePayAndEnter(req.challengeId)} disabled={loading} className="px-6 py-2 bg-neon-green text-black font-bold rounded hover:opacity-90">
                            {loading ? "..." : "PAY & ENTER"}
                        </button>
                    ) : <span className="text-yellow-500 text-sm">PENDING</span>}
                </div>
             ))}
        </div>

        {/* INCOMING REQUESTS (Leader) */}
        {!selectionMode && (
            <div className="bg-cyber-dark/40 p-8 rounded-xl border border-neon-green/20">
                <h2 className="text-3xl font-cyber text-neon-green mb-6">INCOMING REQUESTS</h2>
                {incomingRequests.map(req => (
                    <div key={req.id} className="bg-black/40 p-6 rounded-lg border border-gray-800 mb-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-white font-bold">{req.applicant.slice(0,6)}...</span>
                            <span className="text-gray-500 text-xs">wants to join</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleDecision(req.id, 'approved')} className="flex-1 bg-neon-green/20 text-neon-green border border-neon-green rounded py-1 text-xs font-bold">ACCEPT</button>
                            <button onClick={() => handleDecision(req.id, 'rejected')} className="flex-1 bg-red-500/20 text-red-500 border border-red-500 rounded py-1 text-xs font-bold">DECLINE</button>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  )
}
export default Vault