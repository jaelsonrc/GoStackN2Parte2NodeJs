import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer({ dest: 'tmp/' });

transactionsRouter.get('/', async (request, response) => {
  try {
    const repository = getCustomRepository(TransactionsRepository);
    return response.json(await repository.all());
  } catch (err) {
    return response.status(400).json({ message: err.message, status: 'error' });
  }
});

transactionsRouter.post('/', async (request, response) => {
  try {
    const { title, value, type, category } = request.body;

    const service = new CreateTransactionService();

    const transaction = await service.execute({ title, value, type, category });

    return response.json(transaction);
  } catch (err) {
    return response.status(400).json({ message: err.message, status: 'error' });
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const service = new DeleteTransactionService();

    await service.execute(id);

    return response.status(204).json();
  } catch (err) {
    return response.status(400).json({ message: err.message, status: 'error' });
  }
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    try {
      const service = new ImportTransactionsService();
     // const filePath = `${request.file.path}.csv`;
      const transactions = await service.execute(request.file.path);

      return response.json(transactions);
    } catch (err) {
      return response
        .status(400)
        .json({ message: err.message, status: 'error' });
    }
  },
);

export default transactionsRouter;
