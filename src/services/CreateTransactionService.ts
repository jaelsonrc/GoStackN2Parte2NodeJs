/* eslint-disable no-console */
import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;

  value: number;

  type: 'income' | 'outcome';

  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    try {
      const transactionsRepository = getCustomRepository(
        TransactionsRepository,
      );

      const { total } = await transactionsRepository.getBalance();

      if (type === 'outcome') {
        const saldo = total - value;
        if (saldo < 0)
          throw new AppError('Transaction without a valid balance');
      }

      const categoriesRepository = getRepository(Category);

      const categoryTitle = category;

      let categoryEntity = await categoriesRepository.findOne({
        where: { title: categoryTitle },
      });

      if (categoryEntity === undefined) {
        categoryEntity = categoriesRepository.create({ title: categoryTitle });
        await categoriesRepository.save(categoryEntity);
      }

      const transaction = transactionsRepository.create({
        title,
        value,
        type,
        category_id: categoryEntity.id,
      });

      await transactionsRepository.save(transaction);

      return transaction;
    } catch (err) {
      throw new AppError(err.message);
    }
  }
}

export default CreateTransactionService;
