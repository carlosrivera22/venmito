import { Injectable } from "@nestjs/common";
import { PromotionsRepository } from "./promotions.repository";

@Injectable()
export class PromotionsService {
    constructor(private readonly promotionsRepository: PromotionsRepository) { }

    getPromotions() {
        return this.promotionsRepository.findPromotions();
    }
}