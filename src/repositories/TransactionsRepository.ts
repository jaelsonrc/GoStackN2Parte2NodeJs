import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface Transactions {
  transactions: Transaction[];
  balance: Balance;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async all(): Promise<Transactions> {
    const list = await this.find({ relations: ['category'] });

    const transactions: Transactions = {
      transactions: list,
      balance: await this.getBalance(),
    };
    return transactions;
  }

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const incomes = transactions
      .filter(transaction => transaction.type === 'income')
      .map(transaction => Number(transaction.value)) || [0];

    const outcomes = transactions
      .filter(transaction => transaction.type === 'outcome')
      .map(transaction => Number(transaction.value)) || [0];

    const income = incomes.reduce((t, i) => t + i, 0);

    const outcome = outcomes.reduce((t, o) => t + o, 0);

    const balance: Balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }

  public async Delete(id: string): Promise<void> {
    this.createQueryBuilder()
      .delete()
      .from(Transaction)
      .where('id = :id', { id })
      .execute();
  }
}

export default TransactionsRepository;
