import { Body, Controller, Get, Post } from "@nestjs/common";
import { TransfersService } from "./transfers.service";

@Controller("transfers")
export class TransfersController {
    constructor(private readonly transfersService: TransfersService) { }

    @Get()
    async getTransfers() {
        return await this.transfersService.getTransfers();
    }

    @Post("upload")
    async bulkUpload(@Body() transfersData: any[]) {
        return await this.transfersService.bulkCreate(transfersData);
    }
}