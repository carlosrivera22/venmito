import { Body, Controller, Get, Post } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";

@Controller("transactions")
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Get()
    async getTransactions() {
        return this.transactionsService.getTransactions();
    }

    @Post("upload")
    async bulkUpload(@Body() transactionsData: any[]) {
        return await this.transactionsService.bulkCreateTransactions(transactionsData);
    }
}