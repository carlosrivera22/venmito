import { Controller, Get } from "@nestjs/common";
import { TransfersService } from "./transfers.service";

@Controller("transfers")
export class TransfersController {
    constructor(private readonly transfersService: TransfersService) { }

    @Get()
    async getTransfers() {
        return await this.transfersService.getTransfers();
    }
}