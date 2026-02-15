import { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../utils/Firebase' // REMOVED storage
import * as algokit from '@algorandfoundation/algokit-utils'
import { CommitFiFactory } from '../contracts/CommitFiClient'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

const Staking = ({ onCreated }: { onCreated: () => void }) => {
  const { activeAddress, transactionSigner } = useWallet()
  const [loading, setLoading] = useState(false)
  // REMOVED templateFile state
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stakeAmount: 10,
    maxMembers: 50,
    durationValue: 7,
    durationUnit: 'days',
    templateUrl: '' // We will paste the link here directly
  })

  const handleCreate = async () => {
    console.log("1. Button Clicked") 

    if (!activeAddress) return alert("Connect Wallet first")
    if (!formData.title || !formData.templateUrl) return alert("Please fill in all fields")

    setLoading(true)
    
    try {
      // SKIP UPLOAD STEP

      // ---------------------------------------------------------
      // STEP 1: CALCULATE DEADLINE
      // ---------------------------------------------------------
      let durationInSeconds = 0
      const { durationValue, durationUnit } = formData
      
      if (durationUnit === 'hours') durationInSeconds = durationValue * 3600
      else if (durationUnit === 'days') durationInSeconds = durationValue * 86400
      else if (durationUnit === 'months') durationInSeconds = durationValue * 30 * 86400
      
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + durationInSeconds
      console.log("2. Deadline Calculated:", deadlineTimestamp)

      // ---------------------------------------------------------
      // STEP 2: DEPLOY NEW SMART CONTRACT
      // ---------------------------------------------------------
      console.log("3. Initializing Algorand Client...")
      const algodConfig = getAlgodConfigFromViteEnvironment()
      const algorand = algokit.AlgorandClient.fromConfig({ algodConfig })
      algorand.setDefaultSigner(transactionSigner)

      console.log("4. Initializing Factory...")
      const factory = new CommitFiFactory({
        algorand,
        defaultSender: activeAddress
      })

      console.log("5. SENDING DEPLOY TRANSACTION... (Check Pera Wallet)")
      
      const { result, appClient } = await factory.send.create.createChallenge({
        args: {
          stakeAmountParam: BigInt(formData.stakeAmount * 1_000_000),
          deadlineParam: BigInt(deadlineTimestamp),
          maxParticipantsParam: BigInt(formData.maxMembers)
        }
      })
      console.log("6. Contract Deployed! New App ID:", result.appId)

      const newAppId = result.appId 
      const newAppAddress = result.appAddress

      // ---------------------------------------------------------
      // STEP 3: FUND & JOIN CONTRACT
      // ---------------------------------------------------------
      console.log("7. Funding Contract (Min Balance)...")
      await algorand.send.payment({
        sender: activeAddress,
        receiver: newAppAddress,
        amount: algokit.algo(0.2)
      })

      console.log("8. Joining Pool (Leader Stake)...")
      const paymentTxn = await algorand.createTransaction.payment({
        sender: activeAddress,
        receiver: newAppAddress,
        amount: algokit.microAlgos(formData.stakeAmount * 1_000_000)
      })

      await appClient.send.optIn.joinPool({
        args: { payment: paymentTxn },
        extraFee: algokit.microAlgos(2000)
      })
      console.log("9. Leader Joined Successfully")

      // ---------------------------------------------------------
      // STEP 4: SAVE TO FIREBASE
      // ---------------------------------------------------------
      console.log("10. Saving to Firestore...")
      await addDoc(collection(db, "challenges"), {
        title: formData.title,
        description: formData.description,
        stakeAmount: formData.stakeAmount,
        maxMembers: formData.maxMembers,
        templateUrl: formData.templateUrl, // Saving the text link
        creator: activeAddress,
        createdAt: Date.now(),
        deadline: deadlineTimestamp,
        appId: newAppId.toString()
      })

      console.log("11. SUCCESS!")
      alert("Challenge Created Successfully!")
      onCreated()

    } catch (e) {
      console.error("CRITICAL ERROR:", e)
      alert(`Creation Failed: ${(e as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
       <div className="bg-cyber-dark/30 border border-neon-green/20 p-8 rounded-xl backdrop-blur-md">
         <h2 className="text-4xl font-cyber text-neon-green mb-8 tracking-wide text-center">CREATE STAKE</h2>
         
         <div className="space-y-6">
            <div>
               <label className="block text-gray-400 font-mono text-xs uppercase mb-2">Challenge Title</label>
               <input 
                 className="w-full bg-black/40 border border-gray-700 rounded p-4 text-white focus:border-neon-green outline-none font-mono"
                 placeholder="e.g. DSA Sprint"
                 onChange={(e) => setFormData({...formData, title: e.target.value})}
               />
            </div>

            <div>
               <label className="block text-gray-400 font-mono text-xs uppercase mb-2">Description</label>
               <textarea 
                 className="w-full bg-black/40 border border-gray-700 rounded p-4 text-white focus:border-neon-green outline-none font-mono h-24 resize-none"
                 placeholder="Describe the goal..."
                 onChange={(e) => setFormData({...formData, description: e.target.value})}
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-gray-400 font-mono text-xs uppercase mb-2">Stake (ALGO)</label>
                   <input 
                     type="number"
                     className="w-full bg-black/40 border border-gray-700 rounded p-4 text-white focus:border-neon-green outline-none font-mono"
                     value={formData.stakeAmount}
                     onChange={(e) => setFormData({...formData, stakeAmount: Number(e.target.value)})}
                   />
                </div>
                <div>
                   <label className="block text-gray-400 font-mono text-xs uppercase mb-2">Duration</label>
                   <div className="flex">
                      <input 
                        type="number"
                        className="w-2/3 bg-black/40 border border-gray-700 rounded-l p-4 text-white focus:border-neon-green outline-none font-mono"
                        value={formData.durationValue}
                        onChange={(e) => setFormData({...formData, durationValue: Number(e.target.value)})}
                      />
                      <select 
                        className="w-1/3 bg-gray-900 border border-l-0 border-gray-700 rounded-r text-white focus:border-neon-green outline-none font-mono text-sm px-2 cursor-pointer"
                        value={formData.durationUnit}
                        onChange={(e) => setFormData({...formData, durationUnit: e.target.value})}
                      >
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="months">Months</option>
                      </select>
                   </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-gray-400 font-mono text-xs uppercase mb-2">Max Participants</label>
                   <input 
                     type="number"
                     className="w-full bg-black/40 border border-gray-700 rounded p-4 text-white focus:border-neon-green outline-none font-mono"
                     value={formData.maxMembers}
                     onChange={(e) => setFormData({...formData, maxMembers: Number(e.target.value)})}
                   />
                </div>
                
                {/* REVERTED TO TEXT INPUT */}
                <div>
                   <label className="block text-gray-400 font-mono text-xs uppercase mb-2">Submission Template URL</label>
                   <input 
                     className="w-full bg-black/40 border border-gray-700 rounded p-4 text-white focus:border-neon-green outline-none font-mono text-sm"
                     placeholder="https://drive.google.com/..."
                     value={formData.templateUrl}
                     onChange={(e) => setFormData({...formData, templateUrl: e.target.value})}
                   />
                </div>
            </div>

            <button 
               onClick={handleCreate}
               disabled={loading}
               className="w-full py-5 mt-4 bg-gradient-to-r from-neon-green to-neon-blue text-black font-bold font-mono text-xl rounded shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:shadow-[0_0_40px_rgba(0,255,136,0.6)] transition-all uppercase tracking-wider disabled:opacity-50"
            >
               {loading ? "DEPLOYING CONTRACT..." : "PAY STAKE & CREATE"}
            </button>
         </div>
       </div>
    </div>
  )
}
export default Staking