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

        # ================================
    # ISSUE #5: Verify Work (Creator Only)
    # ================================
    @abimethod
    def verify_participant(self, participant: Account, is_valid: bool) -> None:
        """
        The Creator marks a participant as 'Verified' (Winner) or 'Failed' (Loser).
        """
        # 1. Only the creator can verify
        assert Txn.sender == self.creator.value, "Only creator can verify"
        
        # 2. Update Local State for the participant
        # We use a bitmask or simple integer. Here we set it to 2 for 'Verified'.
        # 0 = Nothing, 1 = Joined, 2 = Verified
        if is_valid:
            self.participant_data[participant] = UInt64(2)
        else:
            # Reset them to 0 (or keep at 1 to show they failed)
            self.participant_data[participant] = UInt64(0)

    # ================================
    # ISSUE #5: Distribute Payout (Withdraw)
    # ================================
    @abimethod
    def distribute_payout(self) -> None:
        """
        Winner calls this to claim their reward.
        """
        # 1. Check if user is Verified (Value == 2)
        assert self.participant_data[Txn.sender] == UInt64(2), "You are not verified!"
        
        # 2. Send the stake back to the user (Inner Transaction)
        itxn.Payment(
            receiver=Txn.sender,
            amount=self.stake_amount.value,
            fee=0 # Contract covers fee
        ).submit()

        # 3. Mark as withdrawn (Set state to 3 so they can't claim twice)
        self.participant_data[Txn.sender] = UInt64(3)
        
        # 4. Update Global Stats
        self.total_pooled_stake.value -= self.stake_amount.value
        self.current_participants.value -= 1

        @arc4.abimethod
        def withdraw(self) -> None:
            # 1. Check if Deadline has passed
            assert Global.latest_timestamp > self.deadline, "Challenge is still active"
            
            # 2. Check if Sender is a Verified Winner (Local State = 2)
            # (Assuming 0=None, 1=Pending, 2=Verified)
            is_verified, exists = op.App.localGetEx(Txn.sender, self.app.id, b"status")
            assert exists and is_verified == UInt64(2), "You are not a verified winner"

            # 3. Check if User has already claimed (Prevent double dipping)
            # We use a trick: If they claim, we set their status to 3 (Claimed)
            
            # 4. Calculate The Payout
            # Logic: Total Balance / Total Winners
            # Note: In a real app, we track 'total_winners' in a Global Int.
            # For this hackathon, we will use a simplified "Equal Drain" strategy:
            # Payout = Current_Balance / Remaining_Winners_Count
            
            # READ GLOBAL STATE FOR WINNER COUNT (You must add this counter to verify_participant)
            total_winners = self.total_winners
            assert total_winners > 0, "No winners"
            
            # Calculate Share
            current_balance = self.app.account.balance
            # We reserve min balance (0.1A) so contract doesn't die
            available_balance = current_balance - 100_000 
            payout_amount = available_balance // total_winners

            # 5. Send Payment
            itxn.Payment(
                receiver=Txn.sender,
                amount=payout_amount,
                fee=0 # The caller pays the fee
            ).submit()

            # 6. Mark as Claimed (Set Local State to 3)
            op.App.localPut(Txn.sender, b"status", UInt64(3))
            
            # 7. Decrement Winner Count (So the math works for the next person)
            self.total_winners -= 1