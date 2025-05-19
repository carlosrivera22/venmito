import { Module } from "@nestjs/common";
import { TransactionsController } from "./transactions.controller";
import { TransactionsRepository } from "./transactions.repository";
import { TransactionsService } from "./transactions.service";

@Module({
    controllers: [TransactionsController],
    providers: [TransactionsService, TransactionsRepository],
    exports: []
})

export class TransactionsModule { }