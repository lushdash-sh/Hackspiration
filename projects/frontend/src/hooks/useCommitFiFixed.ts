import { useState, useCallback } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import algokit from '@algorandfoundation/algokit-utils'
import { CommitFiClient } from '../contracts/CommitFiClient'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface UseCommitFiReturn {
  createChallenge: (stakeAmount: number, deadline: number, maxParticipants: number) => Promise<void>
  joinChallenge: (appId: bigint, stakeAmount: number) => Promise<void>
  verifyParticipant: (appId: bigint, participant: string, isValid: boolean) => Promise<void>
  distributePayout: (appId: bigint) => Promise<void>
  getChallengeState: (appId: bigint) => Promise<any>
  loading: boolean
  error: string | null
}

export const useCommitFiFixed = (): UseCommitFiReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { activeAddress, transactionSigner } = useWallet()

  const getClient = useCallback(async (appId: bigint) => {
    const algodConfig = getAlgodConfigFromViteEnvironment()
    const algorand = algokit.AlgorandClient.fromConfig({ algodConfig })
    algorand.setDefaultSigner(transactionSigner)

    return new CommitFiClient({
      algorand,
      appId,
      defaultSender: activeAddress!,
    })
  }, [transactionSigner, activeAddress])

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
      const algodConfig = getAlgodConfigFromViteEnvironment()
      const algorand = algokit.AlgorandClient.fromConfig({ algodConfig })
      algorand.setDefaultSigner(transactionSigner)

      // Create factory for deploying new app
      const factory = algorand.client.getTypedAppFactory(CommitFiClient, {
        defaultSender: activeAddress,
      })

      const stakeInMicroAlgo = stakeAmount * 1_000_000

      // Deploy new app with create_challenge
      const { appClient } = await factory.deploy({
        createParams: {
          method: 'create_challenge',
          args: {
            stakeAmountParam: stakeInMicroAlgo,
            deadlineParam: deadline,
            maxParticipantsParam: maxParticipants,
          },
        },
      })

      // Fund the contract
      await algorand.send.payment({
        amount: algokit.AlgoAmount.algos(1),
        sender: activeAddress,
        receiver: appClient.appAddress,
      })

      alert(`Challenge created! App ID: ${appClient.appId}`)
    } catch (err) {
      setError(`Failed to create challenge: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }, [activeAddress, transactionSigner])

  const joinChallenge = useCallback(async (appId: bigint, stakeAmount: number) => {
    if (!activeAddress) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const client = await getClient(appId)
      const stakeInMicroAlgo = stakeAmount * 1_000_000

      // Create payment transaction
      const paymentTxn = await client.algorand.createTransaction.payment({
        sender: activeAddress,
        receiver: client.appAddress,
        amount: algokit.microAlgos(stakeInMicroAlgo)
      })

      // Call join_pool method
      await client.send.optIn.joinPool({
        args: { payment: paymentTxn },
        extraFee: algokit.microAlgos(2000)
      })

      alert(`Successfully joined challenge with ${stakeAmount} ALGO!`)
    } catch (err) {
      setError(`Failed to join challenge: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }, [activeAddress, getClient])

  const verifyParticipant = useCallback(async (
    appId: bigint,
    participant: string,
    isValid: boolean
  ) => {
    if (!activeAddress) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const client = await getClient(appId)
      await client.send.verifyParticipant({
        args: {
          participant,
          isValid
        }
      })

      alert(`Participant ${isValid ? 'verified' : 'rejected'} successfully!`)
    } catch (err) {
      setError(`Failed to verify participant: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }, [activeAddress, getClient])

  const distributePayout = useCallback(async (appId: bigint) => {
    if (!activeAddress) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const client = await getClient(appId)
      await client.send.distributePayout()

      alert('Payout distributed successfully!')
    } catch (err) {
      setError(`Failed to distribute payout: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }, [activeAddress, getClient])

  const getChallengeState = useCallback(async (appId: bigint) => {
    try {
      const client = await getClient(appId)
      const globalState = await client.state.global.getAll()
      return globalState
    } catch (err) {
      setError(`Failed to get challenge state: ${(err as Error).message}`)
      return null
    }
  }, [activeAddress, getClient])

  return {
    createChallenge,
    joinChallenge,
    verifyParticipant,
    distributePayout,
    getChallengeState,
    loading,
    error,
  }
}
