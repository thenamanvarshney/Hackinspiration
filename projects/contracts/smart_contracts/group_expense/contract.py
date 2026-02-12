from algopy import ARC4Contract, arc4, UInt64, Account, GlobalState, Txn, gtxn

class GroupExpense(ARC4Contract):
    def __init__(self) -> None:
        self.leader = GlobalState(Account)
        self.total_amount = GlobalState(UInt64)

    # --- THE FIX IS HERE ---
    # This allows the factory to deploy using a standard "Bare" transaction
    @arc4.baremethod(create="allow")
    def create(self) -> None:
        self.leader.value = Txn.sender
        self.total_amount.value = UInt64(0)

    # Also allow ABI creation if needed, just in case
    @arc4.abimethod(create="allow")
    def create_abi(self) -> None:
        self.leader.value = Txn.sender
        self.total_amount.value = UInt64(0)

    @arc4.abimethod
    def pay_share(self, payment: gtxn.PaymentTransaction) -> UInt64:
        assert payment.receiver == self.leader.value
        self.total_amount.value += payment.amount
        return self.total_amount.value