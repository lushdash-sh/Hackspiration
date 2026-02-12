# Frontend-Backend Integration Guide

## Prerequisites

1. **Smart Contract Deployed**: Ensure your CommitFi smart contract is deployed to TestNet
2. **Environment Variables**: Configure your environment properly
3. **Wallet Setup**: Have Pera Wallet or similar installed

## Step 1: Environment Setup

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
# For TestNet
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=443
VITE_ALGOD_TOKEN=
VITE_ALGOD_NETWORK=testnet

VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud
VITE_INDEXER_PORT=443
VITE_INDEXER_TOKEN=
```

## Step 2: Update App IDs

Replace the mock App IDs in your components with real deployed App IDs:

### In `StudyCircle.tsx`:
```typescript
const circles = [
  { 
    id: 1, 
    name: 'DSA Masters', 
    appId: BigInt(YOUR_REAL_APP_ID_1) // Replace with real App ID
  },
  // ... other circles
]
```

### In `FutureSelfVault.tsx`:
```typescript
const vaults = [
  { 
    id: 1, 
    goal: 'Master React Development', 
    appId: BigInt(YOUR_REAL_APP_ID_2) // Replace with real App ID
  },
  // ... other vaults
]
```

### In `CommitFi.tsx`:
```typescript
const APP_ID = YOUR_REAL_MAIN_APP_ID // Replace with real App ID
```

## Step 3: Deploy Smart Contracts

1. Navigate to contracts directory:
```bash
cd projects/contracts
```

2. Deploy to TestNet:
```bash
algokit project deploy testnet
```

3. Note the App IDs from the deployment output

## Step 4: Test Integration

1. Start the frontend:
```bash
cd projects/frontend
npm run dev
```

2. Connect your wallet (Pera, Defly, etc.)

3. Test each feature:
   - **Staking**: Create a new challenge
   - **Study Circle**: Join an existing circle
   - **Future Vault**: Create a time-locked vault
   - **Dashboard**: Join existing challenges

## Step 5: Smart Contract Method Mapping

### Frontend Actions → Smart Contract Methods

| Frontend Action | Smart Contract Method | Parameters |
|----------------|---------------------|------------|
| Create Stake | `create_challenge` | stakeAmount, deadline, maxParticipants |
| Join Challenge | `join_pool` | payment transaction |
| Verify Participant | `verify_participant` | participant address, isValid |
| Withdraw Funds | `distribute_payout` | (none) |

## Step 6: Error Handling

The integration includes comprehensive error handling:

- **Wallet Connection**: Prompts user to connect wallet if not connected
- **Transaction Failures**: Displays user-friendly error messages
- **Network Issues**: Handles Algorand network connectivity problems
- **Validation**: Validates inputs before sending transactions

## Step 7: Testing Checklist

- [ ] Wallet connects successfully
- [ ] Can create new challenges (Staking page)
- [ ] Can join existing challenges (Dashboard)
- [ ] Can join study circles (Study Circle page)
- [ ] Can create future vaults (Vault page)
- [ ] Error messages display correctly
- [ ] Loading states work properly
- [ ] Transaction confirmations appear

## Troubleshooting

### Common Issues

1. **"Please connect your wallet first"**
   - Ensure wallet is connected and on TestNet

2. **"Failed to create challenge"**
   - Check if App ID is correct
   - Verify environment variables
   - Ensure sufficient ALGO balance

3. **"Transaction Failed"**
   - Check wallet has enough ALGO for fees
   - Verify network connectivity
   - Check smart contract is deployed

### Debug Mode

Enable debug logging by updating the hook:
```typescript
// In useCommitFi.ts
console.log('Transaction details:', { appId, amount, sender })
```

## Next Steps

1. **Real Data Integration**: Connect to indexer for real-time data
2. **Enhanced UI**: Add loading animations and better feedback
3. **Error Recovery**: Implement retry mechanisms
4. **Analytics**: Track user interactions and success rates
