import { Block } from './Block';
import { Transaction } from './Transaction';

export class Blockchain {
  public chain: Block[];
  private validators: Map<string, number>; // Validator address to stake mapping
  private balanceMap: Map<string, number>;
  private rewardPerBlock: number;

  private transactionsPool: any[]; // Pool of transactions

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.validators = new Map();
    this.balanceMap = new Map();
    this.rewardPerBlock = 10;

    this.transactionsPool = [];
  }

  createGenesisBlock(): Block {
    return new Block(0, '01/01/2020', 'Genesis Block', '0');
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  getBalance(address: string): number {
    return this.balanceMap.get(address) || 0;
  }

  addBlock(newBlock: Block): void {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  chooseValidator(): string | null {
    let totalStake = Array.from(this.validators.values()).reduce(
      (a, b) => a + b,
      0
    );
    let raffle = Math.random() * totalStake;
    let total = 0;

    for (let [validator, stake] of this.validators) {
      total += stake;
      if (raffle <= total) {
        return validator;
      }
    }

    return null; // In case no validator is chosen
  }

  addTransaction(transaction: any): void {
    this.transactionsPool.push(transaction);
  }

  getPendingTransactions(): Transaction[] {
    return this.transactionsPool;
  }

  updateBalance(address: string, amount: number): void {
    const currentBalance = this.balanceMap.get(address) || 0;
    this.balanceMap.set(address, currentBalance + amount);
  }

  validateTransaction(transaction: Transaction): boolean {
    const senderBalance = this.balanceMap.get(transaction.fromAddress) || 0;
    return senderBalance >= transaction.amount;
  }

  processTransactions(validatorAddress: string): void {
    let validator = this.validators.get(validatorAddress);
    if (!validator) {
      throw new Error('Validator not found');
    }

    this.transactionsPool.forEach((transaction) => {
      if (this.validateTransaction(transaction)) {
        this.updateBalance(transaction.fromAddress, -transaction.amount);
        this.updateBalance(transaction.toAddress, transaction.amount);
      }
    });

    // Here you can add more logic for transaction processing
    let block = new Block(
      this.chain.length,
      new Date().toISOString(),
      this.transactionsPool,
      this.getLatestBlock().hash
    );
    this.updateBalance(validatorAddress, this.rewardPerBlock);
    this.addBlock(block);
    this.transactionsPool = [];
  }

  // Adding and removing validators
  addValidator(validatorAddress: string, stake: number): void {
    this.validators.set(validatorAddress, stake);
  }

  removeValidator(validatorAddress: string): void {
    this.validators.delete(validatorAddress);
  }
}
