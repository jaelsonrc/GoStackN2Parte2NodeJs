import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface TransactionDTO {
  title: string;

  value: number;

  type: 'income' | 'outcome';

  category: string;
}

class ImportTransactionsService {
  async loadCSV(filePath: string): Promise<TransactionDTO[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: any[] = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const transaction: TransactionDTO[] = [];

    lines.forEach(line => {
      transaction.push({
        title: line[0],
        type: line[1],
        value: Number(line[2]),
        category: line[3],
      });
    });

    return transaction;
  }

  async execute(filePath: string): Promise<Transaction[]> {
    const datas = await this.loadCSV(filePath);

    const service = new CreateTransactionService();

    const transactions: Transaction[] = [];

    let promiseChain = Promise.resolve();
    datas.forEach(row => {
      promiseChain = promiseChain.then(async () => {
        transactions.push(await service.execute(row));
      });
    });

    await promiseChain;

    return transactions;
  }
}

export default ImportTransactionsService;
