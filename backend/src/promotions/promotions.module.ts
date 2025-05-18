import { Module } from "@nestjs/common";
import { PromotionsController } from "./promotions.controller";
import { PromotionsService } from "./promotions.service";
import { PromotionsRepository } from "./promotions.repository";

@Module({
    controllers: [PromotionsController],
    providers: [PromotionsService, PromotionsRepository],
    exports: [],
})

export class PromotionsModule { }