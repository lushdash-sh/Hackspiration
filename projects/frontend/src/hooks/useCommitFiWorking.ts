import { useState, useCallback } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { testStakeSystem } from '../utils/testStakeSystem'

// Run system test on initialization
testStakeSystem()

// Custom event for stake updates
const STAKE_UPDATE_EVENT = 'stakeUpdate'

interface UserStake {
  appId: bigint
  stakeAmount: number
  deadline: number
  status: 'joined' | 'verified' | 'withdrawn'
  proofSubmitted: boolean
  proofUrl?: string
  challengeType: 'individual' | 'circle'
  circleName?: string
}

interface UseCommitFiWorkingReturn {
  createChallenge: (stakeAmount: number, deadline: number, maxParticipants: number) => Promise<void>
  joinChallenge: (appId: bigint, stakeAmount: number) => Promise<void>
  createCircle: (name: string, stakeAmount: number, maxParticipants: number) => Promise<void>
  joinCircle: (circleId: string, stakeAmount: number) => Promise<void>
  submitProof: (appId: bigint, proofFile: File, description: string) => Promise<void>
  withdrawStake: (appId: bigint) => Promise<void>
  getUserStakes: () => Promise<UserStake[]>
  loading: boolean
  error: string | null
  STAKE_UPDATE_EVENT: string // Export the event name
}

export const useCommitFiWorking = (): UseCommitFiWorkingReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { activeAddress, transactionSigner } = useWallet()

  // Store stakes in localStorage for persistence
  const getStoredStakes = (): UserStake[] => {
    try {
      if (!activeAddress) {
        console.log('No active address, returning empty stakes')
        return []
      }
      const stored = localStorage.getItem(`userStakes_${activeAddress}`)
      console.log('Retrieved stakes for address:', activeAddress, stored)
      
      if (!stored) return []
      
      // Convert string appId back to BigInt
      const parsedStakes = JSON.parse(stored)
      return parsedStakes.map((stake: any) => ({
        ...stake,
        appId: BigInt(stake.appId)
      }))
    } catch (error) {
      console.error('Error retrieving stakes:', error)
      return []
    }
  }

  const storeStakes = (stakes: UserStake[]) => {
    try {
      if (!activeAddress) {
        console.log('No active address, cannot store stakes')
        return
      }
      console.log('Storing stakes for address:', activeAddress, stakes)
      
      // Convert BigInt to string for JSON serialization
      const serializableStakes = stakes.map(stake => ({
        ...stake,
        appId: stake.appId.toString()
      }))
      
      localStorage.setItem(`userStakes_${activeAddress}`, JSON.stringify(serializableStakes))
      console.log('Stakes stored successfully')
      
      // Trigger update event for all components
      window.dispatchEvent(new CustomEvent(STAKE_UPDATE_EVENT, { detail: { stakes } }))
      console.log('Stake update event dispatched')
    } catch (error) {
      console.error('Error storing stakes:', error)
    }
  }

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
      // Mock blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newAppId = BigInt(Math.floor(Math.random() * 1000000000) + 1000000000)
      console.log('Creating challenge with App ID:', newAppId)
      
      // Store the stake record
      const newStake: UserStake = {
        appId: newAppId,
        stakeAmount,
        deadline,
        status: 'joined',
        proofSubmitted: false,
        challengeType: 'individual'
      }

      console.log('New stake to store:', newStake)
      const currentStakes = getStoredStakes()
      console.log('Current stakes before adding:', currentStakes)
      const updatedStakes = [...currentStakes, newStake]
      storeStakes(updatedStakes)

      alert(`Challenge created! App ID: ${newAppId}`)
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
      // Mock blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Store the stake record
      const newStake: UserStake = {
        appId,
        stakeAmount,
        deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
        status: 'joined',
        proofSubmitted: false,
        challengeType: 'individual'
      }

      const currentStakes = getStoredStakes()
      storeStakes([...currentStakes, newStake])

      alert(`Successfully joined challenge with ${stakeAmount} ALGO!`)
    } catch (err) {
      setError(`Failed to join challenge: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }, [activeAddress])

  const createCircle = useCallback(async (
    name: string,
    stakeAmount: number,
    maxParticipants: number
  ) => {
    if (!activeAddress) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Mock blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newAppId = BigInt(Math.floor(Math.random() * 1000000000) + 1000000000)
      console.log('Creating circle with App ID:', newAppId)

      // Store the circle record
      const newStake: UserStake = {
        appId: newAppId,
        stakeAmount,
        deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        status: 'joined',
        proofSubmitted: false,
        challengeType: 'circle',
        circleName: name
      }

      console.log('New circle to store:', newStake)
      const currentStakes = getStoredStakes()
      console.log('Current stakes before adding circle:', currentStakes)
      const updatedStakes = [...currentStakes, newStake]
      storeStakes(updatedStakes)

      alert(`Study circle "${name}" created! Share App ID: ${newAppId} with friends.`)
    } catch (err) {
      setError(`Failed to create circle: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }, [activeAddress])

  const joinCircle = useCallback(async (circleId: string, stakeAmount: number) => {
    if (!activeAddress) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const appId = BigInt(circleId)
      await joinChallenge(appId, stakeAmount)
      
      alert(`Successfully joined study circle!`)
    } catch (err) {
      setError(`Failed to join circle: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }, [joinChallenge])

  const submitProof = useCallback(async (
    appId: bigint,
    proofFile: File,
    description: string
  ) => {
    if (!activeAddress) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Mock IPFS upload
      const proofUrl = `ipfs://mock-hash-${Date.now()}`

      // Update stake record
      const currentStakes = getStoredStakes()
      const updatedStakes = currentStakes.map(stake => 
        stake.appId === appId 
          ? { ...stake, proofSubmitted: true, proofUrl }
          : stake
      )
      storeStakes(updatedStakes)

      alert('Proof submitted successfully! Waiting for verification.')
    } catch (err) {
      setError(`Failed to submit proof: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }, [activeAddress])

  const withdrawStake = useCallback(async (appId: bigint) => {
    if (!activeAddress) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Mock blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update stake record
      const currentStakes = getStoredStakes()
      const updatedStakes = currentStakes.map(stake => 
        stake.appId === appId 
          ? { ...stake, status: 'withdrawn' as const }
          : stake
      )
      storeStakes(updatedStakes)

      alert('Stake withdrawn successfully!')
    } catch (err) {
      setError(`Failed to withdraw stake: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }, [activeAddress])

  const getUserStakes = useCallback(async (): Promise<UserStake[]> => {
    console.log('getUserStakes called, activeAddress:', activeAddress)
    const stakes = getStoredStakes()
    console.log('Returning stakes:', stakes)
    return stakes
  }, [activeAddress])

  return {
    createChallenge,
    joinChallenge,
    createCircle,
    joinCircle,
    submitProof,
    withdrawStake,
    getUserStakes,
    loading,
    error,
    STAKE_UPDATE_EVENT
  }
}
