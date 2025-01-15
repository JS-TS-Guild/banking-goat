class GlobalRegistry {
  private static registry: Map<string, any> = new Map();

  static clear() {
    this.registry.clear();
  }

  static register(key: string, value: any) {
    this.registry.set(key, value);
  }

  static get(key: string) {
    return this.registry.get(key);
  }
}

type BankAccountId = string;
type UserId = string;

class BankAccount {
  private id: BankAccountId;
  private balance: number;
  private isNegativeAllowed: boolean;

  constructor(id: BankAccountId, balance: number, isNegativeAllowed: boolean) {
    this.id = id;
    this.balance = balance;
    this.isNegativeAllowed = isNegativeAllowed;
  }

  getId(): BankAccountId {
    return this.id;
  }

  getBalance(): number {
    return this.balance;
  }

  deposit(amount: number) {
    this.balance += amount;
  }

  withdraw(amount: number) {
    if (!this.isNegativeAllowed && this.balance < amount) {
      throw new Error('Insufficient funds');
    }
    this.balance -= amount;
  }
}

class Bank {
  private id: string;
  private accounts: Map<BankAccountId, BankAccount> = new Map();
  private isNegativeAllowed: boolean;

  private constructor(id: string, isNegativeAllowed: boolean) {
    this.id = id;
    this.isNegativeAllowed = isNegativeAllowed;
  }

  static create(options?: { isNegativeAllowed?: boolean }): Bank {
    const id = Math.random().toString(36).substr(2, 9);
    const isNegativeAllowed = options?.isNegativeAllowed ?? false;
    return new Bank(id, isNegativeAllowed);
  }

  getId(): string {
    return this.id;
  }

  createAccount(initialBalance: number): BankAccount {
    const id = Math.random().toString(36).substr(2, 9);
    const account = new BankAccount(id, initialBalance, this.isNegativeAllowed);
    this.accounts.set(id, account);
    return account;
  }

  getAccount(accountId: BankAccountId): BankAccount {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    return account;
  }

  send(fromUserId: UserId, toUserId: UserId, amount: number, toBankId?: string) {
    const fromUser = GlobalRegistry.get(fromUserId) as User;
    const toUser = GlobalRegistry.get(toUserId) as User;
    const fromAccount = this.getAccount(fromUser.getPrimaryAccountId());
    const toAccount = toBankId ? GlobalRegistry.get(toBankId).getAccount(toUser.getPrimaryAccountId()) : this.getAccount(toUser.getPrimaryAccountId());

    fromAccount.withdraw(amount);
    toAccount.deposit(amount);
  }
}

class User {
  private id: UserId;
  private name: string;
  private accounts: BankAccountId[];

  private constructor(id: UserId, name: string, accounts: BankAccountId[]) {
    this.id = id;
    this.name = name;
    this.accounts = accounts;
  }

  static create(name: string, accounts: BankAccountId[]): User {
    const id = Math.random().toString(36).substr(2, 9);
    const user = new User(id, name, accounts);
    GlobalRegistry.register(id, user);
    return user;
  }

  getId(): UserId {
    return this.id;
  }

  getPrimaryAccountId(): BankAccountId {
    return this.accounts[0];
  }
}

class TransactionService {
  // Define any necessary methods for TransactionService
}

interface TestFixtures {
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

class TestFactory {
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

// Exporting the necessary classes and types
export { GlobalRegistry, BankAccount, Bank, User, TestFactory, BankAccountId, UserId, TestFixtures, TransactionService };