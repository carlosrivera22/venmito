import { Injectable } from "@nestjs/common";

@Injectable()
export class PromotionsService {
    getPromotions() {
        return JSON.stringify(['Promotion 1', 'Promotion 2', 'Promotion 3']);
    }
}