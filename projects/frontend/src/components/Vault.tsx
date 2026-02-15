import { useEffect, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore'
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

  // 1. Fetch Data (Same as before)
  useEffect(() => {
    if (!activeAddress) return

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

  // 2. Leader Decisions (Same as before)
  const handleDecision = async (reqId: string, decision: "approved" | "rejected") => {
    await updateDoc(doc(db, "requests", reqId), { status: decision })
  }

  // --------------------------------------------------------
  // NEW: HANDLE MEMBER PAYMENT & ENTRY
  // --------------------------------------------------------
  const handlePayAndEnter = async (challengeId: string) => {
    if (!activeAddress) return alert("Connect Wallet")
    setLoading(true)

    try {
      // A. Get Challenge Details (We need App ID + Stake Amount)
      const challengeSnap = await getDoc(doc(db, "challenges", challengeId))
      if (!challengeSnap.exists()) throw new Error("Challenge not found")
      
      const challengeData = challengeSnap.data()
      const appId = BigInt(challengeData.appId)
      const stakeAmount = challengeData.stakeAmount

      // B. Check if already opted in (Prevent Double Payment)
      const algodConfig = getAlgodConfigFromViteEnvironment()
      const algorand = algokit.AlgorandClient.fromConfig({ algodConfig })
      algorand.setDefaultSigner(transactionSigner)
      
      const accountInfo = await algorand.client.algod.accountInformation(activeAddress).do()
      const hasOptedIn = accountInfo.appsLocalState?.some((a: any) => a.id === Number(appId))

      if (hasOptedIn) {
        // If already paid, just enter
        onViewDetails(challengeId)
        setLoading(false)
        return
      }

      // C. Perform Transaction (Join Pool)
      console.log(`Joining App ${appId} with ${stakeAmount} ALGO`)
      
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

      alert("Stake Paid! Welcome to the circle.")
      onViewDetails(challengeId)

    } catch (e) {
      console.error(e)
      // Check for specific error (User rejected)
      if((e as Error).message.includes("cancelled")) {
          alert("Transaction Cancelled")
      } else {
          // If error is "User has already opted in", let them pass
          if ((e as Error).message.includes("has already opted in")) {
              onViewDetails(challengeId)
          } else {
              alert(`Payment Failed: ${(e as Error).message}`)
          }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`max-w-7xl mx-auto py-12 px-6 grid grid-cols-1 ${selectionMode ? 'justify-center' : 'md:grid-cols-2'} gap-8`}>
      
      {/* SECTION 1: MY CHALLENGES */}
      <div className={`bg-cyber-dark/40 p-8 rounded-xl border ${selectionMode ? 'border-neon-green/50 shadow-[0_0_30px_rgba(0,255,136,0.1)] max-w-3xl mx-auto w-full' : 'border-neon-blue/20'}`}>
        <h2 className={`text-3xl font-cyber mb-6 ${selectionMode ? 'text-neon-green text-center' : 'text-neon-blue'}`}>
          {selectionMode ? "SELECT A CIRCLE TO ENTER" : "MY CHALLENGES"}
        </h2>
        
        {myRequests.length === 0 && (
          <p className="text-gray-500 font-mono text-center">
            {selectionMode ? "You haven't been approved for any circles yet." : "You haven't joined any challenges."}
          </p>
        )}
        
        <div className="space-y-4">
          {myRequests.map(req => (
            <div key={req.id} className="bg-black/40 p-6 rounded-lg border border-gray-800 flex justify-between items-center hover:border-gray-600 transition-all">
              <div>
                 <div className="text-sm text-gray-400 font-mono mb-1">CHALLENGE ID</div>
                 <div className="text-white font-bold font-mono text-lg">{req.challengeId.slice(0,8)}...</div>
                 {!selectionMode && (
                   <div className={`text-xs mt-1 font-bold ${req.status === 'approved' ? 'text-neon-green' : 'text-yellow-500'}`}>
                      STATUS: {req.status.toUpperCase()}
                   </div>
                 )}
              </div>
              
              {/* BUTTON: Triggers Payment First */}
              {req.status === 'approved' ? (
                 <button 
                   onClick={() => handlePayAndEnter(req.challengeId)}
                   disabled={loading}
                   className="px-8 py-3 bg-neon-green text-black font-bold font-mono rounded hover:shadow-[0_0_20px_rgba(0,255,136,0.6)] hover:scale-105 transition transform disabled:opacity-50"
                 >
                   {loading ? "PAYING..." : "PAY & ENTER →"}
                 </button>
              ) : (
                <span className="text-yellow-500 font-mono text-sm border border-yellow-500/30 px-3 py-1 rounded">PENDING</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: LEADER DASHBOARD (HIDDEN IN SELECTION MODE) */}
      {!selectionMode && (
        <div className="bg-cyber-dark/40 p-8 rounded-xl border border-neon-green/20">
          <h2 className="text-3xl font-cyber text-neon-green mb-6">INCOMING REQUESTS</h2>
          {incomingRequests.length === 0 && <p className="text-gray-500 font-mono">No pending requests.</p>}

          <div className="space-y-4">
            {incomingRequests.map(req => (
              <div key={req.id} className="bg-black/40 p-6 rounded-lg border border-gray-800">
                <div className="flex justify-between mb-4 font-mono">
                    <span className="text-white font-bold">{req.applicant.slice(0,6)}...</span>
                    <span className="text-gray-500 text-sm">wants to join</span>
                </div>
                <div className="flex gap-4">
                    <button 
                      onClick={() => handleDecision(req.id, 'approved')}
                      className="flex-1 py-2 bg-neon-green/20 text-neon-green border border-neon-green rounded hover:bg-neon-green hover:text-black transition font-bold font-mono"
                    >
                      ACCEPT
                    </button>
                    <button 
                      onClick={() => handleDecision(req.id, 'rejected')}
                      className="flex-1 py-2 bg-red-500/10 text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-white transition font-bold font-mono"
                    >
                      DECLINE
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
export default Vault