import { useEffect, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../utils/Firebase'
import * as algokit from '@algorandfoundation/algokit-utils'
import { CommitFiClient } from '../contracts/CommitFiClient'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { APP_ID } from './CommitFi'

interface StudyCircleProps {
  challengeId: string
}

interface Participant {
  address: string
  role: 'leader' | 'member'
  submission?: any
}

const StudyCircle = ({ challengeId }: StudyCircleProps) => {
  const { activeAddress, transactionSigner } = useWallet()
  
  const [challenge, setChallenge] = useState<any>(null)
  const [members, setMembers] = useState<string[]>([]) 
  const [submissions, setSubmissions] = useState<any[]>([]) 
  const [mySubmission, setMySubmission] = useState<any>(null)
  const [proofLink, setProofLink] = useState('')

  // ------------------------------------------------
  // 1. FETCH DATA
  // ------------------------------------------------
  useEffect(() => {
    if (!challengeId) return

    // A. Fetch Challenge Details
    getDoc(doc(db, "challenges", challengeId)).then(snap => {
      if (snap.exists()) {
        setChallenge({ id: snap.id, ...snap.data() })
      }
    })

    // B. Fetch Approved Members
    const qMembers = query(
      collection(db, "requests"), 
      where("challengeId", "==", challengeId), 
      where("status", "==", "approved")
    )
    onSnapshot(qMembers, (snap) => {
        setMembers(snap.docs.map(d => d.data().applicant))
    })

    // C. Fetch Submissions
    const qSubs = query(collection(db, "submissions"), where("challengeId", "==", challengeId))
    onSnapshot(qSubs, (snap) => {
      const subs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setSubmissions(subs)
      if (activeAddress) {
        setMySubmission(subs.find((s: any) => s.user === activeAddress))
      }
    })
  }, [challengeId, activeAddress])


  // ------------------------------------------------
  // 2. SUBMIT PROOF
  // ------------------------------------------------
  const handleSubmit = async () => {
    if (!proofLink || !activeAddress) return
    
    try {
      await addDoc(collection(db, "submissions"), {
        challengeId,
        user: activeAddress,
        proof: proofLink,
        status: "pending", 
        timestamp: Date.now()
      })
      setProofLink('')
      alert("Proof Submitted! Wait for Leader verification.")
    } catch (e) {
      console.error(e)
      alert("Error submitting proof")
    }
  }

  // ------------------------------------------------
  // 3. VERIFY MEMBER
  // ------------------------------------------------
  const handleVerify = async (submissionId: string, participantAddress: string) => {
    if (!activeAddress) return

    try {
      const algodConfig = getAlgodConfigFromViteEnvironment()
      const algorand = algokit.AlgorandClient.fromConfig({ algodConfig })
      algorand.setDefaultSigner(transactionSigner)
      const appId = BigInt(challenge.appId)

      const client = new CommitFiClient({
        algorand,
        appId: appId,
        defaultSender: activeAddress,
      })

      alert(`Please sign the transaction to verify ${participantAddress.slice(0,4)}...`)

      await client.send.verifyParticipant({
        args: { participant: participantAddress, isValid: true },
        extraFee: algokit.microAlgos(2000)
      })

      await updateDoc(doc(db, "submissions", submissionId), { status: "verified" })
      alert("Member Verified on Blockchain! 🎉")

    } catch (e) {
      console.error(e)
      alert(`Verification Failed: ${(e as Error).message}`)
    }
  }

  // ------------------------------------------------
  // 4. PREPARE LEADERBOARD DATA
  // ------------------------------------------------
  if (!challenge) return <div className="text-center p-20 animate-pulse text-neon-green font-mono">LOADING DATA STREAM...</div>

  // A. Combine Leader + Members into one list
  const allParticipants: Participant[] = [
    { address: challenge.creator, role: 'leader' },
    ...members.map(addr => ({ address: addr, role: 'member' } as Participant))
  ]

  // B. Attach submission data if exists
  const leaderboardData = allParticipants.map(p => {
    const sub = submissions.find(s => s.user === p.address)
    return { ...p, submission: sub }
  })

  // C. Sort: Verified > Pending > Not Submitted
  leaderboardData.sort((a, b) => {
    // 1. If one submitted and other didn't, submitter wins
    if (a.submission && !b.submission) return -1
    if (!a.submission && b.submission) return 1
    
    // 2. If both submitted, compare status (Verified > Pending)
    if (a.submission && b.submission) {
        if (a.submission.status === 'verified' && b.submission.status !== 'verified') return -1
        if (a.submission.status !== 'verified' && b.submission.status === 'verified') return 1
        // 3. If status same, compare timestamp (Earliest wins)
        return a.submission.timestamp - b.submission.timestamp
    }
    return 0 // Both not submitted = Tie
  })

  const isLeader = activeAddress === challenge.creator
  const now = Math.floor(Date.now() / 1000)
  const timeLeft = Math.max(0, challenge.deadline - now)
  const hoursLeft = Math.floor(timeLeft / 3600)

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-700 pb-8 mb-8">
        <div className="max-w-3xl">
            <h1 className="text-5xl font-cyber text-neon-green mb-4 tracking-wide">{challenge.title.toUpperCase()}</h1>
            <div className="bg-black/40 p-6 border-l-4 border-neon-blue rounded-r-lg backdrop-blur-sm">
               <h4 className="text-neon-blue text-xs font-bold uppercase mb-2 tracking-widest">CHALLENGE BRIEF</h4>
               <p className="text-gray-300 font-mono text-sm leading-relaxed">
                   {challenge.description || "No description provided."}
               </p>
            </div>
        </div>

        <div className="text-right mt-6 md:mt-0 min-w-[200px]">
            <div className="text-xs text-gray-500 font-mono uppercase mb-1 tracking-widest">Time Remaining</div>
            <div className={`text-5xl font-mono font-bold ${hoursLeft < 24 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {hoursLeft}H : {Math.floor((timeLeft % 3600) / 60)}M
            </div>
            <div className="mt-4 inline-block bg-neon-green/10 px-6 py-2 rounded border border-neon-green/30">
               <span className="text-gray-400 text-xs uppercase mr-2 font-mono">Stake</span>
               <span className="text-neon-green font-bold text-xl font-mono">{challenge.stakeAmount} ₳</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACTION AREA */}
        <div className="lg:col-span-1 space-y-8">
            {/* Template Card */}
            <div className="bg-cyber-dark/40 border border-neon-blue/30 p-6 rounded-xl relative overflow-hidden group hover:border-neon-blue/60 transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-transparent"></div>
                <h3 className="text-neon-blue font-cyber mb-4 tracking-wider">SUBMISSION TEMPLATE</h3>
                <div className="bg-black/50 p-4 rounded text-sm text-gray-300 font-mono break-all border border-dashed border-gray-700 mb-4">
                    {challenge.templateUrl || "No template provided."}
                </div>
                {challenge.templateUrl && (
                  <a href={challenge.templateUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full py-3 bg-neon-blue/10 text-neon-blue text-xs font-bold hover:bg-neon-blue hover:text-black transition uppercase rounded font-mono">
                     OPEN TEMPLATE ↗
                  </a>
                )}
            </div>

            {/* My Submission Status */}
            <div className="bg-cyber-dark/40 border border-neon-green/30 p-6 rounded-xl">
                <h3 className="text-neon-green font-cyber mb-4 tracking-wider">YOUR PROGRESS</h3>
                {mySubmission ? (
                    <div className="text-center py-6 bg-black/20 rounded-lg">
                        <div className={`text-6xl mb-4 transform transition-all duration-500 ${mySubmission.status === 'verified' ? 'grayscale-0 scale-110' : 'grayscale scale-100'}`}>
                            {mySubmission.status === 'verified' ? '✅' : '⏳'}
                        </div>
                        <div className={`font-bold uppercase tracking-widest ${mySubmission.status === 'verified' ? 'text-neon-green' : 'text-yellow-500'}`}>
                            {mySubmission.status === 'verified' ? 'VERIFIED' : 'PENDING REVIEW'}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input 
                            className="w-full bg-black/50 border border-gray-600 rounded p-4 text-white text-sm focus:border-neon-green outline-none font-mono"
                            placeholder="Paste link to your proof..."
                            value={proofLink}
                            onChange={(e) => setProofLink(e.target.value)}
                        />
                        <button 
                            onClick={handleSubmit}
                            disabled={!proofLink}
                            className="w-full py-3 bg-neon-green text-black font-bold font-mono rounded hover:shadow-[0_0_15px_rgba(0,255,136,0.5)] transition disabled:opacity-50 uppercase tracking-wider"
                        >
                            SUBMIT PROOF
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT COLUMN: LEADERBOARD */}
        <div className="lg:col-span-2">
            <div className="bg-cyber-dark/40 border border-gray-700 rounded-xl overflow-hidden min-h-[500px]">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-black/20">
                    <h3 className="text-white font-cyber tracking-widest">LIVE LEADERBOARD</h3>
                    <div className="text-xs font-mono text-neon-blue border border-neon-blue/30 px-3 py-1.5 rounded">
                        {leaderboardData.length} MEMBERS ENROLLED
                    </div>
                </div>

                <div className="divide-y divide-gray-800/50">
                    {leaderboardData.map((person, index) => {
                        // Rank Logic: If not submitted, rank = total participants
                        const rank = person.submission ? index + 1 : leaderboardData.length
                        const isMe = person.address === activeAddress

                        return (
                            <div key={person.address} className={`p-4 flex flex-col md:flex-row items-center gap-4 transition duration-200 ${isMe ? 'bg-white/5 border-l-2 border-neon-green' : 'hover:bg-white/5'}`}>
                                
                                {/* Rank Circle */}
                                <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full font-mono text-sm ${
                                    !person.submission ? 'bg-gray-800 text-gray-500' :
                                    rank === 1 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 
                                    rank === 2 ? 'bg-gray-400 text-black' : 
                                    rank === 3 ? 'bg-orange-700 text-white' : 'bg-gray-700 text-white'
                                }`}>
                                    {rank}
                                </div>

                                {/* User Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-mono text-sm ${isMe ? 'text-neon-green font-bold' : 'text-white'}`}>
                                            {isMe ? "YOU" : `${person.address.slice(0,6)}...${person.address.slice(-4)}`}
                                        </span>
                                        {person.role === 'leader' && (
                                            <span className="text-[10px] bg-neon-blue/20 text-neon-blue px-2 py-0.5 rounded border border-neon-blue/30 uppercase font-bold">
                                                LEADER
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Proof Link or Status */}
                                    {person.submission ? (
                                        <a href={person.submission.proof} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-neon-green underline font-mono block mt-1">
                                            {person.submission.proof.length > 40 ? person.submission.proof.slice(0, 40) + '...' : person.submission.proof}
                                        </a>
                                    ) : (
                                        <span className="text-xs text-gray-600 font-mono italic mt-1 block">
                                            Not submitted yet
                                        </span>
                                    )}
                                </div>

                                {/* Status Badge */}
                                <div className={`px-3 py-1 rounded text-[10px] font-bold font-mono uppercase tracking-wide ${
                                    !person.submission ? 'bg-gray-800 text-gray-500 border border-gray-700' :
                                    person.submission.status === 'verified' ? 'bg-neon-green/20 text-neon-green border border-neon-green/50' : 
                                    'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                                }`}>
                                    {person.submission ? person.submission.status : 'WAITING'}
                                </div>

                                {/* LEADER ACTIONS */}
                                {isLeader && person.submission && person.submission.status !== 'verified' && (
                                    <button 
                                        onClick={() => handleVerify(person.submission.id, person.address)}
                                        className="px-4 py-2 bg-gradient-to-r from-neon-green to-neon-blue text-black font-bold text-[10px] rounded shadow-lg hover:shadow-neon-green/50 transition transform hover:scale-105 uppercase tracking-wider font-mono"
                                    >
                                        VERIFY
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>

      </div>
    </div>
  )
}

export default StudyCircle