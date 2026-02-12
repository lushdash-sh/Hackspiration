import React from 'react'

interface ChallengeCardProps {
  stakeAmount: number
  deadline: number
  onJoin: () => void
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ stakeAmount, deadline, onJoin }) => {
  const isExpired = Date.now() / 1000 > deadline

  return (
    <div className="card w-96 bg-base-100 shadow-xl border border-gray-700">
      <div className="card-body">
        <h2 className="card-title text-primary">DSA Sprint Challenge</h2>
        <p>Commit to finishing your Data Structures assignment!</p>
        
        <div className="stats shadow my-4 bg-gray-800">
          <div className="stat place-items-center">
            <div className="stat-title">Entry Fee</div>
            <div className="stat-value text-secondary">{stakeAmount} ALGO</div>
          </div>
        </div>

        <div className="card-actions justify-end">
          <button 
            className={`btn btn-primary w-full ${isExpired ? 'btn-disabled' : ''}`}
            onClick={onJoin}
          >
            {isExpired ? 'Expired' : 'Join Challenge'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChallengeCard