from algopy import *
from algopy.arc4 import abimethod


class CommitFi(ARC4Contract):
    """
    CommitFi Smart Contract - Challenge commitment platform
    Issue #1: Global and Local State Schema Implementation
    Issue #3: Create challenge logic implementation
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

    # ================================
    # EXTERNAL METHODS
    # ================================

    @abimethod
    def create_challenge(
        self,
        stake_amount_param: UInt64,
        deadline_param: UInt64,
        max_participants_param: UInt64
    ) -> None:
        """
        Initialize a new commitment challenge
        Issue #3: Create challenge logic implementation
        """
        
        # Validation: stake amount must be greater than 0
        assert stake_amount_param > UInt64(0), "Stake amount must be > 0"
        
        # Validation: max participants must be greater than 0
        assert max_participants_param > UInt64(0), "Max participants must be > 0"
        
        # Validation: deadline must be in the future
        assert deadline_param > Global.latest_timestamp, "Deadline must be in the future"
        
        # TODO: Initialize global state values - syntax needs to be resolved
        # self.creator = Txn.sender
        # self.stake_amount = stake_amount_param
        # self.deadline = deadline_param
        # self.max_participants = max_participants_param
        # self.current_participants = UInt64(0)
        # self.total_pooled_stake = UInt64(0)
        # self.challenge_status = UInt64(0)
