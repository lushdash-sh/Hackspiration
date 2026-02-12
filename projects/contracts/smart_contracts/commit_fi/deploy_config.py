import logging
import time
import algokit_utils
from smart_contracts.artifacts.commit_fi.commit_fi_client import (
    CommitFiFactory, 
    CreateChallengeArgs, 
    CommitFiMethodCallCreateParams
)

logger = logging.getLogger(__name__)

def deploy() -> None:
    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer_ = algorand.account.from_environment("DEPLOYER")

    # Initialize the Factory
    factory = algorand.client.get_typed_app_factory(
        CommitFiFactory, default_sender=deployer_.address
    )

    # --------------------------------------------------------
    # FIXED: Calculate valid inputs for the 'create' method
    # --------------------------------------------------------
    
    # 1. Deadline: Must be in the future (e.g., 30 days from now)
    current_time = int(time.time())
    future_deadline = current_time + (30 * 24 * 60 * 60) # 30 days in seconds

    # 2. Stake Amount: 10 ALGO (in microAlgos)
    stake_amount = 10 * 1_000_000

    # 3. Max Participants: 50 people
    max_participants = 50

    # Deploy the Contract with arguments
    # We use 'create_params' and pass the specific 'CreateChallengeArgs' object
    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
        create_params=CommitFiMethodCallCreateParams(
            args=CreateChallengeArgs(
                stake_amount_param=stake_amount,
                deadline_param=future_deadline,
                max_participants_param=max_participants
            )
        )
    )

    # Fund the contract with 1 ALGO (Standard practice for storage costs)
    if result.operation_performed in [
        algokit_utils.OperationPerformed.Create,
        algokit_utils.OperationPerformed.Replace,
    ]:
        algorand.send.payment(
            algokit_utils.PaymentParams(
                amount=algokit_utils.AlgoAmount(algo=1),
                sender=deployer_.address,
                receiver=app_client.app_address,
            )
        )
        logger.info(
            f"Deployed CommitFi app {app_client.app_id} to address {app_client.app_address}"
        )