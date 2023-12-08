import { Block } from './Block';
import { Blockchain } from './Blockchain';
import { Transaction } from './Transaction';

export class Validator {
  private address: string;
  private blockchain: Blockchain;

  constructor(address: string, blockchain: Blockchain) {
    this.address = address;
    this.blockchain = blockchain;
  }

  stakeAmount(stake: number): boolean {
    const currentBalance = this.blockchain.getBalance(this.address);
    if (currentBalance < stake) {
      console.log('Insufficient balance to stake');
      return false;
    }

    this.blockchain.updateBalance(this.address, -stake);
    this.blockchain.addValidator(this.address, stake);
    return true;
  }

  createBlock(): void {
    if (this.blockchain.chooseValidator() === this.address) {
      // Select and validate transactions from the transaction pool
      const transactions: Transaction[] =
        this.blockchain.getPendingTransactions();

      // You might want to include additional validations here
      const validTransactions = transactions.filter((tx) =>
        this.validateTransaction(tx)
      );

      // Create a new block
      const previousBlock = this.blockchain.getLatestBlock();
      const newBlock = new Block(
        previousBlock.index + 1, // Next index
        new Date().toISOString(), // Current timestamp
        validTransactions, // Valid transactions
        previousBlock.hash // Previous block's hash
      );

      // Add the new block to the blockchain
      this.blockchain.addBlock(newBlock);
    }
  }

  // Validator logic for verifying transactions and blocks
  validateTransaction(transaction: any): boolean {
    // Implement transaction validation logic
    return true;
  }

  validateBlock(block: Block): boolean {
    // Implement block validation logic
    return true;
  }
}
