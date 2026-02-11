from algopy import *
from algopy.arc4 import abimethod


class CommitFi(ARC4Contract):
    """
    CommitFi Smart Contract - Challenge commitment platform
    Issue #1: Global and Local State Schema Implementation
    """

    # ================================
    # GLOBAL STATE SCHEMA
    # ================================
    
    # Contract creator address who initializes the challenge
    creator: GlobalState[Account]
    
    # Required stake amount for each participant (in microAlgos)
    stake_amount: GlobalState[UInt64]
    
    # Challenge deadline timestamp (Unix timestamp)
    deadline: GlobalState[UInt64]
    
    # Maximum number of participants allowed
    max_participants: GlobalState[UInt64]
    
    # Current number of participants who have joined
    current_participants: GlobalState[UInt64]
    
    # Total amount of ALGOs staked by all participants
    total_pooled_stake: GlobalState[UInt64]
    
    # Challenge status: 0=SETUP, 1=ACTIVE, 2=COMPLETED, 3=CANCELLED
    challenge_status: GlobalState[UInt64]

    # ================================
    # LOCAL STATE SCHEMA
    # ================================
    
    # Packed UInt64 storing participant-specific data:
    # bit 0: has_joined (1 if participant has joined challenge)
    # bit 1: has_submitted_proof (1 if proof submitted)
    # bit 2: is_verified (1 if proof verified)
    # bits 3-7: reputation_score (0-31, 5 bits)
    # bits 8-63: reserved for future use
    participant_data: LocalState[UInt64]

