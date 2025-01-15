import { User, Bank, GlobalRegistry, BankAccountId, UserId } from '../../index';

export interface TestFixtures {
  alice: User;
  aliceUserId: UserId;
  bob: User;
  bobUserId: UserId;
  bank: Bank;
  bankAllowsNegative: Bank;
  aliceAccountId: BankAccountId;
  aliceAccountAllowsNegativeId: BankAccountId;
  bobAccountId: BankAccountId;
}

export class TestFactory {
  static createFixtures(): TestFixtures {
    GlobalRegistry.clear();

    const bank = Bank.create();
    const bankAllowsNegative = Bank.create({ isNegativeAllowed: true });

    const aliceAccount = bank.createAccount(1000);
    const aliceAccountAllowsNegative = bankAllowsNegative.createAccount(200);
    const bobAccount = bank.createAccount(500);

    const alice = User.create('Alice', [aliceAccount.getId(), aliceAccountAllowsNegative.getId()]);
    const bob = User.create('Bob', [bobAccount.getId()]);

    return {
      alice,
      aliceUserId: alice.getId(),
      bob,
      bobUserId: bob.getId(),
      bank,
      bankAllowsNegative,
      aliceAccountId: aliceAccount.getId(),
      aliceAccountAllowsNegativeId: aliceAccountAllowsNegative.getId(),
      bobAccountId: bobAccount.getId()
    };
  }

  static createBank(options?: { isNegativeAllowed?: boolean }): Bank {
    return Bank.create(options);
  }

  static createUser(name: string, accountIds: BankAccountId[]): User {
    return User.create(name, accountIds);
  }
}