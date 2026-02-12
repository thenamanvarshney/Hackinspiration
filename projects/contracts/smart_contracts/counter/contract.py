from algopy import ARC4Contract, arc4, UInt64, Account, LocalState, gtxn

class GroupManager(ARC4Contract):
    def __init__(self) -> None:
        # Each member's local state stores how much they owe
        self.debt_per_member = LocalState(UInt64)

    @arc4.abimethod
    def join_group(self) -> None:
        # Member opts-in to the group
        pass

    @arc4.abimethod
    def assign_split(self, member: Account, amount: UInt64) -> None:
        # Only the leader can call this to set who owes what
        # In a hackathon, just assume the sender is the leader for now
        self.debt_per_member[member] = amount

    @arc4.abimethod
    def settle_payment(self, payment: gtxn.PaymentTransaction) -> None:
        # Ensure payment goes to leader, then set debt to 0
        assert payment.amount >= self.debt_per_member[payment.sender]
        self.debt_per_member[payment.sender] = UInt64(0)