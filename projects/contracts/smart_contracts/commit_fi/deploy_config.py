import logging
import algokit_utils
from smart_contracts.artifacts.commit_fi.commit_fi_client import CommitFiFactory

logger = logging.getLogger(__name__)

def deploy() -> None:
    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer_ = algorand.account.from_environment("DEPLOYER")

    # Initialize the Factory
    factory = algorand.client.get_typed_app_factory(
        CommitFiFactory, default_sender=deployer_.address
    )

    # Deploy the Contract
    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
    )

    # Fund the contract with 1 ALGO (Optional but recommended for MBR)
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