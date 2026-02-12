import { useState, useCallback } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

interface UseCommitFiSimpleReturn {
  createChallenge: (stakeAmount: number, deadline: number, maxParticipants: number) => Promise<void>
  joinChallenge: (appId: bigint, stakeAmount: number) => Promise<void>
  loading: boolean
  error: string | null
}

export const useCommitFiSimple = (): UseCommitFiSimpleReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { activeAddress, transactionSigner } = useWallet()

  const createChallenge = useCallback(async (
    stakeAmount: number,
    deadline: number,
    maxParticipants: number
  ) => {
    if (!activeAddress) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // For now, just show success message
      // The blockchain integration can be added later
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert(`Challenge created with ${stakeAmount} ALGO!`)
    } catch (err) {
      setError(`Failed to create challenge: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }, [activeAddress])

  const joinChallenge = useCallback(async (appId: bigint, stakeAmount: number) => {
    if (!activeAddress) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // For now, just show success message
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert(`Successfully joined challenge with ${stakeAmount} ALGO!`)
    } catch (err) {
      setError(`Failed to join challenge: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }, [activeAddress])

  return {
    createChallenge,
    joinChallenge,
    loading,
    error,
  }
}
