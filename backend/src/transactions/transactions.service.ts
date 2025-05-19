import { Injectable } from "@nestjs/common";
import { TransactionsRepository } from "./transactions.repository";

@Injectable()
export class TransactionsService {
    constructor(private readonly transactionsRepository: TransactionsRepository) { }
    getTransactions() {
        return this.transactionsRepository.findTransactions();
    }

    bulkCreateTransactions(transactions: any[]) {
        return this.transactionsRepository.bulkCreateTransactions(transactions);
    }

}