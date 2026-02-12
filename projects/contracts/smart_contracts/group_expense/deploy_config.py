import logging
from smart_contracts.artifacts.group_expense.group_expense_client import GroupExpenseFactory
from algokit_utils import AlgorandClient

logger = logging.getLogger(__name__)

def deploy() -> None:
    # 1. Connect
    algorand = AlgorandClient.default_localnet()
    deployer = algorand.account.localnet_dispenser()
    algorand.set_default_signer(deployer.signer)
    
    # 2. Setup Factory
    factory = GroupExpenseFactory(
        algorand=algorand, 
        default_sender=deployer.address
    )
    
    # 3. Deploy
    # THE FIX: Unpack the tuple (client, result)
    app_client, result = factory.deploy(
        on_schema_break="replace", 
        on_update="replace"
    )
    
    # Now this will work because app_client is the actual object
    logger.info(f"✅ SUCCESS: App ID {app_client.app_id} is live!")