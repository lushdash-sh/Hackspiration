from algopy import *
from algopy.arc4 import abimethod

class CommitFi(ARC4Contract):
    """
    CommitFi Smart Contract - Challenge commitment platform
    """

    def __init__(self) -> None:
        # ================================
        # GLOBAL STATE SCHEMA
        # ================================
        self.creator = GlobalState(Account)
        self.stake_amount = GlobalState(UInt64)
        self.deadline = GlobalState(UInt64)
        self.max_participants = GlobalState(UInt64)
        self.current_participants = GlobalState(UInt64)
        self.total_pooled_stake = GlobalState(UInt64)
        self.challenge_status = GlobalState(UInt64) # 0=SETUP, 1=ACTIVE

        # ================================
        # LOCAL STATE SCHEMA
        # ================================
        # 1 = Joined
        self.participant_data = LocalState(UInt64)

    # ================================
    # ISSUE #3: Create Challenge
    # ================================
    @abimethod(allow_actions=["NoOp"], create="require")
    def create_challenge(
        self,
        stake_amount_param: UInt64,
        deadline_param: UInt64,
        max_participants_param: UInt64
    ) -> None:
        
        # Validation
        assert stake_amount_param > UInt64(0), "Stake amount must be > 0"
        assert max_participants_param > UInt64(0), "Max participants must be > 0"
        assert deadline_param > Global.latest_timestamp, "Deadline must be in the future"
        
        # Initialize Global State (Using .value)
        self.creator.value = Txn.sender
        self.stake_amount.value = stake_amount_param
        self.deadline.value = deadline_param
        self.max_participants.value = max_participants_param
        self.current_participants.value = UInt64(0)
        self.total_pooled_stake.value = UInt64(0)
        self.challenge_status.value = UInt64(1) # Set to ACTIVE immediately

    # ================================
    # ISSUE #4: Join Pool
    # ================================
    @abimethod(allow_actions=["OptIn"])
    def join_pool(self, payment: gtxn.PaymentTransaction) -> None:
        """
        User opts in and sends stake to join.
        """
        # 1. Verify the payment to the contract
        assert payment.receiver == Global.current_application_address, "Payment must be to contract"
        assert payment.amount == self.stake_amount.value, "Incorrect stake amount"
        
        # 2. Verify Challenge Status
        assert self.challenge_status.value == UInt64(1), "Challenge is not active"
        
        # 3. Verify Deadline
        assert Global.latest_timestamp < self.deadline.value, "Challenge has ended"
        
        # 4. Verify Capacity
        assert self.current_participants.value < self.max_participants.value, "Challenge is full"
        
        # 5. Update Global State (Using .value)
        self.current_participants.value += 1
        self.total_pooled_stake.value += payment.amount
        
        # 6. Update Local State
        # Mark user as 'Joined' (1)
        self.participant_data[Txn.sender] = UInt64(1)
