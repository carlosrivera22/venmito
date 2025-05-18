import { Body, Controller, Get, Post } from "@nestjs/common";
import { PromotionsService } from "./promotions.service";

@Controller("promotions")
export class PromotionsController {
    constructor(private readonly promotionsService: PromotionsService) { }

    @Get()
    async getPromotions() {
        return this.promotionsService.getPromotions()
    }

    @Post("upload")
    async bulkUpload(@Body() promotionsData: any[]) {
        return this.promotionsService.bulkCreate(promotionsData)
    }
}